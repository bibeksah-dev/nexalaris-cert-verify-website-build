import { cookies } from "next/headers"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

const SESSION_COOKIE = "nexalaris_admin_session"
const SESSION_TTL = 30 * 24 * 60 * 60 // 30 days in seconds

export async function getAdminSession() {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export async function setAdminSession() {
  const cookieStore = await cookies()
  const sessionToken = crypto.randomUUID()

  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
    path: "/",
  })

  return sessionToken
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  console.log("[v0] Fetching admin auth from database...")

  // Get the admin password hash
  const { data: adminAuth, error } = await supabase.from("admin_auth").select("password_hash").single()

  if (error || !adminAuth) {
    console.log("[v0] No admin auth found, creating default...")
    // If no admin auth exists, create default
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "changeMeNow!"
    console.log(
      "[v0] Default password set to:",
      defaultPassword === "changeMeNow!" ? "changeMeNow!" : "custom from env",
    )
    const hash = await bcrypt.hash(defaultPassword, 10)

    const { error: insertError } = await supabase.from("admin_auth").insert({ password_hash: hash })

    if (insertError) {
      console.error("[v0] Failed to create default admin auth:", insertError)
    } else {
      console.log("[v0] Default admin auth created successfully")
    }

    // Check if provided password matches default
    const matches = password === defaultPassword
    console.log("[v0] Password matches default:", matches)
    return matches
  }

  console.log("[v0] Admin auth found, comparing password...")
  // Verify password
  const result = await bcrypt.compare(password, adminAuth.password_hash)
  console.log("[v0] Password comparison result:", result)
  return result
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  // Verify current password
  const isValid = await verifyAdminPassword(currentPassword)
  if (!isValid) {
    return { success: false, error: "Current password is incorrect" }
  }

  // Hash new password
  const hash = await bcrypt.hash(newPassword, 10)

  // Update password
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from("admin_auth")
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .eq("id", 1)

  if (error) {
    return { success: false, error: "Failed to update password" }
  }

  return { success: true }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return !!session
}
