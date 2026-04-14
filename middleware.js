/**
 * Global Middleware
 * -----------------
 * Menjalankan updateSession untuk setiap request halaman.
 * Kamu bisa menambahkan logika proteksi rute di sini (contoh: membatasi
 * akses /dashboard hanya untuk user yang sudah login).
 */

import { updateSession } from './utils/supabase/middleware'

export async function middleware(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}