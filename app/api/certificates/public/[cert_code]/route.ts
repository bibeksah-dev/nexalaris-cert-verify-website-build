import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"

// This endpoint is unauthenticated and answers "does this certificate exist?",
// so it is the natural oracle for brute-forcing certificate codes. Cap it.
const WINDOW_MS = 60 * 1000
const MAX_LOOKUPS = 30

const CERT_CODE_PATTERN = /^VC-\d{4}-[A-Za-z0-9]{4,32}$/

export async function GET(request: NextRequest, { params }: { params: Promise<{ cert_code: string }> }) {
  try {
    const { cert_code } = await params

    if (!CERT_CODE_PATTERN.test(cert_code)) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    if (isRateLimited(`cert-lookup:${getClientIp(request)}`, MAX_LOOKUPS, WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = await getSupabaseServerClient()

    // Only fields intended for public display. Never select holder_email here:
    // this response is served to anonymous callers.
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(`
        cert_code,
        holder_name,
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

    return NextResponse.json(
      {
        ...certificate,
        status: isExpired ? "EXPIRED" : certificate.status,
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Public certificate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
