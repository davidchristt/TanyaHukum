import { createAdminClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/src/lib/auth-server";

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Sesi Anda telah berakhir, silakan masuk kembali." },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    // Gunakan admin client untuk bypass RLS di storage
    const supabase = await createAdminClient();

    // ======================
    // FILE
    // ======================
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    // VALIDASI
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB." }, { status: 400 });
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format file tidak didukung (Gunakan JPG, PNG, atau WebP)." }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop().toLowerCase();
    // Gunakan userId langsung sebagai nama file untuk mempermudah management & cache
    const fileName = `${payload.userId}.${fileExt}`;
    const filePath = `${fileName}`; // Simpan di root bucket agar lebih simpel

    // ======================
    // UPLOAD (Convert to Buffer for stability)
    // ======================
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      return NextResponse.json({ error: `Gagal mengunggah ke storage: ${uploadError.message}` }, { status: 500 });
    }

    // ======================
    // PUBLIC URL
    // ======================
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // ======================
    // UPDATE DB
    // ======================
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { avatarUrl: publicUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        tier: true,
      },
    });

    return NextResponse.json({
      message: "Upload berhasil",
      url: publicUrl,
      user: updatedUser,
    });

  } catch (err) {
    console.error("Upload Route Error:", err);

    // Distinguish between auth errors and other server errors
    if (err.message === "Invalid token" || err.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Sesi Anda telah berakhir, silakan masuk kembali." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `Internal Server Error: ${err.message}` },
      { status: 500 }
    );
  }
}