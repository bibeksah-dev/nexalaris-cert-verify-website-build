import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const verification = await verifyAdminRequest(request)
  if (!verification.ok) {
    return NextResponse.json({ ok: false, error: verification.error || "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
