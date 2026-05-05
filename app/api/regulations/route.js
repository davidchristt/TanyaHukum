import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        // 1. Tangkap parameter dari URL (untuk fitur search, filter, dan pagination)
        const { searchParams } = new URL(req.url);

        // Default: halaman 1, tampilkan 10 data per halaman
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";

        // 2. Rumus Pagination (Lewati data ke berapa)
        const skip = (page - 1) * limit;

        // 3. Susun aturan pencarian (Where Clause)
        const whereClause = {
            isActive: true, // Nyalakan ini kalau lu punya kolom isActive untuk soft-delete
            ...(search && { title: { contains: search, mode: "insensitive" } }), // Cari berdasarkan judul, abaikan huruf besar/kecil
            ...(category && { category: category }), // Filter kategori (misal: "Ketenagakerjaan" atau "Perdata")
        };

        // 4. Tarik data dan hitung total baris secara BERSAMAAN (Paralel biar cepat)
        const [regulations, totalCount] = await Promise.all([
            prisma.regulation.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: {
                    // Urutkan dari yang terbaru atau berdasarkan abjad (sesuaikan dengan schema lu)
                    title: "asc"
                },
                // [OPSIONAL TAPI PENTING]: Pilih kolom yang mau dikirim ke frontend biar hemat bandwidth
                select: {
                    id: true,
                    title: true,
                    category: true,
                    fileSize: true,
                    isProcessed: true,
                    fileUrl: true,
                    createdAt: true,
                    viewCount: true
                }
            }),
            prisma.regulation.count({ where: whereClause })
        ]);

        // 5. Hitung total halaman
        const totalPages = Math.ceil(totalCount / limit);

        // 6. Kirim respons yang rapi ke Frontend
        return NextResponse.json({
            data: regulations,
            meta: {
                totalData: totalCount,
                currentPage: page,
                dataPerPage: limit,
                totalPages: totalPages
            }
        });

    } catch (error) {
        console.error("API Regulations GET Error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat mengambil daftar regulasi." },
            { status: 500 }
        );
    }
}