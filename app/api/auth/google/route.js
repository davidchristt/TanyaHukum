import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@/lib/prisma';

// Inisialisasi Google Client menggunakan ID dari .env
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request) {
  try {
    const { credentialToken } = await request.json();

    if (!credentialToken) {
      return NextResponse.json({ error: 'Token Google tidak ditemukan' }, { status: 400 });
    }

    // 1. Verifikasi keaslian token ke server Google
    const ticket = await client.verifyIdToken({
      idToken: credentialToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 2. Ambil data user dari tiket Google
    const payload = ticket.getPayload();
    const email = payload.email;
    // const name = payload.name; // Opsional: Jika kamu ingin menyimpan nama dari akun Google

    if (!email) {
      return NextResponse.json({ error: 'Gagal mendapatkan email dari Google' }, { status: 400 });
    }

    // 3. Cek apakah user dengan email ini sudah ada di database kita
    let user = await prisma.user.findUnique({
      where: { email: email }
    });

    // 4. Jika user belum ada, daftarkan secara otomatis (Register)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email,
          authProvider: 'GOOGLE', // Penanda bahwa ini akun Google
          // passwordHash dibiarkan kosong (null) karena akun Google tidak punya password
        }
      });
    }

    // 5. Berhasil! Kembalikan data user seperti login biasa
    return NextResponse.json({ 
      message: 'Login Google berhasil', 
      user: { 
        id: user.id, 
        email: user.email,
        tier: user.tier,
        promptLimit: user.promptLimit,
        authProvider: user.authProvider
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Google Login Error:", error);
    return NextResponse.json({ error: 'Token tidak valid atau terjadi kesalahan server' }, { status: 401 });
  }
}