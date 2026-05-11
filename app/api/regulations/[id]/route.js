import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// 1. GET: MURNI UNTUK MENGAMBIL DATA (Aman di-cache oleh Vercel)
// ==========================================
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID Regulasi wajib disertakan." },
        { status: 400 }
      );
    }

    const regulation = await prisma.regulation.findUnique({
      where: { id: id },
    });

    if (!regulation) {
      return NextResponse.json(
        { error: "Data hukum tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: regulation,
      message: "Berhasil mengambil detail regulasi.",
    });

  } catch (error) {
    console.error("API Regulations GET [id] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat memproses detail regulasi." },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. PATCH: KHUSUS UNTUK MENAMBAH VIEW COUNT (+1)
// ==========================================
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID Regulasi wajib disertakan." },
        { status: 400 }
      );
    }

    await prisma.regulation.update({
      where: { id: id },
      data: {
        viewCount: {
          increment: 1, // Otomatis nambah +1 di database
        },
      },
    });

    return NextResponse.json({
      message: "View count berhasil ditambahkan.",
    });

  } catch (error) {
    console.error("API Regulations PATCH [id] Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui view count." },
      { status: 500 }
    );
  }
}