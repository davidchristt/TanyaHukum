// app/api/auth/forgot-password/route.js

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/email';

// Rate limiting sederhana menggunakan in-memory store
// Untuk production, gunakan Redis (misalnya @upstash/ratelimit)
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 menit
  const maxRequests = 3;

  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  // Reset window jika sudah lewat 15 menit
  if (now - record.startTime > windowMs) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request) {
  try {
    // 1. Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi dalam 15 menit.' },
        { status: 429 }
      );
    }

    // 2. Parse & validasi input
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // 3. Pesan generik — selalu sama, mencegah user enumeration
    const genericResponse = NextResponse.json({
      message: 'Jika email terdaftar, link reset telah dikirim.',
    });

    // 4. Cek user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Tetap return 200 agar attacker tidak bisa tahu email terdaftar atau tidak
      return genericResponse;
    }

    // 5. Generate token — simpan HASH-nya di DB, kirim token asli ke email
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,      // simpan hash, BUKAN token asli
        resetTokenExpiry,
      },
    });

    // 6. Buat URL menggunakan env variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // 7. Kirim email (token asli dikirim via email, TIDAK di-expose ke response)
    await sendResetPasswordEmail({ to: email, resetUrl });

    return genericResponse;

  } catch (error) {
    console.error('Forgot Password Error:', error);

    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}