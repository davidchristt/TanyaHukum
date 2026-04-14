/**
 * Supabase Middleware Utility
 * ---------------------------
 * Berfungsi untuk menjaga sesi pengguna tetap aktif (refresh token).
 * Penting: Middleware berjalan di Edge Runtime untuk memastikan:
 * 1. Sesi pengguna diperbarui secara otomatis sebelum request diproses.
 * 2. Cookie sesi tetap sinkron antara browser dan server Supabase.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh token otomatis
  await supabase.auth.getUser()

  return response
}