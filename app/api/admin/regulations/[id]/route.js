// app/api/admin/regulations/[id]/route.js
// delete dokumen

import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// DELETE: Hapus dokumen berdasarkan ID
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

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