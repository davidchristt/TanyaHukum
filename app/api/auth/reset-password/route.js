// Logika reset password

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token dan password baru wajib diisi' }, { status: 400 });
    }

    // 1. Cari user berdasarkan token yang cocok DAN belum kedaluwarsa
    const user = await prisma.user.findUnique({
      where: { resetToken: token }
    });

    // Jika user tidak ditemukan, atau token sudah lewat batas waktunya
    if (!user || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Token tidak valid atau sudah kedaluwarsa' }, { status: 400 });
    }

    // 2. Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update password user dan HAPUS tokennya agar tidak bisa dipakai lagi
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    return NextResponse.json({ message: 'Password berhasil diubah. Silakan login kembali.' }, { status: 200 });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}