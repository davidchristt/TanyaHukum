// app/api/admin/trending/[id]/route.js
// delete trending

import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// DELETE: Hapus Isu Terkini
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

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
