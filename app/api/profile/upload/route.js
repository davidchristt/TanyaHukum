import { createAdminClient } from "@/utils/supabase/server"; // Pastikan fungsi ini sudah Anda buat
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "../../../../src/lib/auth-server";

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    // GUNAKAN ADMIN CLIENT agar bypass RLS
    const supabase = await createAdminClient();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    // VALIDASI UKURAN (2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Maks 2MB." }, { status: 400 });
    }

    // VALIDASI FORMAT
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format tidak valid." }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop().toLowerCase();
    
    // GUNAKAN TIMESTAMP pada nama file agar browser tidak cache foto lama
    const fileName = `${payload.userId}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // Simpan di root bucket saja

    // Konversi file ke Buffer (lebih stabil untuk server-side upload)
    const buffer = Buffer.from(await file.arrayBuffer());

    // ======================
    // UPLOAD KE STORAGE
    // ======================
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Error:", uploadError);
      return NextResponse.json({ error: "Upload ke storage gagal." }, { status: 500 });
    }

    // ======================
    // AMBIL PUBLIC URL
    // ======================
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // ======================
    // UPDATE DATABASE (PRISMA)
    // ======================
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { avatarUrl: publicUrl },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      message: "Berhasil upload",
      user: updatedUser,
    });

  } catch (err) {
    console.error("Catch Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
