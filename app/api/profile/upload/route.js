// api untuk mengupload foto di halaman profile
// HANYA FOTO SAJA. DATA LAIN MENGGUNAKAN API app/api/profile/route.js

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // 1. Validasi Sesi User
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Tangkap Data File dari request (berupa FormData)
    const formData = await request.formData();
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 2MB." }, 
        { status: 400 }
      );
    } // "file" adalah nama key yang harus dikirim frontend

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    // 3. Validasi Tipe File (Pastikan hanya gambar)
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
    }
    if (!ALLOWED_EXT.includes(fileExt.toLowerCase())) {
      return NextResponse.json({ error: "Ekstensi file tidak valid." }, { status: 400 });
    }

    // 4. Siapkan Nama File yang Unik
    // Format: id_user-timestamp.ekstensi (agar tidak bentrok dengan user lain)
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}.${fileExt}`;
    // Path di dalam bucket Supabase
    const filePath = `public/${fileName}`; 

    // 5. Unggah File ke Supabase Storage (ke bucket bernama "avatars")
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars") // Ganti jika nama bucket-mu berbeda
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Timpa file lama jika namanya sama
      });

    if (uploadError) {
      console.error("[SUPABASE_STORAGE_ERROR]:", uploadError);
      throw new Error("Gagal mengunggah gambar ke penyimpanan.");
    }

    // 6. Dapatkan URL Publik dari gambar yang baru diunggah
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 7. Simpan URL tersebut ke Database PostgreSQL via Prisma
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { avatarUrl: publicUrl },
      select: { id: true, name: true, avatarUrl: true } // Kembalikan data yang relevan
    });

    // 8. Kirim Respons Sukses
    return NextResponse.json({
      message: "Foto profil berhasil diunggah.",
      user: updatedUser
    }, { status: 201 });

  } catch (error) {
    console.error("[POST_UPLOAD_ERROR]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses unggahan foto." }, 
      { status: 500 }
    );
  }
}