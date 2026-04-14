// api untuk menampilkan data dari database ke halaman profile

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// ==========================================
// GET: Mengambil Data Profil
// ==========================================
export async function GET() {
  try {
    const supabase = createClient();
    
    // Verifikasi user (Pengganti getSession untuk keamanan CI/CD)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." }, 
        { status: 401 }
      );
    }

    const userProfile = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        tier: true,
        promptLimit: true,
      }
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Data pengguna tidak ditemukan." }, 
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error("[GET_PROFILE_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ==========================================
// PATCH: Memperbarui Data Profil
// ==========================================
export async function PATCH(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, newPassword, avatarUrl } = body;

    const existingUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Validasi Password & OAuth (Hanya jika user login via Email/Credentials)
    if (newPassword) {
      if (existingUser.authProvider !== "CREDENTIALS") {
        return NextResponse.json(
          { error: "Akun OAuth tidak bisa mengubah password di sini." },
          { status: 400 }
        );
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    
    if (avatarUrl) {
      if (!avatarUrl.startsWith("http")) {
        return NextResponse.json({ error: "URL Avatar tidak valid." }, { status: 400 });
      }
      updateData.avatarUrl = avatarUrl;
    }

    // Update Email di Supabase & Prisma
    if (email && email !== existingUser.email) {
      const { error: updateEmailError } = await supabase.auth.updateUser({ email });
      if (updateEmailError) {
        return NextResponse.json({ error: "Gagal update email: " + updateEmailError.message }, { status: 400 });
      }
      updateData.email = email;
    }

    // Hash Password
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan data." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { supabaseId: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      }
    });

    return NextResponse.json({ 
      message: "Profil berhasil diperbarui.", 
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error("[PATCH_PROFILE_ERROR]:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal memperbarui profil." }, { status: 500 });
  }
}