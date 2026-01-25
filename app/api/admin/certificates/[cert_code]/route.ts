import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { verifyAdminRequest } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ cert_code: string }> }) {
  try {
    const verification = await verifyAdminRequest(request as any)
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error || "Unauthorized" }, { status: 401 })
    }

    const { cert_code } = await params
    const body = await request.json()
    const { achievements_markdown } = body

    if (!achievements_markdown || typeof achievements_markdown !== "string") {
      return NextResponse.json({ error: "Achievements markdown is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("certificates")
      .update({
        achievements_markdown,
        updated_at: new Date().toISOString(),
      })
      .eq("cert_code", cert_code)
      .select()
      .single()

    if (error) {
      console.error("Update certificate error:", error)
      return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Update certificate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
