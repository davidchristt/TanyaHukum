import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        // 1. Tangkap parameter dari URL
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        
        // [FITUR BARU]: Tangkap userId kalau dikirim sama Frontend (opsional)
        const userId = searchParams.get("userId") || null;

        // ==========================================================
        // [FITUR BARU]: Simpan ke SearchLog kalau ada pencarian
        // ==========================================================
        if (search && search.trim() !== "") {
            // Kita pakai .catch() aja tanpa await di depannya (Fire-and-forget).
            // Tujuannya biar API nggak jadi lambat nungguin proses nyatet log kelar.
            prisma.searchLog.create({
                data: {
                    query: search.trim(),
                    userId: userId // Masuk kalau ada, null kalau user belum login
                }
            }).catch(err => console.error("Gagal menyimpan SearchLog:", err));
        }
        // ==========================================================

        // 2. Rumus Pagination
        const skip = (page - 1) * limit;

        // 3. Susun aturan pencarian (Where Clause)
        const whereClause = {
            isActive: true, 
            ...(search && { title: { contains: search, mode: "insensitive" } }), 
            ...(category && { category: category }), 
        };

        // 4. Tarik data dan hitung total baris secara BERSAMAAN
        const [regulations, totalCount] = await Promise.all([
            prisma.regulation.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: {
                    title: "asc"
                },
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