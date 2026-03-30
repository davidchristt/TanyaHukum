require("dotenv").config();
const fs   = require("fs");
const path = require("path");
const { Pinecone }                    = require("@pinecone-database/pinecone");
const { PDFLoader }                   = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { GoogleGenerativeAIEmbeddings }   = require("@langchain/google-genai");
const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const { Document } = require("@langchain/core/documents");
const { PDFDocument } = require("pdf-lib");

// ═══════════════════════════════════════════════════════════════
// ⚙️  KONFIGURASI
//     Sesuaikan nilai ini jika masih kena rate limit
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  // Berapa chunk dikirim ke Pinecone sekaligus
  upsertBatchSize: 100,

  // Berapa chunk di-embed ke Gemini sekaligus
  // Free tier: jangan lebih dari 20
  embedBatchSize: 20,

  // Jeda (ms) antar batch embedding — kunci utama hindari rate limit
  // Naikkan ke 3000 jika masih sering gagal
  delayBetweenEmbedBatches: 4500,

  // Jeda (ms) saat Gemini mengembalikan error 429
  rateLimitDelay: 30000,

  // Maksimal percobaan ulang per batch
  maxRetries: 3,
  pdfChunkSize: 25
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
  const line = "─".repeat(52);
  console.log(`\n${line}`);
  if (title) { console.log(`  ${title}`); console.log(line); }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ═══════════════════════════════════════════════════════════════
