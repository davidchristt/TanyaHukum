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

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
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

export async function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Pakai Service Role Key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}