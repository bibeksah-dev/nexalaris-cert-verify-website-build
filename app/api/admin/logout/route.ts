import { NextResponse } from "next/server"
import { clearAdminSession, verifyAdminRequest } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verify session + CSRF
    // adapt to NextRequest shape by casting if needed
    // @ts-ignore
    const verification = await verifyAdminRequest(request)
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error || "Unauthorized" }, { status: 401 })
    }

    await clearAdminSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
