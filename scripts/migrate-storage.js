const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config(); 

const prisma = new PrismaClient();

// 1. Setup Koneksi ke Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = 'tanyahukum-storage'; 

async function migrate() {
  console.log("🚀 Memulai proses evakuasi PDF ke Cloudflare R2...");

  // 2. Ambil semua regulasi dari database
  const regulations = await prisma.regulation.findMany();

  for (const reg of regulations) {
    // Kalau fileUrl-nya udah pake R2_PUBLIC_URL atau kosong, skip aja
    if (!reg.fileUrl || reg.fileUrl.includes(process.env.R2_PUBLIC_URL)) {
      console.log(`⏩ Skip: ${reg.title} (Udah aman)`);
      continue;
    }

    try {
      console.log(`📦 Mendownload: ${reg.title}...`);

      // 3. Download file PDF dari URL Supabase lama
      const response = await fetch(reg.fileUrl);
      if (!response.ok) throw new Error(`Gagal download: ${response.statusText}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 1. Ambil 8 karakter pertama dari UUID lu (contoh: "000e553d")
      const shortId = reg.id.split('-')[0];

      // 2. Pecah URL Supabase lama buat ngambil nama aslinya
      const urlParts = reg.fileUrl.split('/');
      // Kalau nama filenya ada spasi (di-encode jadi %20), kita bersihin sekalian pakai decodeURIComponent
      const originalName = decodeURIComponent(urlParts[urlParts.length - 1]);

      // 3. Gabungin! Hasilnya: "regulations/000e553d-nama-asli.pdf"
      const fileName = `regulations/${shortId}-${originalName}`;

      console.log(`☁️ Mengupload ke R2: ${fileName}...`);

      // 4. Upload ke Cloudflare R2
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: 'application/pdf',
        })
      );

      // 5. Update Database Prisma dengan URL baru
      const newFileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
      
      await prisma.regulation.update({
        where: { id: reg.id },
        data: { fileUrl: newFileUrl },
      });

      console.log(`✅ Sukses: ${reg.title} -> Dipindah ke R2`);

    } catch (error) {
      console.error(`❌ GAGAL memproses ${reg.title}:`, error.message);
    }
  }

  console.log("🏁 Operasi Evakuasi Selesai! Database lu udah aman, Kapten!");
  await prisma.$disconnect();
}

migrate();