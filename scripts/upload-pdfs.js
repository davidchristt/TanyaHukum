const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const prisma = new PrismaClient();

// WAJIB pakai SERVICE_ROLE_KEY biar bisa bypass aturan (RLS) Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log("🚀 Memulai Mesin Upload PDF ke Supabase...");

  // 1. Cari semua data yang fileUrl-nya masih 'EMPTY', null, atau string kosong
  const regulations = await prisma.regulation.findMany({
    where: {
      OR: [
        { fileUrl: "EMPTY" },
        { fileUrl: "" },
      ],
    },
  });

  console.log(`📦 Ditemukan ${regulations.length} dokumen yang butuh di-upload.\n`);

  let successCount = 0;
  let failCount = 0;

  // 2. Looping satu per satu (JANGAN di-Promise.all biar laptop & internet lu gak meledak)
  for (let i = 0; i < regulations.length; i++) {
    const reg = regulations[i];
    
    // PERHATIAN: Sesuaikan base folder ini kalau path di DB lu beda formatnya!
    // Di screenshot lu, filePath = '/data/golden-dataset/...'. 
    // Kalau folder golden-dataset lu ada di D:\ atau C:\, replace string-nya di sini:
    const absolutePath = reg.filePath.replace("/data/golden-dataset/", "C:/Users/David/tanyahukum-app/data/golden-dataset/"); 
    // ^ GANTI PATH "C:/Users/David/..." SESUAI DENGAN LOKASI ASLI FOLDER PDF LU DI LAPTOP!

    console.log(`[${i + 1}/${regulations.length}] Memproses: ${reg.fileName}`);

    try {
      // Cek apakah file fisik ada di laptop
      if (!fs.existsSync(absolutePath)) {
        console.log(`   ❌ GAGAL: File fisik tidak ditemukan di ${absolutePath}`);
        failCount++;
        continue;
      }

      // Baca file jadi buffer
      const fileBuffer = fs.readFileSync(absolutePath);

      // Bersihkan nama file dari spasi dan karakter aneh biar URL-nya aman
      const safeFileName = reg.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      
      // 3. Upload ke Supabase Storage (Bucket: regulations-pdf)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("regulations-pdf")
        .upload(safeFileName, fileBuffer, {
          contentType: "application/pdf",
          upsert: true, // Kalau file udah ada, timpa aja
        });

      if (uploadError) throw uploadError;

      // 4. Dapatkan Public URL
      const { data: publicUrlData } = supabase.storage
        .from("regulations-pdf")
        .getPublicUrl(safeFileName);

      const finalUrl = publicUrlData.publicUrl;

      // 5. Update database
      await prisma.regulation.update({
        where: { id: reg.id },
        data: { fileUrl: finalUrl },
      });

      console.log(`   ✅ BERHASIL: Tersimpan di DB -> ${finalUrl}`);
      successCount++;

    } catch (error) {
      console.error(`   ❌ ERROR: Gagal memproses ${reg.fileName} ->`, error.message);
      failCount++;
    }
  }

  console.log("\n=================================");
  console.log("🎉 PROSES UPLOAD SELESAI!");
  console.log(`✅ Berhasil : ${successCount}`);
  console.log(`❌ Gagal    : ${failCount}`);
  console.log("=================================");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });