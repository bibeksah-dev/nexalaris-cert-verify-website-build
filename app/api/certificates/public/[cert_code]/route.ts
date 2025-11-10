import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ cert_code: string }> }) {
  try {
    const { cert_code } = await params
    const supabase = await getSupabaseServerClient()

    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(`
        cert_code,
        holder_name,
        holder_email,
        issued_at,
        expires_at,
        status,
        achievements_markdown,
        signature_hash,
        programs (
          name,
          slug
        )
      `)
      .eq("cert_code", cert_code)
      .single()

    if (error || !certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Check if expired
    const now = new Date()
    const expiresAt = certificate.expires_at ? new Date(certificate.expires_at) : null
    const isExpired = expiresAt && expiresAt < now

    return NextResponse.json({
      ...certificate,
      status: isExpired ? "EXPIRED" : certificate.status,
    })
  } catch (error) {
    console.error("Public certificate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
