// app/api/admin/users/route.js
// Baca semua user yang ada
// Dan create user

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tier: true,
        promptLimit: true,
        createdAt: true,
        _count: {
          select: {
            messages: {
              where: {
                role: 'USER',
                createdAt: { gte: today }
              }
            }
          }
        },
        messages: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedUsers = users.map(user => ({
      ...user,
      remainingQuota: Math.max(0, user.promptLimit - (user._count?.messages || 0)),
      lastActive: user.messages?.[0]?.createdAt || null,
      _count: undefined,
      messages: undefined
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
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