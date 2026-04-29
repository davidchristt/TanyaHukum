// app/api/users/[id]
// Hapus user

// app/api/users/[id]/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });
    // return NextResponse.json({ message: "User berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error.code);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Tidak bisa menghapus user karena masih memiliki data terkait" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}