import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    // 1. Tarik Data Utama (Sama seperti sebelumnya)
    const [
      totalUsers, 
      totalInteractions, 
      totalRegulations,
      popularDocsData,
      trendingIssuesData
    ] = await Promise.all([
      prisma.user.count(),
      prisma.chatHistory.count(),
      prisma.regulation.count(),
      
      prisma.regulation.findMany({
        orderBy: { viewCount: 'desc' },
        take: 3,
        select: { title: true, viewCount: true }
      }),
      
      prisma.trendingIssue.findMany({
        orderBy: { publishDate: 'desc' },
        take: 3
      })
    ]);

    // 2. Tarik & Rekap Data Tren Pencarian per Hari
    // Menggunakan fitur groupBy milik Prisma
    const searchTrendsRaw = await prisma.searchLog.groupBy({
      by: ['createdAt'], // Kelompokkan berdasarkan waktu
      _count: {
        id: true, // Hitung jumlah ID per waktu
      },
      orderBy: {
        createdAt: 'asc', // Urutkan dari yang terlama ke terbaru (untuk grafik)
      },
      take: 30 // Ambil maksimal 30 hari terakhir biar grafik nggak kepanjangan
    });

    // Karena Prisma mengelompokkan berdasarkan waktu persis (jam/menit/detik), 
    // kita harus merapikannya dengan JavaScript agar murni dikelompokkan per "Tanggal" (YYYY-MM-DD).
    const trendMap = {};
    searchTrendsRaw.forEach((log) => {
      // Ambil format YYYY-MM-DD
      const dateKey = log.createdAt.toISOString().split('T')[0]; 
      
      if (trendMap[dateKey]) {
        trendMap[dateKey] += log._count.id;
      } else {
        trendMap[dateKey] = log._count.id;
      }
    });

    // Ubah Object map tadi menjadi Array agar disukai oleh grafik Frontend bos
    const formattedSearchTrends = Object.keys(trendMap).map((date) => ({
      date: date,
      searches: trendMap[date]
    }));

    // 3. Format Data untuk Frontend
    const formattedPopularDocs = popularDocsData.map(doc => ({
      name: doc.title,
      views: doc.viewCount || 0
    }));

    const isDev = process.env.NODE_ENV === "development";

    const responseData = {
      success: true,
      data: {
        summary: {
          total_regulasi: {
            value: totalRegulations,
            growth: null,
            ...(isDev && { _note: "Growth belum dihitung" })
          },
          pengguna_aktif: {
            value: totalUsers,
            growth: null,
          },
          interaksi_harian: {
            value: totalInteractions,
            growth: null,
          }
        },
        dokumen_terpopuler: formattedPopularDocs,
        isu_terkini: trendingIssuesData,
        tren_pencarian: formattedSearchTrends // <-- BOOM! Sekarang datanya 100% dari tabel SearchLog!
      }
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: { "Cache-Control": "no-store" } 
    });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("DB Query Error:", error.code, error.message);
    } else {
      console.error("Unexpected Error:", error);
    }
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}