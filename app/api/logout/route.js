import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST: Menghapus sesi pengguna (Logout)
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // 1. Cek apakah ada user yang aktif sebelum logout
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 2. Sign out secara global (menghapus session di server Supabase)
      await supabase.auth.signOut({ scope: 'global' });
    }

    // 3. Hapus JWT cookie dan redirect ke login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl, { status: 303 });

    // Hapus JWT cookie (auth utama pakai JWT, bukan hanya Supabase)
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    return response;

  } catch (error) {
    console.error("[LOGOUT_ERROR]:", error);
    
    // Jika gagal, tetap arahkan ke login dengan pesan error
    const errorUrl = new URL('/login?error=logout_failed', request.url);
    return NextResponse.json({
      message: "Logout success"
    });
  }
}
