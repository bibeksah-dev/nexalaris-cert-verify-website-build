import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { ImageResponse } from "next/og"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"
import { loadCertificateFonts } from "@/lib/og-font"

export const runtime = "edge"

// Same brute-force cap and code shape as /api/certificates/public: this route
// also answers "does this certificate exist?" to anonymous callers.
const WINDOW_MS = 60 * 1000
const MAX_LOOKUPS = 30
const CERT_CODE_PATTERN = /^VC-\d{4}-[A-Za-z0-9]{4,32}$/

export async function GET(request: NextRequest, { params }: { params: Promise<{ cert_code: string }> }) {
  try {
    const { cert_code } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "png"

    if (format !== "png" && format !== "pdf") {
      return NextResponse.json({ error: "Only PNG and PDF formats are supported" }, { status: 400 })
    }

    if (!CERT_CODE_PATTERN.test(cert_code)) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    if (isRateLimited(`cert-export:${getClientIp(request)}`, MAX_LOOKUPS, WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = await createServerClient()

    // Only the fields the image needs; never fetch holder_email on an
    // unauthenticated route.
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select("cert_code, holder_name, issued_at, status, programs(name)")
      .eq("cert_code", cert_code)
      .single<{
        cert_code: string
        holder_name: string
        issued_at: string
        status: string
        programs: { name: string } | null
      }>()

    if (error || !certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    if (certificate.status === "REVOKED") {
      return NextResponse.json({ error: "Revoked certificates cannot be downloaded" }, { status: 410 })
    }

    if (format === "png") {
      const fonts = await loadCertificateFonts()

      return new ImageResponse(
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0a0a",
            padding: "80px",
            fontFamily: "Space Grotesk",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              border: "2px solid #12e8d533",
              padding: "60px",
              backgroundColor: "#0a0a0acc",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
              <div style={{ fontSize: "48px", fontWeight: 700, color: "#12e8d5" }}>NEXALARIS TECH</div>
              <div style={{ fontSize: "32px", fontWeight: 600, color: "#8e2de2" }}>Certificate of Completion</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "80px" }}>
              <div style={{ fontSize: "24px", color: "#888888" }}>This certifies that</div>
              <div style={{ fontSize: "56px", fontWeight: 700, color: "#ffffff", marginTop: "20px" }}>
                {certificate.holder_name}
              </div>
              <div style={{ fontSize: "24px", color: "#888888", marginTop: "20px" }}>has successfully completed</div>
              <div style={{ fontSize: "40px", fontWeight: 600, color: "#12e8d5", marginTop: "20px" }}>
                {certificate.programs?.name}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "18px", color: "#888888" }}>Issue Date</div>
                <div style={{ fontSize: "20px", color: "#ffffff" }}>
                  {new Date(certificate.issued_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "18px", color: "#888888" }}>Certificate ID</div>
                <div style={{ fontSize: "20px", color: "#12e8d5" }}>{certificate.cert_code}</div>
              </div>
            </div>
          </div>
        </div>,
        {
          width: 1200,
          height: 800,
          fonts,
        },
      )
    }

    return NextResponse.json(
      { error: "PDF generation is handled client-side. Please use the client component." },
      { status: 400 },
    )
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Failed to generate certificate export" }, { status: 500 })
  }
}
