/**
 * Supabase Server Client Utility
 * ------------------------------
 * File ini menggantikan library lama @supabase/auth-helpers-nextjs.
 * Digunakan untuk menginisialisasi client Supabase di:
 * - Route Handlers (API)
 * - Server Actions
 * - Server Components
 * 
 * Fungsi ini otomatis menangani sinkronisasi cookie antara Supabase dan Next.js.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Abaikan jika dipanggil dari Server Component
          }
        },
      },
    }
  )
}