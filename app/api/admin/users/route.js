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
          name: true,        // <-- TAMBAHAN INI BOS! Biar namanya ikut dikirim ke Frontend!
          email: true,
          role: true,        
          tier: true,        
          promptLimit: true,  
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc', 
        },
    });

    console.log("Data user berhasil diambil:", users.length, "orang"); 
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // PERBAIKAN: Tambahkan 'name' ke dalam destructuring
    const { email, password, role, tier, promptLimit, name } = body; 

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan Password wajib diisi" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name, // PERBAIKAN: Masukkan nama ke database
        passwordHash: hashedPassword, 
        role: role || 'USER',
        tier: tier || 'FREE',
        promptLimit: promptLimit || 50, 
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("DEBUG ERROR:", error); 
    return NextResponse.json({ 
        error: "Gagal membuat user", 
        detail: error.message 
    }, { status: 500 });
  }
}