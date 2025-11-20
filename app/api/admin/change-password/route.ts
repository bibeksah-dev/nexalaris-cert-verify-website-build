import { type NextRequest, NextResponse } from "next/server"
import { changeAdminPassword, verifyAdminRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication + CSRF
    const verification = await verifyAdminRequest(request)
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error || "Unauthorized" }, { status: 401 })
    }

    const { current_password, new_password, confirm_new_password } = await request.json()

    // Validate inputs
    if (!current_password || !new_password || !confirm_new_password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (new_password !== confirm_new_password) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 })
    }

    if (new_password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Change password
    const result = await changeAdminPassword(current_password, new_password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
