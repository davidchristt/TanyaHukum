import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10") || 10));
        const search = searchParams.get("search")?.trim() || "";
        const category = searchParams.get("category") || "";
        const sortBy = searchParams.get("sortBy") || "title";
        const order = searchParams.get("order") || (sortBy === "title" ? "asc" : "desc");
        const userId = searchParams.get("userId") || null;

        // [LOG]: Simpan ke SearchLog (Asynchronous, don't await to keep response fast)
        if (search) {
            prisma.searchLog.create({
                data: {
                    query: search,
                    userId: userId 
                }
            }).catch(err => console.error("SearchLog Error:", err));
        }

        const skip = (page - 1) * limit;

        // Susun Filter
        const whereClause = {
            isActive: true,
            ...(search && {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } }
                ]
            }),
            ...(category && category !== "Semua" && { category: category }),
        };

        // Susun Sort
        const orderBy = { [sortBy]: order };

        // Fetch Data
        const [regulations, totalCount] = await Promise.all([
            prisma.regulation.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: orderBy,
                select: {
                    id: true,
                    title: true,
                    description: true, // Tambahkan ini agar tidak kosong di detail
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

        const totalPages = Math.ceil(totalCount / limit);

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
            { 
                error: "Terjadi kesalahan saat mengambil daftar regulasi.",
                details: error.message 
            },
            { status: 500 }
        );
    }
}