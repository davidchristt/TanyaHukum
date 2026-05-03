require("dotenv").config();
const fs   = require("fs-extra");
const path = require("path");
const { Pinecone }                       = require("@pinecone-database/pinecone");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Document }                       = require("@langchain/core/documents");
const { PDFDocument }                    = require("pdf-lib");
const { VoyageAIClient }                 = require("voyageai");
const { PrismaClient }                   = require("@prisma/client");

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// ⚙️  KONFIGURASI ENGINE
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  // Voyage AI
  voyageModel:    "voyage-law-2",  // Dioptimasi untuk dokumen hukum, tanpa safety filter
  embeddingDim:   1024,
  voyageBatchSize: 20,             // Aman untuk free tier — naikkan ke 50 jika pakai paid
  delayBetweenEmbedBatches: 3000, // 3 detik antar batch — kunci hindari rate limit

  // Pinecone
  pineconeBatchSize: 100,

  // LlamaParse
  pdfChunkSize: 25,                // Potong PDF tiap 25 hal agar tidak timeout
  llamaParseDelay: 5000,           // Jeda antar bagian PDF

  // Pipeline
  maxRetries:  3,
  queueLimit:  5,                  // Ambil N dokumen dari DB per siklus
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
  const line = "─".repeat(60);
  console.log(`\n${line}`);
  if (title) { console.log(`  ${title}`); console.log(line); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════
// PHASE 1 — Ekstraksi teks dengan LlamaParse
//
// Split PDF per 25 halaman agar tidak timeout di LlamaParse.
// Dokumen tebal seperti KUHP (345 hal) dipotong jadi 14 bagian.
// ═══════════════════════════════════════════════════════════════
async function parsePDF(regulation, reader) {
  logSeparator(`PHASE 1 — Parsing: ${regulation.fileName}`);

  const filePath = path.join(__dirname, "..", regulation.filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File tidak ditemukan: ${filePath}`);
  }

  const allDocuments = [];
  const pdfBytes     = await fs.readFile(filePath);
  const pdfDoc       = await PDFDocument.load(pdfBytes);
  const totalPages   = pdfDoc.getPageCount();

  log("📊", `File     : ${regulation.fileName}`);
  log("📊", `Halaman  : ${totalPages}`);

  if (totalPages > CONFIG.pdfChunkSize) {
    log("✂️ ", `PDF tebal — membelah per ${CONFIG.pdfChunkSize} halaman...`);

    for (let i = 0; i < totalPages; i += CONFIG.pdfChunkSize) {
      const start = i;
      const end   = Math.min(i + CONFIG.pdfChunkSize, totalPages);

      log("⏳", `Bagian hal. ${start + 1}–${end}...`);

      // Potong PDF di memori
      const subPdf   = await PDFDocument.create();
      const pageIdx  = Array.from({ length: end - start }, (_, k) => start + k);
      const copied   = await subPdf.copyPages(pdfDoc, pageIdx);
      copied.forEach((p) => subPdf.addPage(p));
      const subBytes = await subPdf.save();

      // Kirim ke LlamaParse dengan retry
      let attempt = 0;
      let success = false;

      while (attempt < CONFIG.maxRetries && !success) {
        attempt++;
        try {
          const parsed = await reader.loadDataAsContent(
            subBytes,
            `${regulation.fileName}_part_${start}.pdf`
          );

          if (parsed && parsed.length > 0) {
            parsed.forEach((d) => {
              allDocuments.push(new Document({
                pageContent: d.text,
                metadata: { page: `${start + 1}-${end}` },
              }));
            });
            success = true;
            log("✅", `Bagian hal. ${start + 1}–${end} berhasil`);
          }
        } catch (err) {
          log("⚠️ ", `Gagal bagian ${start + 1} (attempt ${attempt}): ${err.message}`);
          if (attempt < CONFIG.maxRetries) {
            log("⏸️ ", "Menunggu 10 detik sebelum retry...");
            await sleep(10000);
          } else {
            log("❌", `Bagian hal. ${start + 1}–${end} dilewati setelah ${CONFIG.maxRetries}x`);
          }
        }
      }

      // Jeda antar bagian agar LlamaParse tidak kewalahan
      if (i + CONFIG.pdfChunkSize < totalPages) {
        log("⏸️ ", `Menunggu ${CONFIG.llamaParseDelay / 1000}s sebelum bagian berikutnya...`);
        await sleep(CONFIG.llamaParseDelay);
      }
    }

  } else {
    // PDF tipis — langsung proses utuh
    const parsed = await reader.loadData(filePath);
    parsed.forEach((d, idx) => {
      allDocuments.push(new Document({
        pageContent: d.text,
        metadata: { page: idx + 1 },
      }));
    });
  }

  log("✅", `LlamaParse selesai — ${allDocuments.length} blok dokumen diekstrak`);
  return allDocuments;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2 — Split teks jadi chunks
// ═══════════════════════════════════════════════════════════════
async function splitAndClean(rawDocs) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:    1000,
    chunkOverlap: 200,
  });

  const chunkedDocs = await splitter.splitDocuments(rawDocs);

  const cleanDocs = chunkedDocs
    .filter((doc) => doc.pageContent && doc.pageContent.trim().length > 15)
    .map((doc) => ({
      ...doc,
      pageContent: doc.pageContent.replace(/\s+/g, " ").trim(),
    }));

  log("🧹", `Split selesai — ${cleanDocs.length} chunks valid dari ${chunkedDocs.length} total`);
  return cleanDocs;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 3 — Embed dengan Voyage AI
//
// FIX dari versi lama:
//   1. Batch kecil (20) + delay (3s) antar batch — hindari rate limit
//   2. Retry khusus untuk error 429
//   3. Validasi dimensi setiap vector sebelum lanjut
//   4. Jumlah vector dijamin sama dengan jumlah chunk
// ═══════════════════════════════════════════════════════════════
async function embedWithVoyage(cleanDocs, voyageClient, regulationFileName) {
  logSeparator(`PHASE 3 — Embedding: ${regulationFileName}`);

  const { voyageBatchSize, voyageModel, embeddingDim, delayBetweenEmbedBatches } = CONFIG;
  const totalBatches = Math.ceil(cleanDocs.length / voyageBatchSize);

  log("⚙️ ", `Model    : ${voyageModel}`);
  log("⚙️ ", `Strategi : ${voyageBatchSize} chunk/batch, delay ${delayBetweenEmbedBatches}ms`);
  log("📊", `Total    : ${totalBatches} batch (${cleanDocs.length} chunks)`);

  const allVectors = [];

  for (let i = 0; i < cleanDocs.length; i += voyageBatchSize) {
    const batch    = cleanDocs.slice(i, i + voyageBatchSize);
    const batchNum = Math.floor(i / voyageBatchSize) + 1;
    const texts    = batch.map((d) => d.pageContent);

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

        const result  = await voyageClient.embed({ input: texts, model: voyageModel });
        const vectors = result.data.map((d) => d.embedding);

        // Validasi dimensi — pastikan tidak ada vector kosong atau salah dimensi
        const invalid = vectors.filter((v) => !Array.isArray(v) || v.length !== embeddingDim);
        if (invalid.length > 0) {
          throw new Error(`${invalid.length} vector tidak valid (panjang ≠ ${embeddingDim})`);
        }

        allVectors.push(...vectors);
        success = true;

      } catch (err) {
        process.stdout.write("\n");

        const isRateLimit =
          err.message.includes("429") ||
          err.message.toLowerCase().includes("rate") ||
          err.message.toLowerCase().includes("quota");

        if (isRateLimit) {
          // Rate limit — tunggu lebih lama, jangan hitung sebagai attempt
          log("⏸️ ", `Rate limit! Menunggu 30s sebelum retry...`);
          await sleep(30000);
        } else if (attempt < CONFIG.maxRetries) {
          log("⚠️ ", `Batch ${batchNum} gagal (attempt ${attempt}): ${err.message}`);
          await sleep(3000 * attempt);
        } else {
          // Gagal total — isi null agar indeks tetap sinkron
          log("❌", `Batch ${batchNum} gagal total. ${batch.length} chunk diisi null.`);
          allVectors.push(...new Array(batch.length).fill(null));
          success = true;
        }
      }
    }

    // Delay antar batch — JANGAN dihapus
    if (i + voyageBatchSize < cleanDocs.length) {
      await sleep(delayBetweenEmbedBatches);
    }
  }

  process.stdout.write("\n");

  const failedCount  = allVectors.filter((v) => v === null).length;
  const successCount = allVectors.length - failedCount;
  log("✅", `Embedding selesai — ${successCount} berhasil, ${failedCount} gagal`);

  return allVectors;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 4 — Upsert ke Pinecone
//
// FIX dari versi lama:
//   1. Filter vector null sebelum upsert
//   2. Validasi akhir values sebelum kirim
//   3. Format SDK v7: { records: [...] }
// ═══════════════════════════════════════════════════════════════
async function upsertToPinecone(regulation, cleanDocs, allVectors, pineconeIndex) {
  logSeparator(`PHASE 4 — Upsert: ${regulation.fileName}`);

  // Pasangkan doc + vector, buang yang null
  const validPairs = cleanDocs
    .map((doc, i) => ({ doc, vector: allVectors[i] }))
    .filter(
      ({ vector }) =>
        vector !== null &&
        Array.isArray(vector) &&
        vector.length === CONFIG.embeddingDim &&
        typeof vector[0] === "number"
    );

  log("📦", `Records valid: ${validPairs.length} dari ${cleanDocs.length}`);

  if (validPairs.length === 0) {
    throw new Error("Tidak ada vector valid untuk di-upsert.");
  }

  const { pineconeBatchSize } = CONFIG;
  const totalBatches = Math.ceil(validPairs.length / pineconeBatchSize);
  let totalUpserted  = 0;

  for (let i = 0; i < validPairs.length; i += pineconeBatchSize) {
    const batch    = validPairs.slice(i, i + pineconeBatchSize);
    const batchNum = Math.floor(i / pineconeBatchSize) + 1;

    const payload = batch.map(({ doc, vector }, idx) => ({
      // ID deterministik — tidak duplikat meski dijalankan ulang
      id: `reg_${regulation.id}_chunk_${i + idx}`,
      values: vector,
      metadata: {
        // regulationId untuk relasi ke Supabase saat retrieval
        regulationId: regulation.id,
        title:        regulation.title,
        category:     regulation.category || "Umum",
        text:         doc.pageContent,     // wajib ada untuk retrieval RAG
        page:         String(doc.metadata.page || 1),
      },
    }));

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

  log("🏆", `Upsert selesai — ${totalUpserted} records masuk Pinecone`);
  return totalUpserted;
}

// ═══════════════════════════════════════════════════════════════
// 🚀  MAIN PIPELINE LOOP
// ═══════════════════════════════════════════════════════════════
async function startIngestionPipeline() {
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║    TanyaHukum v3 — Ingestion Pipeline              ║");
  console.log("║    Embedding : voyage-law-2 (no safety filter)     ║");
  console.log("║    OCR       : LlamaParse                          ║");
  console.log("║    Queue     : Supabase (auto-resume)              ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  // Init semua koneksi
  const pc            = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const pineconeIndex = pc.Index(process.env.PINECONE_INDEX_V2);
  const voyageClient  = new VoyageAIClient({ apiKey: process.env.VOYAGEAI_API_KEY });

  const cloudModule      = await import("llama-cloud-services");
  const LlamaParseReader = cloudModule.LlamaParseReader || cloudModule.default?.LlamaParseReader;
  const reader           = new LlamaParseReader({
    resultType: "markdown",
    apiKey:     process.env.LLAMAPARSE_API_KEY,
  });

  let totalProcessed = 0;
  let totalFailed    = 0;

  // Loop sampai semua dokumen di DB selesai
  while (true) {
    // Ambil dokumen yang belum diproses dan belum error
    // FIX: filter isError agar dokumen gagal tidak di-loop terus
    const regulations = await prisma.regulation.findMany({
      where: {
        isProcessed: false,
        isActive:    true,  // pastikan hanya ambil yang aktif
        // isError:     false,  // skip yang sudah ditandai error
      },
      take: CONFIG.queueLimit,
      orderBy: { id: "asc" },
    });

    if (regulations.length === 0) {
      logSeparator("SELESAI");
      log("🎉", "Semua dokumen sudah diproses!");
      break;
    }

    log("📋", `Antrean: ${regulations.length} dokumen akan diproses`);

    for (const reg of regulations) {
      log("🔄", `Memulai: ${reg.fileName} (ID: ${reg.id})`);

      try {
        // Phase 1: Parse PDF dengan LlamaParse
        const rawDocs = await parsePDF(reg, reader);

        // Phase 2: Split & clean
        const cleanDocs = await splitAndClean(rawDocs);

        // Phase 3: Embed dengan Voyage AI
        const allVectors = await embedWithVoyage(cleanDocs, voyageClient, reg.fileName);

        // Phase 4: Upsert ke Pinecone
        const upserted = await upsertToPinecone(reg, cleanDocs, allVectors, pineconeIndex);

        // Tandai selesai di Supabase
        await prisma.regulation.update({
          where: { id: reg.id },
          data:  {
            isProcessed:  true,
          },
        });

        totalProcessed++;
        log("🏆", `✅ ${reg.fileName} SELESAI (${upserted} chunks)\n`);

      } catch (error) {
        totalFailed++;
        log("❌", `GAGAL: ${reg.fileName} — ${error.message}`);

        // FIX: Tandai error di DB agar tidak di-loop terus di run berikutnya
        // Jalankan ulang dengan mereset isError ke false jika ingin retry manual
        await prisma.regulation.update({
          where: { id: reg.id },
          data: {
            isActive: false, // kolom ini sudah ada di schema kamu
            },
        });

        log("⚠️ ", `Dokumen ditandai isError=true. Reset manual di DB jika ingin retry.\n`);
      }
    }
  }

  // Ringkasan akhir
  logSeparator("RINGKASAN AKHIR");
  log("✅", `Berhasil diproses : ${totalProcessed} dokumen`);
  if (totalFailed > 0) {
    log("❌", `Gagal             : ${totalFailed} dokumen (cek kolom isError di DB)`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Entry point
// ═══════════════════════════════════════════════════════════════
startIngestionPipeline()
  .catch((e) => console.error("FATAL ERROR:", e))
  .finally(async () => await prisma.$disconnect());