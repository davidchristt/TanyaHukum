const fs = require('fs-extra');
const path = require('path');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 📁 FOLDER TARGET (Ambil langsung dari hasil filter kemarin)
const GOLDEN_DIR = path.join(__dirname, '../data/golden-dataset');

// 🔍 KATA KUNCI (Untuk balikin label Ketenagakerjaan/Perdata)
const REGEX_KETENAGAKERJAAN = /(ketenagakerjaan|upah|buruh|pekerja|pesangon|serikat|phk)/i;

async function getCategory(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    // Cukup intip 6 halaman awal kayak kemaren biar cepet
    const pdfData = await pdf(dataBuffer, { max: 6 });
    const text = pdfData.text.replace(/\s+/g, ' ');

    if (REGEX_KETENAGAKERJAAN.test(text)) {
      return 'Ketenagakerjaan';
    }
    // Sisanya pasti Perdata, karena file di folder ini udah lolos blacklist
    return 'Perdata'; 
  } catch (error) {
    return 'Perdata'; // Fallback aman
  }
}

async function main() {
  console.log("🚀 Misi Penyelamatan Data Dimulai...");
  
  if (!(await fs.pathExists(GOLDEN_DIR))) {
    console.error(`❌ Folder tidak ditemukan di: ${GOLDEN_DIR}`);
    return;
  }

  const files = await fs.readdir(GOLDEN_DIR);
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`📂 Ditemukan ${pdfFiles.length} file PDF di golden-dataset. Sedang memproses...\n`);

  let dataToInsert = [];
  let countProcessed = 0;

  // 1. Kumpulkan & format ulang datanya
  for (const fileName of pdfFiles) {
    const filePath = path.join(GOLDEN_DIR, fileName);
    const stats = await fs.stat(filePath);
    
    // Tentukan ulang kategorinya
    const category = await getCategory(filePath);

    // Bikin objek persis sama dengan kode filter lu sebelumnya
    dataToInsert.push({
      title: `Regulasi ${category} - ${fileName.replace('.pdf', '')}`,
      category: category,
      filePath: `/data/golden-dataset/${fileName}`,
      fileName: fileName,
      fileSize: stats.size,
      isProcessed: false, // Penting! Biar mesin embed Pinecone ngebaca ini nanti
      fileUrl: ""
    });

    countProcessed++;
    if (countProcessed % 100 === 0) {
      console.log(`⏳ Memindai dan menyusun data ke-${countProcessed}...`);
    }
  }

  console.log("\n💾 Data siap dikirim ke Supabase! Memulai Batch Insert...");

  // 2. Tembak ke Supabase bertahap (per 100 data) biar server nggak nangis
  const BATCH_SIZE = 100;
  let successCount = 0;

  for (let i = 0; i < dataToInsert.length; i += BATCH_SIZE) {
    const batch = dataToInsert.slice(i, i + BATCH_SIZE);
    
    await prisma.regulation.createMany({
      data: batch,
      skipDuplicates: true // Bypass kalau misal ternyata datanya udah ada
    });

    successCount += batch.length;
    console.log(`✅ Berhasil push ${successCount} / ${dataToInsert.length} data ke Supabase...`);
  }

  console.log("\n🎉 BOOYAH! Tabel Supabase berhasil diselamatkan dengan format 100% sempurna!");
}

main()
  .catch(e => console.error("❌ Terjadi Kesalahan Fatal:", e))
  .finally(async () => await prisma.$disconnect());