import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request) {
  try {
    // 1. Inisialisasi Supabase client untuk membaca dan memanipulasi cookies
    const supabase = createRouteHandlerClient({ cookies });

    // 2. Autentikasi sebelum logout
    const { data: { session } } = await supabase.auth.getSession();
    
    // 3. Perintahkan Supabase untuk menghapus sesi/token saat ini
    if (session) {
      await supabase.auth.signOut({ scope: 'global' });
    }

    // 4. Buat URL tujuan redirect (menuju localhost:3000/login)
    // request.url secara otomatis akan mengambil base URL server saat ini
    const loginUrl = new URL('/login', request.url);

    // 5. Hapus Cookie Manual (Defense in Depth)
    const response = NextResponse.redirect(loginUrl, { status: 303 });
    
    // Pastikan cookie terhapus meski signOut gagal
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    return response;

  } catch (error) {
    console.error("[LOGOUT_ERROR]:", error);
    // Jika terjadi error (misal jaringan putus), tetap kembalikan pesan error
    const errorUrl = new URL('/login?error=logout_failed', request.url);
    return NextResponse.redirect(errorUrl, { status: 303 });
  }
}