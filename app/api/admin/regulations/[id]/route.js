// app/api/admin/regulations/[id]/route.js

import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// DELETE: Hapus dokumen berdasarkan ID
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await prisma.regulation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Dokumen berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting regulation:", error);
    return NextResponse.json(
      { error: "Gagal menghapus dokumen" },
      { status: 500 }
    );
  }
}

// PATCH: Update/Edit dokumen berdasarkan ID
export async function PATCH(req, { params }) {
  try {
    const { id } = await params; // Wajib await params di Next.js terbaru
    const body = await req.json();
    
    // Ambil data yang dikirim dari Frontend
    const { title, description, fileUrl, category } = body;

    // Update data di database
    const updatedRegulation = await prisma.regulation.update({
      where: { id },
      data: {
        title,
        description,
        fileUrl,
        category
      },
    });

    return NextResponse.json(updatedRegulation, { status: 200 });
  } catch (error) {
    console.error("Error updating regulation:", error);
    
    // Kalau data tidak ditemukan di database
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: "Gagal mengupdate dokumen" },
      { status: 500 }
    );
  }
}