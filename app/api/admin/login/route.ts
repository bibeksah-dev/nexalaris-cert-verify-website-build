import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword, setAdminSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ═══════════════════════════════════════════")
    console.log("[v0] Admin login attempt started")
    console.log("[v0] Environment check:")
    console.log("[v0]   - NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing")
    console.log("[v0]   - NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing")
    console.log("[v0]   - ADMIN_DEFAULT_PASSWORD:", process.env.ADMIN_DEFAULT_PASSWORD ? "✓ Set" : "✗ Using default")

    const { password } = await request.json()

    if (!password) {
      console.log("[v0] ✗ No password provided")
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    console.log("[v0] Password provided, length:", password.length)
    console.log("[v0] Verifying password...")

    const isValid = await verifyAdminPassword(password)

    console.log("[v0] Password verification result:", isValid ? "✓ Valid" : "✗ Invalid")

    if (!isValid) {
      console.log("[v0] ═══════════════════════════════════════════")
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Set session cookie
    console.log("[v0] Setting admin session cookie...")
    await setAdminSession()
    console.log("[v0] ✓ Login successful!")
    console.log("[v0] ═══════════════════════════════════════════")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] ═══════════════════════════════════════════")
    console.error("[v0] ✗ Login error occurred:")
    console.error("[v0] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] ═══════════════════════════════════════════")

    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
