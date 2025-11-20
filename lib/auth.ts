import { cookies } from "next/headers"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "nexalaris_admin_session"
const CSRF_COOKIE = "nexalaris_admin_csrf"
const SESSION_TTL = 7 * 24 * 60 * 60 // 7 days in seconds

// Return raw token from cookie
export async function getAdminSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

// Create a server-side session record and set cookies (session token + csrf token)
export async function setAdminSession() {
  const cookieStore = await cookies()
  const supabase = await getSupabaseServerClient()

  const token = crypto.randomBytes(32).toString("hex")
  const csrf = crypto.randomBytes(16).toString("hex")
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL * 1000).toISOString()

  await supabase.from("admin_sessions").insert({ token, created_at: now.toISOString(), expires_at: expiresAt })

  // Set secure, httpOnly session cookie and accessible CSRF cookie (double-submit)
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_TTL,
    path: "/",
  })

  cookieStore.set(CSRF_COOKIE, csrf, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_TTL,
    path: "/",
  })

  return { token, csrf }
}

// Clear session both server-side and cookie
export async function clearAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  try {
    if (token) {
      const supabase = await getSupabaseServerClient()
      await supabase.from("admin_sessions").delete().eq("token", token)
    }
  } catch (err) {
    // ignore
  }

  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(CSRF_COOKIE)
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  // Get the admin password hash
  const { data: adminAuth, error } = await supabase.from("admin_auth").select("password_hash").single()

  if (error || !adminAuth) {
    // Do not auto-create default credentials. Fail authentication instead.
    return false
  }

  // Verify password
  const result = await bcrypt.compare(password, adminAuth.password_hash)
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

// Validate session token exists server-side and is not expired
export async function isSessionTokenValid(token?: string) {
  if (!token) return false
  const supabase = await getSupabaseServerClient()
  const now = new Date().toISOString()
  const { data } = await supabase.from("admin_sessions").select("token").eq("token", token).gt("expires_at", now).limit(1).single()
  return !!data
}

// Verify admin for an incoming request: checks session token and CSRF header
export async function verifyAdminRequest(request: NextRequest): Promise<{ ok: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    const csrfCookie = cookieStore.get(CSRF_COOKIE)?.value
    const csrfHeader = request.headers.get("x-csrf-token") || ""

    if (!token) return { ok: false, error: "No session" }

    const valid = await isSessionTokenValid(token)
    if (!valid) return { ok: false, error: "Invalid session" }

    // Verify CSRF (double-submit)
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return { ok: false, error: "CSRF validation failed" }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: "Verification error" }
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminSessionToken()
  return await isSessionTokenValid(token)
}
