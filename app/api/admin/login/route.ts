import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword } from "@/lib/auth"

const SESSION_COOKIE = "nexalaris_admin_session"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const isValid = await verifyAdminPassword(password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      redirect: "/admin/dashboard",
    })

    response.cookies.set({
      name: SESSION_COOKIE,
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
