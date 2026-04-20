import { createClient } from "@/utils/supabase/server";
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

    const supabase = await createClient();

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
      return NextResponse.json({ error: "Maks 2MB." }, { status: 400 });
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format tidak valid." }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop().toLowerCase();
    const fileName = `${payload.userId}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // ======================
    // UPLOAD
    // ======================
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Upload gagal." }, { status: 500 });
    }

    // ======================
    // PUBLIC URL
    // ======================
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // ======================
    // UPDATE DB (PAKAI ID, BUKAN supabaseId)
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
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}