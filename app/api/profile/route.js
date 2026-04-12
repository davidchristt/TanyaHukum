// api untuk menampilkan data dari database ke halaman profile

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import prisma from "@/lib/prisma"; // Pastikan path ini sesuai dengan file prisma client-mu
import bcrypt from "bcrypt";

// ==========================================
// GET: Mengambil Data Profil (Untuk ditampilkan di UI)
// ==========================================
export async function GET(request) {
  try {
    // 1. Inisialisasi Supabase client dan ambil sesi
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    // 2. Validasi Autentikasi
    if (authError || !session) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." }, 
        { status: 401 }
      );
    }

    // 3. Ambil data dari database PostgreSQL via Prisma
    const userProfile = await prisma.user.findUnique({
      where: {
        supabaseId: session.user.id,
      },
      // Hanya pilih kolom yang diizinkan dilihat oleh frontend
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
        { error: "Data pengguna tidak ditemukan di database." }, 
        { status: 404 }
      );
    }

    // 4. Kirim respons sukses ke frontend
    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error("[GET_PROFILE_ERROR]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server." }, 
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH: Memperbarui Data Profil (Saat tombol "Simpan" ditekan)
// ==========================================
export async function PATCH(request) {
  try {
    // 1. Validasi Sesi
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized. Akses ditolak." }, { status: 401 });
    }

    // 2. Parsing Body
    const body = await request.json();
    const { name, email, newPassword, avatarUrl } = body;

    // ✅ 3. CEK authProvider DI SINI — sebelum updateData disiapkan
    // Ambil sekalian untuk keperluan where clause nanti
    const existingUser = await prisma.user.findUnique({
      where: { supabaseId: session.user.id },
      select: { authProvider: true }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    if (newPassword && existingUser.authProvider !== "CREDENTIALS") {
      return NextResponse.json(
        { error: "Akun OAuth tidak dapat mengatur password." },
        { status: 400 }
      );
    }

    // 4. Validasi Input
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (newPassword && newPassword.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    // 3. Siapkan objek data untuk di-update (hanya update field yang dikirim)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw new Error("Gagal update email di Supabase: " + error.message);
      updateData.email = email;
    }
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    
    // Jika ada kiriman kata sandi baru, hash menggunakan bcrypt
    if (newPassword && newPassword.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    // Kalau frontend kirim body kosong `{}`, query Prisma tetap jalan sia-sia
    // ✅ Tambahkan pengecekan ini sebelum eksekusi Prisma
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diperbarui." }, { status: 400 });
    }

    // ✅ Minimal cek apakah formatnya URL
    if (avatarUrl && !avatarUrl.startsWith("http")) {
      return NextResponse.json({ error: "Format URL avatar tidak valid." }, { status: 400 });
    }

    // 4. Eksekusi update ke database menggunakan Prisma
    const updatedUser = await prisma.user.update({
      where: { 
        email: session.user.email 
      },
      data: updateData,
      // Kembalikan data terbaru ke frontend tanpa menyertakan passwordHash
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      }
    });

    // 5. Kirim respons sukses
    return NextResponse.json(
      { 
        message: "Profil berhasil diperbarui.", 
        user: updatedUser 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("[PATCH_PROFILE_ERROR]:", error);
    
    // Penanganan error khusus jika email yang diinput ternyata sudah dipakai user lain
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Email tersebut sudah terdaftar." }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Gagal memperbarui profil." }, 
      { status: 500 }
    );
  }
}