// app/api/admin/users/route.js
// Baca semua user yang ada
// Dan create user

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,        // Penting untuk admin
          tier: true,        // Memantau status langganan
          promptLimit: true,  // Memantau kuota user
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc', // User terbaru di atas
        },
    });

    console.log("Data user berhasil diambil:", users.length, "orang"); // Muncul di terminal
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role, tier, promptLimit } = body;

    // 1. Validasi input sederhana
    if (!email || !password) {
      return NextResponse.json({ error: "Email dan Password wajib diisi" }, { status: 400 });
    }

    // 2. Hash password (jangan simpan plain text!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan ke Database
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword, // Sesuaikan dengan schema.prisma
        role: role || 'USER',
        tier: tier || 'FREE',
        promptLimit: promptLimit || 50, // Sesuaikan default schema (50)
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("DEBUG ERROR:", error); // Lihat ini di terminal VSCode
    return NextResponse.json({ 
        error: "Gagal membuat user", 
        detail: error.message // Tambahkan ini sementara untuk debug
    }, { status: 500 });
  }
}
