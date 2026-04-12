// app/api/dashboard/stats/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Jalankan query database yang sudah ada (secara paralel)
    const [totalUsers, totalInteractions] = await Promise.all([
      prisma.user.count(),
      prisma.chatHistory.count()
    ]);

    // 2. Siapkan Kontrak JSON sesuai desain Frontend
    const responseData = {
      success: true,
      data: {
        // Section: Cards Angka Statistik
        summary: {
          total_regulasi: {
            value: 100, // TODO: Ganti dengan prisma.regulation.count() nanti
            growth: "+12% from last month"
          },
          pengguna_aktif: {
            value: totalUsers,
            growth: "+5% from last month" 
          },
          interaksi_harian: {
            value: totalInteractions,
            growth: "+10% from last month"
          }
        },

        // Section: Chart Dokumen Terpopuler
        dokumen_terpopuler: [
          { name: "UU ITE", views: 400 },
          { name: "KUHP", views: 300 },
          { name: "UU Cipta Kerja", views: 200 }
        ],

        // Section: List Isu Terkini
        isu_terkini: [
          {
            id: "1",
            title: "Maling Helm di unpad",
            description: "Pelaku kabur ke Pangdam",
            // Praktik terbaik Backend: Kirim ISO timestamp asli, biarkan Frontend yang
            // mengubahnya menjadi "2 J Lalu" menggunakan library waktu mereka.
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
          },
          {
            id: "2",
            title: "Aksi demo gedung sate",
            description: "Demo berlangsung siang hari",
            createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            title: "Begal di jatinangor",
            description: "Pelaku kabur lewat gang",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          }
        ],

        // Section: Tren Pencarian (Asumsi untuk Line Chart)
        tren_pencarian: [
          { date: "2026-04-01", searches: 120 },
          { date: "2026-04-02", searches: 150 },
          { date: "2026-04-03", searches: 180 }
        ]
      }
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}