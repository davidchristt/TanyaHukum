require("dotenv").config();
const { Pinecone }                       = require("@pinecone-database/pinecone");
const { VoyageEmbeddings }               = require("@langchain/community/embeddings/voyage");
const { ChatGoogleGenerativeAI }         = require("@langchain/google-genai");
const { HumanMessage, SystemMessage }    = require("@langchain/core/messages");

// ═══════════════════════════════════════════════════════════════
// ❓ PERTANYAAN — Ganti teks di sini untuk mencoba pertanyaan lain
// ═══════════════════════════════════════════════════════════════
const PERTANYAAN = "Sebuah toko online sengaja memposting spesifikasi barang palsu untuk menipu pembeli, dan setelah dibayar barang tidak dikirim. Undang-undang apa saja yang bisa digunakan untuk menjerat pelaku (baik dari sisi konsumen maupun transaksi elektronik)?";

// ═══════════════════════════════════════════════════════════════  
// ⚙️  KONFIGURASI
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  // 🌟 Top K diturunkan ke 10. Mengirim 100 dokumen sekaligus bisa membuat LLM over-context.
  topK: 100,

  // 🌟 Model embedding pakai Voyage AI (voyage-3 atau voyage-law-2)
  embeddingModel: "voyage-law-2",

  // Model LLM untuk generate jawaban (tetap Gemini)
  llmModel: "gemini-2.5-flash",

  // 🌟 Dimensi embedding Voyage adalah 1024 (bukan 3072 seperti Gemini)
  embeddingDimension: 1024,
};

// ═══════════════════════════════════════════════════════════════
// 🛠️  HELPERS
// ═══════════════════════════════════════════════════════════════
function printSeparator(title = "", char = "─") {
  const line = char.repeat(56);
  console.log(`\n${line}`);
  if (title) { console.log(`  ${title}`); console.log(line); }
}

function printHeader() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║           TanyaHukum — RAG Query Test (Voyage)         ║");
  console.log("╚════════════════════════════════════════════════════════╝");
}

function printFooter(success = true) {
  const icon = success ? "✅" : "❌";
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log(`║  ${icon}  Selesai                                            ║`);
  console.log("╚════════════════════════════════════════════════════════╝\n");
}

// ═══════════════════════════════════════════════════════════════
// STEP 1 — Validasi environment variables
// ═══════════════════════════════════════════════════════════════
function checkEnvVars() {
  printSeparator("STEP 1 — Environment Check");
  // 🌟 Wajib punya kedua key: VOYAGEAI (untuk pencarian) & GOOGLE (untuk chat)
  const required = ["PINECONE_API_KEY", "PINECONE_INDEX_V2", "GOOGLE_API_KEY", "VOYAGEAI_API_KEY"];
  let allOk = true;

  for (const key of required) {
    const val = process.env[key];
    if (!val) {
      console.log(`  ❌  Missing: ${key}`);
      allOk = false;
    } else {
      console.log(`  ✅  ${key} = ${val.slice(0, 6)}...`);
    }
  }

  if (!allOk) throw new Error("Ada env variable yang belum diisi di .env");
}

// ═══════════════════════════════════════════════════════════════
// STEP 2 — Inisialisasi semua koneksi
// ═══════════════════════════════════════════════════════════════
async function initConnections() {
  printSeparator("STEP 2 — Inisialisasi Koneksi");

  // Pinecone client
  console.log("  🔌  Menghubungkan ke Pinecone...");
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const pineconeIndex = pc.Index(process.env.PINECONE_INDEX_V2);
  console.log(`  ✅  Pinecone index "${process.env.PINECONE_INDEX_V2}" siap`);

  // 🌟 Embedding model — Pindah ke Voyage AI
  console.log("  🤖  Memuat Voyage Embeddings...");
  const embeddings = new VoyageEmbeddings({
    apiKey: process.env.VOYAGEAI_API_KEY,
    modelName: CONFIG.embeddingModel,
    inputType: "query", // Mode query untuk pencarian
  });
  console.log(`  ✅  Embedding model "${CONFIG.embeddingModel}" siap`);

  // LLM untuk generate jawaban
  console.log("  💬  Memuat Gemini LLM...");
  const llm = new ChatGoogleGenerativeAI({
    apiKey:      process.env.GOOGLE_API_KEY,
    model:       CONFIG.llmModel,
    temperature: 0.2, 
  });
  console.log(`  ✅  LLM model "${CONFIG.llmModel}" siap`);

  return { pineconeIndex, embeddings, llm };
}

