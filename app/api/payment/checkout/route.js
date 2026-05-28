import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import prisma from "@/lib/prisma"; 

const snap = new Midtrans.Snap({
  isProduction: false, 
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Cari data User di Database untuk mengambil Email dan Tier-nya
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, tier: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah user sudah PRO — tidak perlu bayar lagi
    if (user.tier === "PRO") {
      return NextResponse.json({ error: "Anda sudah berlangganan PRO." }, { status: 400 });
    }

    // 2. Definisikan Harga & Order ID
    const amount = 49900; 
    const orderId = `TRX-${Date.now()}-${userId.substring(0, 5)}`;
    console.log("[CHECKOUT] Generated orderId:", orderId, "for userId:", userId);

    // 3. Buat Transaksi di Database kita (Status PENDING)
    await prisma.transaction.create({
      data: {
        orderId: orderId,
        userId: userId,
        amount: amount,
        status: "PENDING",
      },
    });

    // 4. Request Snap Token ke Midtrans (DENGAN DETAIL LENGKAP)
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [{
        id: "PRO-TIER-1",
        price: amount,
        quantity: 1,
        name: "Langganan PRO TanyaHukum"
      }],
      customer_details: {
        email: user.email,
        // Anda bisa tambahkan first_name jika punya data namanya di database
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // 5. UPDATE database kita dengan memasukkan paymentUrl yang didapat dari Midtrans
    await prisma.transaction.update({
      where: { orderId: orderId },
      data: { paymentUrl: transaction.redirect_url }
    });

    // 6. Kirim response ke Frontend
    return NextResponse.json({ 
      token: transaction.token,
      redirect_url: transaction.redirect_url 
    });

  } catch (error) {
    console.error("Midtrans Error:", error);
    return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 500 });
  }
}