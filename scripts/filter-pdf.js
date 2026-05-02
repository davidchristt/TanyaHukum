const fs = require('fs-extra');
const path = require('path');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 📁 KONFIGURASI FOLDER
const SOURCE_DIR = path.join(__dirname, '../data/pdf-hukum'); 
const DEST_DIR = path.join(__dirname, '../data/golden-dataset');

// 🎯 TARGET KUOTA
const MAX_KETENAGAKERJAAN = 1500;
const MAX_PERDATA = 3500;

// 🔍 KATA KUNCI (REGEX)
const REGEX_BLACKLIST = /(pidana|kriminal|desa|apbd|narkotika|korupsi)/i;
const REGEX_KETENAGAKERJAAN = /(ketenagakerjaan|upah|buruh|pekerja|pesangon|serikat|phk)/i;
const REGEX_PERDATA = /(pajak|retribusi|perusahaan|perseroan|kontrak|perjanjian|tanah|waris)/i;

async function processPdf(filePath, fileName, currentKetenagakerjaan, currentPerdata) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    
    // Hanya membaca maksimal 6 halaman pertama untuk efisiensi RAM
    const options = { max: 6 }; 
    const pdfData = await pdf(dataBuffer, options);
    const text = pdfData.text.replace(/\s+/g, ' '); 

    // 1. Cek Blacklist
    if (REGEX_BLACKLIST.test(text)) return 'SKIP';

    // 2. Cek Prioritas Utama: Ketenagakerjaan
    if (currentKetenagakerjaan < MAX_KETENAGAKERJAAN && REGEX_KETENAGAKERJAAN.test(text)) {
      return 'Ketenagakerjaan';
    }

    // 3. Cek Perdata Lainnya
    if (currentPerdata < MAX_PERDATA && REGEX_PERDATA.test(text)) {
      return 'Perdata';
    }

    return 'SKIP'; 
  } catch (error) {
    // Abaikan file yang terenkripsi password atau rusak
    return 'SKIP';
  }
}

async function main() {
  console.log("🚀 Memanaskan mesin filter Golden Dataset...");
  
  await fs.ensureDir(DEST_DIR);

  const files = await fs.readdir(SOURCE_DIR);
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
  
  console.log(`Menemukan ${pdfFiles.length} file PDF. Memulai penyaringan...\n`);

  let countKetenagakerjaan = 0;
  let countPerdata = 0;
  let countProcessed = 0;

  for (const fileName of pdfFiles) {
    if (countKetenagakerjaan >= MAX_KETENAGAKERJAAN && countPerdata >= MAX_PERDATA) {
      console.log("\n✅ BOOYAH! Kuota 5000 Golden Dataset sudah terpenuhi!");
      break;
    }

    const sourcePath = path.join(SOURCE_DIR, fileName);
    const destPath = path.join(DEST_DIR, fileName);

    const category = await processPdf(sourcePath, fileName, countKetenagakerjaan, countPerdata);

    if (category !== 'SKIP') {
      await fs.copyFile(sourcePath, destPath);
      const stats = await fs.stat(destPath);

      // Simpan metadata ke Supabase
      await prisma.regulation.create({
        data: {
          title: `Regulasi ${category} - ${fileName.replace('.pdf', '')}`,
          category: category,
          filePath: `/data/golden-dataset/${fileName}`,
          fileName: fileName,
          fileSize: stats.size,
          isProcessed: false ,
          fileUrl:""
        }
      });

      if (category === 'Ketenagakerjaan') countKetenagakerjaan++;
      else countPerdata++;

      console.log(`[+] Lolos: ${category} | Progress -> KTK: ${countKetenagakerjaan}/${MAX_KETENAGAKERJAAN} | PRD: ${countPerdata}/${MAX_PERDATA}`);
    }

    countProcessed++;
    if (countProcessed % 50 === 0) console.log(`⏳ Membaca data ke-${countProcessed}...`);
  }

  console.log("\n🏁 PROSES SELESAI!");
  console.log(`📊 Hasil Akhir dikumpulkan: ${countKetenagakerjaan} Ketenagakerjaan, ${countPerdata} Perdata.`);
}

main()
  .catch(e => console.error("❌ Terjadi Kesalahan Fatal:", e))
  .finally(async () => await prisma.$disconnect());