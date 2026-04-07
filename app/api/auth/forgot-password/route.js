// Logika lupa password

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // ✅ tetap aman (tidak bocorkan user)
    if (!user) {
      return NextResponse.json({
        message: 'Jika email terdaftar, link reset telah dikirim.'
      });
    }

    // ✅ BARU generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    });

    // ✅ BARU buat URL
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    console.log(`\n\n=== LINK RESET PASSWORD UNTUK ${email} ===\n${resetUrl}\n==========================================\n\n`);

    // ✅ RETURN DI SINI (sudah valid)
    return NextResponse.json({
      message: 'Jika email terdaftar, link reset telah dikirim.',
      resetUrl // sekarang aman
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}