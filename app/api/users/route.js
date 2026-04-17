// app/api/users/route.js
// Baca semua user yang ada

// app/api/users/route.js
import prisma from '@/lib/prisma';
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
