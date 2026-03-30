require("dotenv").config();
const fs        = require("fs");
const path      = require("path");
const { Pinecone }                       = require("@pinecone-database/pinecone");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Document }                       = require("@langchain/core/documents");
const { PDFDocument }                    = require("pdf-lib");
const VoyageAIClient                     = require("voyageai").VoyageAIClient;

// ═══════════════════════════════════════════════════════════════
// ⚙️  KONFIGURASI
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  // Pinecone
  upsertBatchSize: 100,

  // Voyage AI
  // voyage-law-2 didesain khusus dokumen hukum — tidak ada safety filter
  voyageModel:    "voyage-law-2",
  embeddingDim:   1024,
  // Voyage free tier: 50 juta token/bulan, max 128 doc per request
  embedBatchSize: 10,
  delayBetweenEmbedBatches: 5000, // 5 detik sudah cukup, Voyage tidak agresif

  // LlamaParse — split PDF per N halaman agar tidak timeout
  pdfChunkSize: 25,

  // Retry
  maxRetries: 3,

  // Checkpoint — simpan progress ke file lokal
  // Kalau script terhenti di tengah, run ulang akan lanjut dari sini
  checkpointFile: path.join(__dirname, "../.ingest-checkpoint.json"),
};

// ═══════════════════════════════════════════════════════════════
// 🛠️  HELPERS
// ═══════════════════════════════════════════════════════════════
function log(emoji, msg, data = null) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${emoji}  ${msg}`);
  if (data !== null) console.log("         ↳", JSON.stringify(data, null, 2));
}

function logSeparator(title = "") {
  const line = "─".repeat(54);
  console.log(`\n${line}`);
  if (title) { console.log(`  ${title}`); console.log(line); }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Checkpoint helpers ───────────────────────────────────────
function loadCheckpoint() {
  try {
    if (fs.existsSync(CONFIG.checkpointFile)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.checkpointFile, "utf8"));
      log("💾", `Checkpoint ditemukan — ${data.embeddedCount} chunk sudah di-embed sebelumnya`);
      return data;
    }
  } catch (_) {}
  return { embeddedCount: 0, vectors: [] };
}

function saveCheckpoint(embeddedCount, vectors) {
  fs.writeFileSync(
    CONFIG.checkpointFile,
    JSON.stringify({ embeddedCount, vectors }, null, 2),
    "utf8"
  );
}

function clearCheckpoint() {
  if (fs.existsSync(CONFIG.checkpointFile)) {
    fs.unlinkSync(CONFIG.checkpointFile);
    log("🗑️ ", "Checkpoint dihapus — proses selesai sempurna");
  }
}

// ═══════════════════════════════════════════════════════════════
// PHASE 0 — Cek environment variables
// ═══════════════════════════════════════════════════════════════
function checkEnvVars() {
  logSeparator("PHASE 0 — Environment Check");
  const required = [
    "PINECONE_API_KEY",
    "PINECONE_INDEX_V2",
    "VOYAGEAI_API_KEY",
    "LLAMAPARSE_API_KEY",
  ];
  let allOk = true;

  for (const key of required) {
    const val = process.env[key];
    if (!val) {
      log("❌", `Missing: ${key}`);
      allOk = false;
    } else {
      log("✅", `${key} = ${val.slice(0, 8)}...`);
    }
  }

  if (!allOk) throw new Error("Ada env variable yang belum diisi di .env");
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1 — Cek Pinecone index
// ═══════════════════════════════════════════════════════════════
async function checkPineconeIndex(pc) {
  logSeparator("PHASE 1 — Pinecone Connection Check");
  const indexName = process.env.PINECONE_INDEX_V2;
  log("🔌", `Koneksi ke index: "${indexName}"...`);

  let info;
  try {
    info = await pc.describeIndex(indexName);
  } catch (err) {
    log("❌", `Gagal akses index "${indexName}".`);
    throw err;
  }

  log("📐", `Dimensi index : ${info.dimension}`);
  log("📏", `Metric        : ${info.metric}`);
  log("🟢", `Status        : ${info.status?.ready ? "READY" : "NOT READY"}`);

  if (!info.status?.ready) throw new Error("Pinecone index belum ready.");

  // Pastikan dimensi cocok dengan voyage-law-2
  if (info.dimension !== CONFIG.embeddingDim) {
    throw new Error(
      `Dimensi index (${info.dimension}) tidak cocok dengan voyage-law-2 (${CONFIG.embeddingDim}). ` +
      `Buat ulang index dengan dimensions: ${CONFIG.embeddingDim}`
    );
  }

  log("✅", `Dimensi cocok (${info.dimension}). Lanjut.`);
  return info.dimension;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2 — Test koneksi Voyage AI
// ═══════════════════════════════════════════════════════════════
async function checkVoyageAI(voyageClient) {
  logSeparator("PHASE 2 — Voyage AI Connection Check");
  log("🚢", `Test embedding ke Voyage AI (model: ${CONFIG.voyageModel})...`);

  let result;
  try {
    result = await voyageClient.embed({
      input:  ["test koneksi voyage ai"],
      model:  CONFIG.voyageModel,
    });
  } catch (err) {
    log("❌", `Gagal koneksi ke Voyage AI: ${err.message}`);
    throw err;
  }

  const dim = result.data[0].embedding.length;
  log("📐", `Dimensi embedding : ${dim}`);

  if (dim !== CONFIG.embeddingDim) {
    throw new Error(`Dimensi tidak cocok: ${dim} vs ${CONFIG.embeddingDim}`);
  }

  log("✅", `Voyage AI siap. Dimensi ${dim} cocok dengan Pinecone index.`);
  log("🛡️ ", "Tidak ada safety filter — semua pasal hukum akan diproses");
}

// ═══════════════════════════════════════════════════════════════
// PHASE 3 — Load PDF dengan LlamaParse
//
// LlamaParse menghasilkan teks yang jauh lebih bersih dari PDFLoader
// biasa, terutama untuk dokumen scan/OCR seperti UU Indonesia.
// Split per 25 halaman untuk menghindari timeout LlamaParse.
// ═══════════════════════════════════════════════════════════════
async function loadPDFs() {
  logSeparator("PHASE 3 — Load PDF dengan LlamaParse");
  const docsPath = path.join(__dirname, "../docs");

  if (!fs.existsSync(docsPath))
    throw new Error(`Folder 'docs' tidak ditemukan: ${docsPath}`);

  const files = fs.readdirSync(docsPath).filter((f) => f.endsWith(".pdf"));
  if (files.length === 0) throw new Error("Tidak ada file PDF di folder 'docs'.");

  log("📁", `${files.length} file ditemukan:`, files);

  // Import LlamaParse (ES module)
  const cloudModule   = await import("llama-cloud-services");
  const LlamaParseReader = cloudModule.LlamaParseReader || cloudModule.default?.LlamaParseReader;

  const reader = new LlamaParseReader({
    resultType: "markdown",
    apiKey:     process.env.LLAMAPARSE_API_KEY,
  });

  const allDocuments = [];

  for (const file of files) {
    const filePath = path.join(docsPath, file);
    log("📄", `Memproses: ${file}...`);

    try {
      const pdfBytes  = fs.readFileSync(filePath);
      const pdfDoc    = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();

      log("📊", `Total halaman: ${totalPages}`);

      if (totalPages > CONFIG.pdfChunkSize) {
        // PDF tebal — potong per 25 halaman agar tidak timeout
        log("✂️ ", `Membelah per ${CONFIG.pdfChunkSize} halaman...`);

        for (let i = 0; i < totalPages; i += CONFIG.pdfChunkSize) {
          const start = i;
          const end   = Math.min(i + CONFIG.pdfChunkSize, totalPages);
          log("⏳", `Bagian hal. ${start + 1}–${end}...`);

          // Potong PDF di memori
          const subPdf     = await PDFDocument.create();
          const pageIdx    = Array.from({ length: end - start }, (_, k) => start + k);
          const copied     = await subPdf.copyPages(pdfDoc, pageIdx);
          copied.forEach((p) => subPdf.addPage(p));
          const subBytes   = await subPdf.save();

          // Kirim ke LlamaParse dengan retry
          let attempt = 0;
          let success = false;

          while (attempt < 2 && !success) {
            attempt++;
            try {
              const parsed = await reader.loadDataAsContent(
                subBytes,
                `${file}_part_${start}.pdf`
              );

              if (parsed && parsed.length > 0) {
                parsed.forEach((d) => {
                  allDocuments.push(new Document({
                    pageContent: d.text,
                    metadata: { source: file, page: `${start + 1}-${end}` },
                  }));
                });
                success = true;
                log("✅", `Bagian hal. ${start + 1}–${end} berhasil`);
              }
            } catch (err) {
              log("⚠️ ", `Gagal bagian ${start + 1} (attempt ${attempt}): ${err.message}`);
              if (attempt < 2) {
                log("⏸️ ", "Menunggu 10 detik sebelum retry...");
                await sleep(10000);
              }
            }
          }

          // Jeda antar bagian agar LlamaParse server tidak kewalahan
          if (i + CONFIG.pdfChunkSize < totalPages) {
            log("⏸️ ", "Menunggu 6 detik sebelum bagian berikutnya...");
            await sleep(6000);
          }
        }

      } else {
        // PDF tipis — langsung proses utuh
        const parsed = await reader.loadData(filePath);
        parsed.forEach((d, idx) => {
          allDocuments.push(new Document({
            pageContent: d.text,
            metadata: { source: file, page: idx + 1 },
          }));
        });
      }

      log("✅", `${file} selesai diproses`);

    } catch (err) {
      log("❌", `Gagal total ${file}: ${err.message}`);
    }
  }

  log("📚", `Total blok dokumen terkumpul: ${allDocuments.length}`);
  return allDocuments;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 4 — Split & bersihkan dokumen
// ═══════════════════════════════════════════════════════════════
async function splitAndClean(allDocuments) {
  logSeparator("PHASE 4 — Split & Clean");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:    1000,
    chunkOverlap: 200,
  });

  const chunkedDocs = await splitter.splitDocuments(allDocuments);
  log("✂️ ", `Chunk sebelum filter: ${chunkedDocs.length}`);

  const cleanDocs = chunkedDocs.filter(
    (doc) => doc.pageContent && doc.pageContent.trim().length > 15
  );
  log("🧹", `Chunk setelah filter: ${cleanDocs.length}`);

  cleanDocs.forEach((doc) => {
    doc.pageContent = doc.pageContent
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    doc.metadata = {
      source: doc.metadata.source
        ? path.basename(doc.metadata.source)
        : "Dokumen Hukum",
      page: doc.metadata.page || doc.metadata.loc?.pageNumber || 1,
    };
  });

  // Preview 3 chunk pertama
  log("🔍", "Preview 3 chunk pertama:");
  cleanDocs.slice(0, 3).forEach((doc, i) => {
    console.log(`\n  [Chunk ${i + 1}]`);
    console.log(`  source  : ${doc.metadata.source}`);
    console.log(`  page    : ${doc.metadata.page}`);
    console.log(`  chars   : ${doc.pageContent.length}`);
    console.log(`  preview : "${doc.pageContent.slice(0, 100)}..."`);
  });

  log("✅", `${cleanDocs.length} chunk siap dikirim.`);
  return cleanDocs;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 5 — Embed dengan Voyage AI + Checkpoint System
//
// KENAPA VOYAGE AI?
//   1. Tidak ada safety filter → semua pasal pidana berat diproses
//   2. voyage-law-2 dioptimasi untuk dokumen hukum
//   3. Free tier 50 juta token/bulan — lebih dari cukup
//
// CHECKPOINT SYSTEM:
//   Progress disimpan ke .ingest-checkpoint.json setiap batch.
//   Kalau script terhenti (mati listrik, Ctrl+C, error), run ulang
//   akan otomatis lanjut dari batch terakhir yang berhasil.
// ═══════════════════════════════════════════════════════════════
async function embedWithVoyageAI(voyageClient, cleanDocs) {
  logSeparator("PHASE 5 — Embedding dengan Voyage AI");

  const { embedBatchSize, delayBetweenEmbedBatches, voyageModel } = CONFIG;
  const totalBatches = Math.ceil(cleanDocs.length / embedBatchSize);

  // Load checkpoint — lanjut dari progress sebelumnya jika ada
  const checkpoint   = loadCheckpoint();
  const allVectors   = checkpoint.vectors;
  const startFromIdx = checkpoint.embeddedCount;

  if (startFromIdx > 0) {
    log("⏩", `Melanjutkan dari chunk ke-${startFromIdx + 1} (skip ${startFromIdx} chunk yang sudah di-embed)`);
  }

  log("⚙️ ", `Model      : ${voyageModel} (tidak ada safety filter)`);
  log("⚙️ ", `Strategi   : ${embedBatchSize} doc/batch, delay ${delayBetweenEmbedBatches}ms`);
  log("📊", `Total batch : ${totalBatches} (${cleanDocs.length} chunks)`);

  for (let i = startFromIdx; i < cleanDocs.length; i += embedBatchSize) {
    const batch    = cleanDocs.slice(i, i + embedBatchSize);
    const batchNum = Math.floor(i / embedBatchSize) + 1;
    const texts    = batch.map((doc) => doc.pageContent);

    let attempt = 0;
    let success = false;

    while (attempt < CONFIG.maxRetries && !success) {
      attempt++;
      try {
        process.stdout.write(
          `\r[${new Date().toISOString().slice(11, 19)}] 🚢  ` +
          `Embed ${batchNum}/${totalBatches} — ` +
          `chunk ${i + 1}~${i + batch.length}/${cleanDocs.length} ` +
          `(attempt ${attempt})...`
        );

        // Voyage AI menerima array teks langsung
        const result  = await voyageClient.embed({
          input: texts,
          model: voyageModel,
        });

        const vectors = result.data.map((d) => d.embedding);

        // Validasi dimensi
        const invalid = vectors.filter(
          (v) => !Array.isArray(v) || v.length !== CONFIG.embeddingDim
        );
        if (invalid.length > 0) {
          throw new Error(`${invalid.length} vector tidak valid (panjang ≠ ${CONFIG.embeddingDim})`);
        }

        allVectors.push(...vectors);
        success = true;

        // Simpan checkpoint setelah setiap batch berhasil
        saveCheckpoint(i + batch.length, allVectors);

      } catch (err) {
        process.stdout.write("\n");

        const isRateLimit =
          err.message.includes("429") ||
          err.message.toLowerCase().includes("rate") ||
          err.message.toLowerCase().includes("quota");

        if (isRateLimit) {
          log("⏸️ ", `Rate limit! Menunggu 15s sebelum retry...`);
          await sleep(15000);
          // Tidak increment attempt — throttle bukan kesalahan data
        } else if (attempt < CONFIG.maxRetries) {
          log("⚠️ ", `Batch ${batchNum} gagal (attempt ${attempt}): ${err.message}`);
          await sleep(3000 * attempt);
        } else {
          log("❌", `Batch ${batchNum} gagal total. Chunk diisi null.`);
          allVectors.push(...new Array(batch.length).fill(null));
          saveCheckpoint(i + batch.length, allVectors);
          success = true;
        }
      }
    }

    if (i + embedBatchSize < cleanDocs.length) {
      await sleep(delayBetweenEmbedBatches);
    }
  }

  process.stdout.write("\n");

  const failedCount  = allVectors.filter((v) => v === null).length;
  const successCount = allVectors.length - failedCount;
  log("✅", `Embedding selesai: ${successCount} berhasil, ${failedCount} gagal`);

  if (failedCount > 0) {
    log("⚠️ ", `${failedCount} chunk gagal — kemungkinan teks terlalu pendek/rusak`);
  }

  return allVectors;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 6 — Upsert ke Pinecone
// Format SDK v7: await index.upsert({ records: [...] })
// ═══════════════════════════════════════════════════════════════
async function upsertToPinecone(pineconeIndex, cleanDocs, allVectors) {
  logSeparator("PHASE 6 — Upsert to Pinecone");

  // Pasangkan doc + vector, buang yang null
  const records = cleanDocs
    .map((doc, i) => ({ doc, vector: allVectors[i] }))
    .filter(({ vector }) => vector !== null);

  log("📦", `Records valid: ${records.length} dari ${cleanDocs.length}`);

  if (records.length === 0) {
    throw new Error("Tidak ada vector yang berhasil di-embed.");
  }

  const { upsertBatchSize } = CONFIG;
  const totalBatches = Math.ceil(records.length / upsertBatchSize);
  let totalUpserted  = 0;

  for (let i = 0; i < records.length; i += upsertBatchSize) {
    const batch    = records.slice(i, i + upsertBatchSize);
    const batchNum = Math.floor(i / upsertBatchSize) + 1;

    const payload = batch
      .map(({ doc, vector }, idx) => ({
        // ID deterministik — tidak duplikat meski dijalankan ulang
        id: `chunk_${doc.metadata.source}_p${doc.metadata.page}_${i + idx}`,
        values: vector,
        metadata: {
          text:   doc.pageContent,  // wajib ada untuk retrieval
          source: doc.metadata.source,
          page:   doc.metadata.page,
        },
      }))
      .filter(
        (r) =>
          Array.isArray(r.values) &&
          r.values.length === CONFIG.embeddingDim &&
          typeof r.values[0] === "number"
      );

    if (payload.length === 0) {
      log("⚠️ ", `Batch ${batchNum} dilewati — tidak ada record valid.`);
      continue;
    }

    let attempt = 0;
    let success = false;

    while (attempt < CONFIG.maxRetries && !success) {
      attempt++;
      try {
        log("⏳", `Upsert batch ${batchNum}/${totalBatches} (${payload.length} records, attempt ${attempt})...`);

        // ✅ Format Pinecone SDK v7
        await pineconeIndex.upsert({ records: payload });

        totalUpserted += payload.length;
        log("✅", `Batch ${batchNum} OK. Total terupsert: ${totalUpserted}`);
        success = true;

      } catch (err) {
        log("⚠️ ", `Batch ${batchNum} gagal (attempt ${attempt}): ${err.message}`);
        if (attempt < CONFIG.maxRetries) await sleep(3000 * attempt);
        else log("❌", `Batch ${batchNum} dilewati setelah ${CONFIG.maxRetries}x.`);
      }
    }
  }

  logSeparator("RINGKASAN AKHIR");
  log("✅", `Terupsert ke Pinecone : ${totalUpserted} records`);
  log("📊", `Total chunk awal      : ${cleanDocs.length}`);
  if (totalUpserted < cleanDocs.length) {
    log("⚠️ ", `Chunk gagal/dilewati  : ${cleanDocs.length - totalUpserted}`);
    log("💡", "Jalankan ulang — checkpoint akan lanjut dari posisi terakhir");
  }
}

// ═══════════════════════════════════════════════════════════════
// 🚀  MAIN
// ═══════════════════════════════════════════════════════════════
async function processPDFs() {
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║     TanyaHukum v2 — Data Ingestion Pipeline        ║");
  console.log("║     Embedding: voyage-law-2 (no safety filter)     ║");
  console.log("║     OCR      : LlamaParse                          ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  try {
    // Phase 0
    checkEnvVars();

    // Phase 1
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    await checkPineconeIndex(pc);

    // Phase 2
    const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGEAI_API_KEY });
    await checkVoyageAI(voyageClient);

    // Phase 3
    const allDocuments = await loadPDFs();

    // Phase 4
    const cleanDocs = await splitAndClean(allDocuments);

    // Phase 5
    const allVectors = await embedWithVoyageAI(voyageClient, cleanDocs);

    // Phase 6
    const pineconeIndex = pc.Index(process.env.PINECONE_INDEX_V2);
    await upsertToPinecone(pineconeIndex, cleanDocs, allVectors);

    // Hapus checkpoint karena sudah selesai sempurna
    clearCheckpoint();

    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║  🎉 SELESAI — Dokumen hukum berhasil ditanam!      ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

  } catch (error) {
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║  🚨 PROSES GAGAL                                   ║");
    console.log("╚════════════════════════════════════════════════════╝");
    console.error("\nError :", error.message);
    console.error("\nStack :");
    console.error(error.stack);
    process.exit(1);
  }
}

processPDFs();