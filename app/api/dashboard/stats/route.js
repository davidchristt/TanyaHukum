// app/api/dashboard/stats/route.js

import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { Prisma } from "@prisma/client";

// WARNING: REMOVE BEFORE PRODUCTION - replace with real DB queries
const PLACEHOLDER_DATA = {
  dokumen_terpopuler: [
    { name: "UU ITE", views: 400 },
    { name: "KUHP", views: 300 },
    { name: "UU Cipta Kerja", views: 200 }
  ],
  isu_terkini: [
    {
      id: "1",
      title: "Maling Helm di unpad",
      description: "Pelaku kabur ke Pangdam",
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
  tren_pencarian: [
    { date: "2026-04-01", searches: 120 },
    { date: "2026-04-02", searches: 150 },
    { date: "2026-04-03", searches: 180 }
  ]
};

export async function GET() {
  try {
    const [totalUsers, totalInteractions] = await Promise.all([
      prisma.user.count(),
      prisma.chatHistory.count()
    ]);

    const isDev = process.env.NODE_ENV === "development";

    const responseData = {
      success: true,
      data: {
        summary: {
          total_regulasi: {
            value: 100, // TODO: Ganti dengan prisma.regulation.count()
            growth: null, // TODO: Hitung dari data historis
            ...(isDev && { _note: "Not implemented yet" })
          },
          pengguna_aktif: {
            value: totalUsers,
            growth: null,
            ...(isDev && { _note: "Growth belum dihitung" })
          },
          interaksi_harian: {
            value: totalInteractions,
            growth: null,
            ...(isDev && { _note: "Growth belum dihitung" })
          }
        },
        ...PLACEHOLDER_DATA // ← di-spread di sini
      }
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" }
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