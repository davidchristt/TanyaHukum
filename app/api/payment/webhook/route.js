import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    // 1. Terima laporan JSON dari Midtrans
    const body = await req.json();
    
    // Ekstrak data penting dari laporan
    const { order_id, transaction_status, fraud_status } = body;

    let finalStatus = "PENDING";

    // 2. Terjemahkan bahasa Midtrans ke bahasa database kita
    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "challenge") {
        finalStatus = "CHALLENGE"; // Butuh review manual (jarang terjadi)
      } else {
        finalStatus = "SUCCESS"; // LUNAS!
      }
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      finalStatus = "FAILED"; // Gagal/Batal bayar
    }

    // 3. Jika LUNAS, berikan akses PRO ke user
    if (finalStatus === "SUCCESS") {
      // Cari siapa pemilik transaksi ini
      const transaction = await prisma.transaction.findUnique({
        where: { orderId: order_id },
      });

      // Pastikan transaksi ada dan belum pernah diproses sebelumnya
      if (transaction && transaction.status !== "SUCCESS") {
        
        // A. Ubah status transaksi jadi SUCCESS
        await prisma.transaction.update({
          where: { orderId: order_id },
          data: { status: "SUCCESS" },
        });

        // B. UPGRADE USER KE PRO & RESET KUOTA! 🚀
        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            tier: "PRO",
            promptLimit: 0, // Reset limit atau set ke angka besar terserah Anda
          },
        });

        console.log(`[WEBHOOK] Hore! Transaksi ${order_id} LUNAS. User di-upgrade ke PRO!`);
      }
    } else {
      // Jika statusnya Gagal/Pending, update saja status transaksinya
      await prisma.transaction.update({
        where: { orderId: order_id },
        data: { status: finalStatus },
      });
    }

    // 4. WAJIB balas Midtrans dengan 200 OK agar mereka tidak mengirim laporan terus-menerus
    return NextResponse.json({ message: "Laporan Diterima" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}