// ═══════════════════════════════════════════════════════════════
// STEP 3 — Similarity Search ke Pinecone
// ═══════════════════════════════════════════════════════════════
async function retrieveDokumen(pineconeIndex, embeddings, pertanyaan) {
  printSeparator("STEP 3 — Retrieval dari Pinecone");
  console.log(`  🔍  Mencari dokumen relevan untuk:\n  "${pertanyaan}"\n`);

  console.log("  ⚙️   Mengubah pertanyaan jadi vector...");
  const queryVector = await embeddings.embedQuery(pertanyaan);
  console.log(`  ✅  Query vector: ${queryVector.length} dimensi`);

  console.log(`  🗄️   Mencari top ${CONFIG.topK} dokumen di Pinecone...`);
  const queryResult = await pineconeIndex.query({
    vector:          queryVector,
    topK:            CONFIG.topK,
    includeMetadata: true, 
  });

  const matches = queryResult.matches || [];

  if (matches.length === 0) {
    throw new Error("Tidak ada dokumen ditemukan di Pinecone.");
  }

  console.log(`  ✅  ${matches.length} dokumen relevan ditemukan\n`);

  matches.forEach((match, i) => {
    const teks   = match.metadata?.text   || "(teks tidak tersedia)";
    const source = match.metadata?.source || "unknown";
    const page   = match.metadata?.page   || "?";
    const score  = match.score?.toFixed(4) || "?";

    console.log(`  📄  Dokumen #${i + 1}`);
    console.log(`      Sumber  : ${source} (hal. ${page})`);
    console.log(`      Score   : ${score}`);
    console.log(`      Preview : "${teks.slice(0, 120)}..."`);
    console.log();
  });

  return matches;
}

// ═══════════════════════════════════════════════════════════════
// STEP 4 — Bangun prompt dan kirim ke LLM
// ═══════════════════════════════════════════════════════════════
async function generateJawaban(llm, matches, pertanyaan) {
  printSeparator("STEP 4 — Generate Jawaban dengan Gemini");

  const konteksBagian = matches.map((match, i) => {
    const teks   = match.metadata?.text   || "";
    const source = match.metadata?.source || "Dokumen Hukum";
    const page   = match.metadata?.page   || "?";
    return `[Referensi ${i + 1} — ${source}, halaman ${page}]\n${teks}`;
  });

  const konteksGabung = konteksBagian.join("\n\n---\n\n");

  const systemPrompt = `Anda adalah asisten hukum Indonesia bernama TanyaHukum yang ahli dan terpercaya.

TUGAS ANDA:
Jawab pertanyaan pengguna HANYA berdasarkan konteks hukum yang diberikan di bawah ini.

ATURAN YANG WAJIB DIIKUTI:
1. Gunakan HANYA informasi dari konteks yang diberikan. Jangan mengarang atau menambahkan informasi dari luar.
2. Sebutkan sumber undang-undang dan nomor pasal yang relevan jika tersedia dalam konteks.
3. Jika informasi yang dibutuhkan TIDAK ADA dalam konteks, katakan dengan jujur: "Berdasarkan dokumen yang tersedia, saya tidak menemukan informasi yang cukup untuk menjawab pertanyaan ini."
4. Gunakan bahasa Indonesia yang formal namun mudah dipahami masyarakat umum.
5. Strukturkan jawaban dengan jelas menggunakan poin-poin jika perlu.

KONTEKS HUKUM:
${konteksGabung}`;

  console.log("  📝  System prompt & konteks siap");
  console.log("  🚀  Mengirim ke Gemini LLM...\n");

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(pertanyaan),
  ]);

  return response.content;
}

// ═══════════════════════════════════════════════════════════════
// STEP 5 — Tampilkan hasil akhir
// ═══════════════════════════════════════════════════════════════
function tampilkanHasil(pertanyaan, matches, jawaban) {
  printSeparator("HASIL AKHIR", "═");

  console.log("  ❓  PERTANYAAN:");
  console.log(`  ${pertanyaan}\n`);

  printSeparator("  📚  Dokumen Referensi");
  matches.forEach((match, i) => {
    const source = match.metadata?.source || "unknown";
    const page   = match.metadata?.page   || "?";
    const score  = match.score?.toFixed(4) || "?";
    const teks   = match.metadata?.text   || "";
    console.log(`  [${i + 1}] ${source} — hal. ${page} (relevance score: ${score})`);
    console.log(`      "${teks.slice(0, 100)}..."\n`);
  });

  printSeparator("  🤖  Jawaban TanyaHukum");
  console.log();
  jawaban.split("\n").forEach((baris) => console.log(`  ${baris}`));
  console.log();
}

// ═══════════════════════════════════════════════════════════════
// 🚀  MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  printHeader();

  try {
    checkEnvVars();
    const { pineconeIndex, embeddings, llm } = await initConnections();
    const matches = await retrieveDokumen(pineconeIndex, embeddings, PERTANYAAN);
    const jawaban = await generateJawaban(llm, matches, PERTANYAAN);
    tampilkanHasil(PERTANYAAN, matches, jawaban);
    printFooter(true);

  } catch (error) {
    console.error("\n  🚨  ERROR:", error.message);
    console.error("\n  Stack trace:");
    console.error(error.stack);
    printFooter(false);
    process.exit(1);
  }
}

main();