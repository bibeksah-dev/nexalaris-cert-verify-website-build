import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { verifyAdminRequest } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ cert_code: string }> }) {
  try {
    const verification = await verifyAdminRequest(request as any)
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error || "Unauthorized" }, { status: 401 })
    }

    const { cert_code } = await params
    const supabase = await getSupabaseServerClient()

    const { error } = await supabase
      .from("certificates")
      .update({ status: "REVOKED", updated_at: new Date().toISOString() })
      .eq("cert_code", cert_code)

    if (error) {
      return NextResponse.json({ error: "Failed to revoke certificate" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Revoke error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
