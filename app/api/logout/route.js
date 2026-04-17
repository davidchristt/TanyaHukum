import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST: Menghapus sesi pengguna (Logout)
 */
export async function POST(request) {
  try {
    const supabase = createClient();

    // 1. Cek apakah ada user yang aktif sebelum logout
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 2. Sign out secara global (menghapus session di server Supabase)
      await supabase.auth.signOut({ scope: 'global' });
    }

    // 3. Buat URL tujuan redirect (ke halaman login)
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl, { status: 303 });

    // Note: Library @supabase/ssr otomatis menghapus cookie auth 
    // lewat middleware/server utilitas saat signOut dipanggil.
    // Tidak perlu lagi menghapus cookie secara manual.

    return response;

  } catch (error) {
    console.error("[LOGOUT_ERROR]:", error);
    
    // Jika gagal, tetap arahkan ke login dengan pesan error
    const errorUrl = new URL('/login?error=logout_failed', request.url);
    return NextResponse.redirect(errorUrl, { status: 303 });
  }
}
