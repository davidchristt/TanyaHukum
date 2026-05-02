const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Target folder
const downloadDir = path.join(__dirname, '../data/pdf-hukum');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

// File untuk menyimpan ingatan halaman terakhir
const checkpointFile = path.join(__dirname, '../data/checkpoint.txt');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeBPKUnlimited() {
  console.log("🚀 Memulai Misi Scraping BPK (Unlimited + Super Checkpoint)...");
  console.log(`📂 Target Folder: ${downloadDir}`);

  let totalDownloaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // ==========================================
  // 💾 BACA MEMORI CHECKPOINT HALAMAN
  // ==========================================
  let p = 1;
  if (fs.existsSync(checkpointFile)) {
    const savedPage = fs.readFileSync(checkpointFile, 'utf8');
    if (savedPage && !isNaN(savedPage)) {
      p = parseInt(savedPage);
      console.log(`🔄 MEMORI DITEMUKAN! Melanjutkan langsung dari Halaman ${p}`);
    }
  }

  let isBerjalan = true;
  let halamanKosongBerturut = 0; 

  while (isBerjalan) {
    const targetUrl = `https://peraturan.bpk.go.id/Search?p=${p}`;
    
    console.log(`\n=========================================`);
    console.log(`📄 MEMBUKA HALAMAN ${p}`);
    console.log(`=========================================`);

    try {
      const { data: html } = await axios.get(targetUrl);
      const $ = cheerio.load(html);
      const pdfLinks = new Set();

      $('a[href$=".pdf"]').each((index, element) => {
        const href = $(element).attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : `https://peraturan.bpk.go.id${href}`;
          pdfLinks.add(fullUrl);
        }
      });

      const linksArray = Array.from(pdfLinks);
      
      if (linksArray.length === 0) {
        halamanKosongBerturut++;
        console.log(`⚠️ Tidak ada PDF di halaman ${p}. (Kosong beruntun: ${halamanKosongBerturut}/20)`);
        
        if (halamanKosongBerturut >= 20) {
          console.log("🛑 Mendeteksi ujung database! Menghentikan mesin perayap.");
          isBerjalan = false; 
          break; 
        }
      } else {
        halamanKosongBerturut = 0; 
        console.log(`🎯 Menemukan ${linksArray.length} file PDF. Memulai unduhan...`);

        for (let i = 0; i < linksArray.length; i++) {
          const pdfUrl = linksArray[i];
          const fileName = decodeURIComponent(pdfUrl.substring(pdfUrl.lastIndexOf('/') + 1));
          const filePath = path.join(downloadDir, fileName);
          const tempPath = filePath + ".tmp"; 

          if (fs.existsSync(filePath)) {
            console.log(`⏭️  SKIP [${i + 1}/${linksArray.length}]: ${fileName}`);
            totalSkipped++;
            continue; 
          }

          console.log(`⬇️  DOWNLOAD [${i + 1}/${linksArray.length}]: ${fileName}...`);
          
          let downloadSuccess = false;

          for (let retry = 1; retry <= 3 && !downloadSuccess; retry++) {
            try {
              const response = await axios({
                url: pdfUrl,
                method: 'GET',
                responseType: 'stream'
              });

              const writer = fs.createWriteStream(tempPath);
              response.data.pipe(writer);

              await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
              });

              fs.renameSync(tempPath, filePath);

              const stats = fs.statSync(filePath);
              if (stats.size < 1000) { 
                fs.unlinkSync(filePath); 
                throw new Error("File terlalu kecil (< 1KB), kemungkinan bukan PDF valid");
              }

              downloadSuccess = true; 
              totalDownloaded++; 
              console.log(`✅ SUKSES: ${fileName}`);

            } catch (err) {
              if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
              console.error(`❌ Attempt ${retry}/3 gagal untuk ${fileName}: ${err.message}`);
              
              if (retry < 3) {
                console.log(`⏳ Menunggu ${5 * retry} detik sebelum mencoba lagi...`);
                await delay(5000 * retry); 
              } else {
                totalFailed++; 
              }
            }
          }
          await delay(2000); 
        }
      }

    } catch (error) {
      console.error(`❌ Gagal membuka halaman ${p}:`, error.message);
    }
    
    // ==========================================
    // 💾 SIMPAN MEMORI CHECKPOINT HALAMAN
    // ==========================================
    // Setelah halaman selesai diproses, catat halamannya ke file teks
    fs.writeFileSync(checkpointFile, p.toString(), 'utf8');
    
    p++;
    await delay(3000); 
  }

  console.log(`\n=========================================`);
  console.log(`📊 RINGKASAN EKSEKUSI MISI UNLIMITED:`);
  console.log(`  ✅ Berhasil didownload : ${totalDownloaded}`);
  console.log(`  ⏭️  Di-skip (sudah ada) : ${totalSkipped}`);
  console.log(`  ❌ Gagal permanen      : ${totalFailed}`);
  console.log(`  📄 Total Halaman Dicek : ${p - 1}`);
  console.log(`=========================================`);
}

scrapeBPKUnlimited();