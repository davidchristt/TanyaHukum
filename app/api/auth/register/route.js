// logika registrasi akun

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validasi Input (Username sudah dihapus)
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 409 });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan ke Database via Prisma
    const newUser = await prisma.user.create({
      data: {
        email: email,
        passwordHash: hashedPassword, // Sesuaikan dengan schema.prisma
      }
    });

    return NextResponse.json({ message: 'Registrasi berhasil', userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}