// PHASE 0 — Cek environment variables
// ═══════════════════════════════════════════════════════════════
function checkEnvVars() {
  logSeparator("PHASE 0 — Environment Check");
  const required = ["PINECONE_API_KEY", "PINECONE_INDEX", "GOOGLE_API_KEY"];
  let allOk = true;

  for (const key of required) {
    const val = process.env[key];
    if (!val) {
      log("❌", `Missing: ${key}`);
      allOk = false;
    } else {
      log("✅", `${key} = ${val.slice(0, 6)}...`);
    }
  }

  if (!allOk) throw new Error("Ada env variable yang belum diisi di .env");
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1 — Cek Pinecone index
// ═══════════════════════════════════════════════════════════════
async function checkPineconeIndex(pc) {
  logSeparator("PHASE 1 — Pinecone Connection Check");
  const indexName = process.env.PINECONE_INDEX;
  log("🔌", `Koneksi ke index: "${indexName}"...`);

  let info;
  try {
    info = await pc.describeIndex(indexName);
  } catch (err) {
    log("❌", `Gagal akses index "${indexName}". Pastikan nama & API key benar.`);
    throw err;
  }

  log("📐", `Dimensi index : ${info.dimension}`);
  log("📏", `Metric        : ${info.metric}`);
  log("🟢", `Status        : ${info.status?.ready ? "READY" : "NOT READY"}`);

  if (!info.status?.ready) throw new Error("Pinecone index belum ready.");
  return info.dimension;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2 — Cek dimensi embedding
// ═══════════════════════════════════════════════════════════════
async function checkEmbeddingDimension(embeddings, indexDimension) {
  logSeparator("PHASE 2 — Embedding Dimension Check");
  log("🤖", "Test embedding ke Gemini API...");

  let testVector;
  try {
    testVector = await embeddings.embedQuery("test koneksi embedding");
  } catch (err) {
    log("❌", "Gagal panggil Gemini API. Cek GOOGLE_API_KEY dan quota.");
    throw err;
  }

  const dim = testVector.length;
  log("📐", `Dimensi model  : ${dim}`);
  log("📐", `Dimensi index  : ${indexDimension}`);

  if (dim !== indexDimension) {
    log("🚨", `MISMATCH! Model=${dim}d vs Index=${indexDimension}d`);
    log("💡", `Solusi: Buat ulang Pinecone index dengan dimensions = ${dim}`);
    throw new Error(`Dimensi tidak cocok: ${dim} vs ${indexDimension}`);
  }

  log("✅", `Dimensi cocok (${dim}). Lanjut.`);
  return dim;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 3 — Load & Split PDF (UPGRADED: Anti-Timeout & Retry)
// ═══════════════════════════════════════════════════════════════
async function loadPDFs() {
  logSeparator("PHASE 3 — Load PDF Files (with Auto-Splitting)");
  const docsPath = path.join(__dirname, "../docs");
  
  if (!fs.existsSync(docsPath))
    throw new Error(`Folder 'docs' tidak ditemukan: ${docsPath}`);

  const files = fs.readdirSync(docsPath).filter((f) => f.endsWith(".pdf"));
  if (files.length === 0) throw new Error("Tidak ada file PDF di folder 'docs'.");

  // Dynamic Import LlamaParse
  const cloudModule = await import("llama-cloud-services");
  const LlamaParseReader = cloudModule.LlamaParseReader || cloudModule.default.LlamaParseReader;
  
  const reader = new LlamaParseReader({
    resultType: "markdown",
    apiKey: process.env.LLAMAPARSE_API_KEY,
  });

  const allDocuments = [];

  for (const file of files) {
    const filePath = path.join(docsPath, file);
    log("📄", `Memproses: ${file}...`);

    try {
      const existingPdfBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const totalPages = pdfDoc.getPageCount();
      
      log("📊", `Total halaman: ${totalPages}`);

      // 🔄 JIKA PDF TEBAL (> CONFIG.pdfChunkSize)
      if (totalPages > CONFIG.pdfChunkSize) {
        log("✂️ ", `File tebal. Membelah per ${CONFIG.pdfChunkSize} halaman...`);
        
        for (let i = 0; i < totalPages; i += CONFIG.pdfChunkSize) {
          const start = i;
          const end = Math.min(i + CONFIG.pdfChunkSize, totalPages);
          
          log("⏳", `Mengerjakan Bagian: hal. ${start + 1} s/d ${end}...`);
          
          // Bedah PDF di memori
          const subPdf = await PDFDocument.create();
          const pageIndices = Array.from({ length: end - start }, (_, idx) => start + idx);
          const copiedPages = await subPdf.copyPages(pdfDoc, pageIndices);
          copiedPages.forEach(page => subPdf.addPage(page));
          const subPdfBytes = await subPdf.save();
          
          // 🛡️ RETRY LOGIC: Jika LlamaParse gagal, coba sekali lagi
          let attempt = 0;
          let success = false;
          while (attempt < 2 && !success) {
            attempt++;
            try {
              const parsedDocs = await reader.loadDataAsContent(subPdfBytes, `${file}_part_${i}.pdf`);
              
              if (parsedDocs && parsedDocs.length > 0) {
                parsedDocs.forEach((d) => {
                  allDocuments.push(new Document({
                    pageContent: d.text,
                    metadata: { 
                      source: file, 
                      page: `Halaman ${start + 1}-${end}` 
                    }
                  }));
                });
                success = true;
                log("✅", `Bagian hal. ${start + 1}-${end} BERHASIL.`);
              }
            } catch (err) {
              log("⚠️ ", `Gagal pada bagian ${start + 1} (Attempt ${attempt}): ${err.message}`);
              if (attempt < 2) {
                log("⏸️ ", "Menunggu 10 detik sebelum coba lagi...");
                await sleep(10000);
              }
            }
          }

          // 🌟 KUNCI: Kasih jeda antar potongan agar server tidak kewalahan
          if (i + CONFIG.pdfChunkSize < totalPages) {
            const delay = 6000; // Jeda 6 detik
            log("⏸️ ", `Sabar... Menunggu ${delay/1000} detik sebelum bagian berikutnya...`);
            await sleep(delay);
          }
        }
      } else {
        // PDF Kecil: Langsung proses utuh
        const parsedDocs = await reader.loadData(filePath);
        parsedDocs.forEach((d, idx) => {
          allDocuments.push(new Document({
            pageContent: d.text,
            metadata: { source: file, page: idx + 1 }
          }));
        });
      }
      log("✅", `${file} Selesai diproses.`);
    } catch (err) {
      log("❌", `Gagal total pada ${file}: ${err.message}`);
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
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunkedDocs = await splitter.splitDocuments(allDocuments);
  log("✂️ ", `Chunk sebelum filter: ${chunkedDocs.length}`);

  const cleanDocs = chunkedDocs.filter(
    (doc) => doc.pageContent && doc.pageContent.trim().length > 15
  );
  log("🧹", `Chunk setelah filter: ${cleanDocs.length}`);

  cleanDocs.forEach((doc) => {
    // Bersihkan whitespace berlebih dari hasil OCR
    doc.pageContent = doc.pageContent
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Ratakan metadata — Pinecone tidak terima nested object
    doc.metadata = {
      source: doc.metadata.source
        ? path.basename(doc.metadata.source)
        : "Dokumen Hukum",
      page: doc.metadata.loc?.pageNumber || 1,
    };
  });

  // Preview 3 chunk pertama
  log("🔍", "Preview 3 chunk pertama:");
  cleanDocs.slice(0, 3).forEach((doc, i) => {
    console.log(`\n  [Chunk ${i + 1}]`);
    console.log(`  source  : ${doc.metadata.source}`);
    console.log(`  page    : ${doc.metadata.page}`);
    console.log(`  chars   : ${doc.pageContent.length}`);
    console.log(`  preview : "${doc.pageContent.slice(0, 80)}..."`);
  });

  log("✅", `${cleanDocs.length} chunk siap dikirim.`);
  return cleanDocs;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 5 — Embed dengan rate limit control
//
// KENAPA TIDAK PAKAI vectorStore.addDocuments()?
//   addDocuments() memanggil Gemini 1x per doc tanpa jeda.
//   Untuk 50 doc = 50 API calls burst → Gemini free tier throttle
//   → response kosong → array vectors [] → Pinecone error.
//
//   Di sini kita embed per-batch kecil (20 doc) dengan delay
//   terkontrol antar batch sehingga tidak memicu rate limit.
// ═══════════════════════════════════════════════════════════════
async function embedWithRateLimitControl(embeddings, cleanDocs, embeddingDim) {
  logSeparator("PHASE 5 — Embedding dengan Rate Limit Control");

  const { embedBatchSize, delayBetweenEmbedBatches, rateLimitDelay } = CONFIG;
  const totalBatches = Math.ceil(cleanDocs.length / embedBatchSize);

  log("⚙️ ", `Strategi   : ${embedBatchSize} doc/batch, delay ${delayBetweenEmbedBatches}ms antar batch`);
  log("📊", `Total batch : ${totalBatches} (${cleanDocs.length} chunks)`);

  const allVectors = [];

  for (let i = 0; i < cleanDocs.length; i += embedBatchSize) {
    const batch    = cleanDocs.slice(i, i + embedBatchSize);
    const batchNum = Math.floor(i / embedBatchSize) + 1;
    const texts    = batch.map((doc) => doc.pageContent);

    let attempt = 0;
    let success = false;

    while (attempt < CONFIG.maxRetries && !success) {
      attempt++;
      try {
        process.stdout.write(
          `\r[${new Date().toISOString().slice(11, 19)}] 🔄  ` +
          `Embed ${batchNum}/${totalBatches} — ` +
          `chunk ${i + 1}~${i + batch.length}/${cleanDocs.length} ` +
          `(attempt ${attempt})...`
        );

        const vectors = await embeddings.embedDocuments(texts);

        // Validasi: pastikan setiap vector punya dimensi yang benar
        const invalid = vectors.filter(
          (v) => !Array.isArray(v) || v.length !== embeddingDim
        );
        if (invalid.length > 0) {
          throw new Error(
            `${invalid.length} vector tidak valid (panjang ≠ ${embeddingDim})`
          );
        }

        allVectors.push(...vectors);
        success = true;

      } catch (err) {
        process.stdout.write("\n");

        const is429 =
          err.message.includes("429") ||
          err.message.toLowerCase().includes("quota") ||
          err.message.toLowerCase().includes("rate");

        if (is429) {
          log("⏸️ ", `Rate limit! Menunggu ${rateLimitDelay / 1000}s sebelum retry...`);
          await sleep(rateLimitDelay);
          // Jangan increment attempt — bukan kesalahan data, tapi throttle
        } else if (attempt < CONFIG.maxRetries) {
          log("⚠️ ", `Embed batch ${batchNum} gagal (attempt ${attempt}): ${err.message}`);
          await sleep(3000 * attempt);
        } else {
          log("❌", `Embed batch ${batchNum} gagal total setelah ${CONFIG.maxRetries}x. Chunk diisi null.`);
          // Isi null agar indeks tetap sinkron dengan cleanDocs
          allVectors.push(...new Array(batch.length).fill(null));
          success = true;
        }
      }
    }

    // Delay antar batch — jangan dihapus, ini yang mencegah rate limit
    if (i + embedBatchSize < cleanDocs.length) {
      await sleep(delayBetweenEmbedBatches);
    }
  }

  process.stdout.write("\n");

  const failedCount  = allVectors.filter((v) => v === null).length;
  const successCount = allVectors.length - failedCount;
  log("✅", `Embedding selesai: ${successCount} berhasil, ${failedCount} gagal`);

  if (failedCount > 0) {
    log("⚠️ ", `${failedCount} chunk gagal di-embed (kemungkinan konten OCR rusak / rate limit habis)`);
    log("💡", "Tip: Tunggu beberapa menit lalu jalankan ulang jika banyak yang gagal");
  }

  return allVectors;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 6 — Upsert ke Pinecone
//
// FIX KRITIS: Pinecone SDK v7 mengubah format upsert.
//   ❌ SDK v6 lama : await index.upsert([...records])
//   ✅ SDK v7 baru : await index.upsert({ records: [...] })
//
// Validator SDK v7 mengecek options.records, bukan array langsung.
// ═══════════════════════════════════════════════════════════════
async function upsertToPinecone(pineconeIndex, cleanDocs, allVectors, embeddingDim) {
  logSeparator("PHASE 6 — Upsert to Pinecone");

  // Pasangkan doc + vector, buang yang null
  const records = cleanDocs
    .map((doc, i) => ({ doc, vector: allVectors[i] }))
    .filter(({ vector }) => vector !== null);

  log("📦", `Records valid: ${records.length} dari ${cleanDocs.length}`);

  if (records.length === 0) {
    throw new Error(
      "Tidak ada vector yang berhasil di-embed. " +
      "Kemungkinan quota Gemini habis — tunggu beberapa menit lalu coba lagi."
    );
  }

  const { upsertBatchSize } = CONFIG;
  const totalBatches = Math.ceil(records.length / upsertBatchSize);
  let totalUpserted = 0;

  for (let i = 0; i < records.length; i += upsertBatchSize) {
    const batch    = records.slice(i, i + upsertBatchSize);
    const batchNum = Math.floor(i / upsertBatchSize) + 1;

    // Bangun payload Pinecone
    const payload = batch
      .map(({ doc, vector }, idx) => ({
        id: `chunk_${doc.metadata.source}_p${doc.metadata.page}_${i + idx}`,
        values: vector,
        metadata: {
          // Field 'text' wajib ada — dipakai saat retrieval di RAG
          text:   doc.pageContent,
          source: doc.metadata.source,
          page:   doc.metadata.page,
        },
      }))
      // Validasi akhir sebelum kirim — pastikan values benar-benar valid
      .filter(
        (r) =>
          Array.isArray(r.values) &&
          r.values.length === embeddingDim &&
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
        log(
          "⏳",
          `Upsert batch ${batchNum}/${totalBatches} ` +
          `(${payload.length} records, attempt ${attempt})...`
        );

        // ✅ Format SDK v7 — wajib { records: [...] }
        await pineconeIndex.upsert({ records: payload });

        totalUpserted += payload.length;
        log("✅", `Batch ${batchNum} OK. Total terupsert: ${totalUpserted}`);
        success = true;

      } catch (err) {
        log("⚠️ ", `Batch ${batchNum} gagal (attempt ${attempt}): ${err.message}`);
        if (attempt < CONFIG.maxRetries) {
          await sleep(3000 * attempt);
        } else {
          log("❌", `Batch ${batchNum} dilewati setelah ${CONFIG.maxRetries}x percobaan.`);
        }
      }
    }
  }

  logSeparator("RINGKASAN AKHIR");
  log("✅", `Terupsert ke Pinecone : ${totalUpserted} records`);
  log("📊", `Total chunk awal      : ${cleanDocs.length}`);
  if (totalUpserted < cleanDocs.length) {
    log("⚠️ ", `Chunk gagal/dilewati  : ${cleanDocs.length - totalUpserted}`);
    log("💡", "Jalankan ulang script untuk retry chunk yang gagal (tidak duplikat karena id unik)");
  }
}

// ═══════════════════════════════════════════════════════════════
// 🚀  MAIN
// ═══════════════════════════════════════════════════════════════
async function processPDFs() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║       TanyaHukum — Data Ingestion Pipeline        ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  try {
    // Phase 0
    checkEnvVars();

    // Phase 1
    const pc             = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexDimension = await checkPineconeIndex(pc);

    // Phase 2
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey:   process.env.GOOGLE_API_KEY,
      model:    "gemini-embedding-001",  // 3072 dimensi
      taskType: "RETRIEVAL_DOCUMENT",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    const embeddingDim = await checkEmbeddingDimension(embeddings, indexDimension);

    // Phase 3
    const allDocuments = await loadPDFs();

    // Phase 4
    const cleanDocs = await splitAndClean(allDocuments);

    // Phase 5
    const allVectors = await embedWithRateLimitControl(embeddings, cleanDocs, embeddingDim);

    // Phase 6
    const pineconeIndex = pc.Index(process.env.PINECONE_INDEX);
    await upsertToPinecone(pineconeIndex, cleanDocs, allVectors, embeddingDim);

    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║  🎉 SELESAI — Dokumen hukum berhasil ditanam!     ║");
    console.log("╚══════════════════════════════════════════════════╝\n");

  } catch (error) {
    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║  🚨 PROSES GAGAL                                  ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.error("\nError :", error.message);
    console.error("\nStack :");
    console.error(error.stack);
    process.exit(1);
  }
}

processPDFs();  