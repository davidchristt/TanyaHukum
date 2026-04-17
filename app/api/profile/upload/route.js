// api untuk mengupload foto di halaman profile
// HANYA FOTO SAJA. DATA LAIN MENGGUNAKAN API app/api/profile/route.js

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST: Upload Foto Profil ke Supabase Storage & Update DB
 */
export async function POST(request) {
  try {
    const supabase = createClient();
    
    // 1. Verifikasi user secara aman
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Ambil data file dari FormData
    const formData = await request.formData();
    const file = formData.get("file"); // Key harus "file" di frontend

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    // 3. Validasi Ukuran (2MB)
    const MAX_SIZE = 2 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB." }, { status: 400 });
    }

    // 4. Validasi Tipe & Ekstensi
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const fileExt = file.name.split('.').pop().toLowerCase();
    const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"];

    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXT.includes(fileExt)) {
      return NextResponse.json(
        { error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." }, 
        { status: 400 }
      );
    }

    // 5. Nama File Unik (berdasarkan ID user agar tidak menumpuk)
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `public/${fileName}`; 

    // 6. Proses Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars") // Pastikan nama bucket ini sudah dibuat di dashboard
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[STORAGE_ERROR]:", uploadError);
      return NextResponse.json({ error: "Gagal menyimpan file di storage." }, { status: 500 });
    }

    // 7. Ambil Public URL
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 8. Update URL di Database Prisma
    const updatedUser = await prisma.user.update({
      where: { supabaseId: user.id },
      data: { avatarUrl: publicUrl },
      select: { id: true, name: true, avatarUrl: true }
    });

    return NextResponse.json({
      message: "Foto profil berhasil diperbarui.",
      user: updatedUser
    }, { status: 201 });

  } catch (error) {
    console.error("[UPLOAD_ROUTE_ERROR]:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal." }, { status: 500 });
  }
}