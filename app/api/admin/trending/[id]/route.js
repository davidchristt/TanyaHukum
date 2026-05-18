import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// DELETE: Hapus Isu Terkini
export async function DELETE(req, { params }) {
  try {
    // PERBAIKAN: Wajib pakai await params di Next.js versi terbaru!
    const { id } = await params;

    await prisma.trendingIssue.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Isu terkini berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Gagal menghapus isu" },
      { status: 500 }
    );
  }
}

// PATCH: Edit Isu Terkini
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, newsLink, location } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Judul dan deskripsi wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.trendingIssue.update({
      where: { id },
      data: {
        title,
        description,
        newsLink: newsLink || null,
        location: location || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate isu" },
      { status: 500 }
    );
  }
}