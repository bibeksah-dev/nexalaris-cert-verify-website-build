import { cookies } from "next/headers"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

const SESSION_COOKIE = "nexalaris_admin_session"
const SESSION_TTL = 30 * 24 * 60 * 60 // 30 days in seconds

export async function getAdminSession() {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  const { data: adminAuth, error } = await supabase.from("admin_auth").select("password_hash").limit(1).single()

  if (error || !adminAuth) {
    const { data: existingAdmin } = await supabase.from("admin_auth").select("id").limit(1).single()

    if (existingAdmin) {
      return false
    }

    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "changeit!"
    const hash = await bcrypt.hash(defaultPassword, 10)

    const { error: insertError } = await supabase.from("admin_auth").insert({ password_hash: hash })

    if (insertError) {
      return false
    }

    return password === defaultPassword
  }

  const isValid = await bcrypt.compare(password, adminAuth.password_hash)
  return isValid
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const isValid = await verifyAdminPassword(currentPassword)
  if (!isValid) {
    return { success: false, error: "Current password is incorrect" }
  }

  const hash = await bcrypt.hash(newPassword, 10)

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from("admin_auth")
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .limit(1)

  if (error) {
    return { success: false, error: "Failed to update password" }
  }

  return { success: true }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return !!session
}
