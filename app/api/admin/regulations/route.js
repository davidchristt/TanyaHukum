// app/api/admin/regulations/route.js
// API ini akan menerima data metadata dan URL file yang sudah diupload ke Storage supabase.
// Method: POST ke /api/admin/regulations.
// Payload: Kirim JSON berisi { "title": string, "description": string, "fileUrl": string }.

import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// GET: Ambil semua daftar dokumen hukum
export async function GET() {
  try {
    const regulations = await prisma.regulation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(regulations);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data dokumen" },
      { status: 500 }
    );
  }
}

// POST: Input dokumen hukum baru
export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description, fileUrl, category } = body;

    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: "Judul dan link file wajib diisi" },
        { status: 400 }
      );
    }

    const newRegulation = await prisma.regulation.create({
      data: {
        title,
        description,
        fileUrl,
        category,
        isActive: true,
      },
    });

    return NextResponse.json(newRegulation, { status: 201 });
  } catch (error) {
    console.error("Error creating regulation:", error);
    return NextResponse.json(
      { error: "Gagal menginput dokumen hukum" },
      { status: 500 }
    );
  }
}