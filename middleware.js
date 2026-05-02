/**
 * Global Middleware
 * -----------------
 * Menjalankan updateSession untuk setiap request halaman.
 * Kamu bisa menambahkan logika proteksi rute di sini (contoh: membatasi
 * akses /dashboard hanya untuk user yang sudah login).
 */

// middleware.js
import { updateSession } from './utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // 1. Jalankan update session bawaan (untuk refresh token)
  const response = await updateSession(request)
  
  // 2. Buat client supabase untuk cek session & role
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 3. Proteksi Endpoint API Admin
  // Cek apakah request menuju ke path /api/users atau /api/admin
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Jika tidak login atau role bukan ADMIN, blokir
    // Catatan: Pastikan role ini ada di 'user_metadata' atau ambil dari database via Prisma
    if (!user || user.user_metadata?.role !== 'ADMIN') {
       return NextResponse.json(
         { error: 'Forbidden: Admin access only' },
         { status: 403 }
       )
     }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
