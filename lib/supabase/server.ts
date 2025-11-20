import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Safety check: ensure service role key isn't accidentally exposed as a public env var.
if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Security: SUPABASE_SERVICE_ROLE_KEY must not be exposed via NEXT_PUBLIC_SUPABASE_ANON_KEY")
    // Throw to fail fast in case of accidental exposure
    throw new Error("Supabase service role key exposed in NEXT_PUBLIC env var")
  } else {
    console.warn("Ensure you are not exposing privileged Supabase keys via NEXT_PUBLIC_ env vars")
  }
}

export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }

  const cookieStore = await cookies()

  return createSupabaseServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server component
        }
      },
    },
  })
}

export async function createServerClient() {
  return getSupabaseServerClient()
}

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
