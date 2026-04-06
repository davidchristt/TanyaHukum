// Logika lupa password

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // 1. Cek apakah user dengan email tersebut ada
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      // Keamanan standar: Jangan beri tahu jika email tidak terdaftar
      // agar tidak disalahgunakan oleh peretas untuk menebak-nebak email.
      return NextResponse.json({ message: 'Jika email terdaftar, link reset telah dikirim.' }, { status: 200 });
    }

    // 2. Buat token acak (64 karakter) dan atur kedaluwarsa (1 jam dari sekarang)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 jam = 3.600.000 milidetik

    // 3. Simpan token ke database
    await prisma.user.update({
      where: { email: email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      }
    });

    // 4. "Kirim" Email (Simulasi)
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    // CATATAN: Untuk saat ini, kita log URL-nya ke terminal agar kamu bisa mengetesnya.
    // Nanti, di sinilah kamu memasukkan logika pengiriman email sungguhan (misal pakai Nodemailer).
    console.log(`\n\n=== LINK RESET PASSWORD UNTUK ${email} ===\n${resetUrl}\n==========================================\n\n`);

    return NextResponse.json({ message: 'Jika email terdaftar, link reset telah dikirim.' }, { status: 200 });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}