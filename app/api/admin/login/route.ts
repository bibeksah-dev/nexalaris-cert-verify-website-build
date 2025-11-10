import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword, setAdminSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    console.log("[v0] Admin login attempt")

    if (!password) {
      console.log("[v0] No password provided")
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    console.log("[v0] Verifying password...")
    const isValid = await verifyAdminPassword(password)
    console.log("[v0] Password valid:", isValid)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Set session cookie
    console.log("[v0] Setting admin session...")
    await setAdminSession()
    console.log("[v0] Login successful")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
