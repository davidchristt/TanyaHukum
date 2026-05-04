// app/api/regulations/route.js
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// GET: Ambil semua daftar dokumen hukum (Untuk Publik/User)
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