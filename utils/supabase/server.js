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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Anon Key are missing in environment variables.");
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
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

/**
 * createAdminClient
 * ----------------
 * Gunakan ini HANYA di sisi server (Route Handlers / Server Actions).
 * Menggunakan SERVICE_ROLE_KEY untuk bypass RLS.
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Fallback ke ANON_KEY jika SERVICE_ROLE_KEY tidak diset (meski mungkin kena RLS)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing in environment variables.");
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}