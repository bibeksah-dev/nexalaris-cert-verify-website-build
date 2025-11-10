import { ImageResponse } from "@vercel/og"
import { createServerClient } from "@/lib/supabase/server"

export const runtime = "edge"

export async function GET(request: Request, { params }: { params: Promise<{ cert_code: string }> }) {
  try {
    const { cert_code } = await params
    const supabase = await createServerClient()

    // Fetch certificate details
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(
        `
        *,
        programs (
          name,
          duration,
          image_url
        )
      `,
      )
      .eq("cert_code", cert_code)
      .single()

    if (error || !certificate) {
      return new Response("Certificate not found", { status: 404 })
    }

    if (certificate.status === "REVOKED") {
      return new Response("Certificate has been revoked", { status: 403 })
    }

    // Safe RGB colors only - no lab() or lch() functions
    const colors = {
      teal: "rgb(18, 232, 213)", // #12E8D5
      purple: "rgb(142, 45, 226)", // #8E2DE2
      dark: "rgb(10, 10, 10)", // #0a0a0a
      darkTransparent: "rgba(10, 10, 10, 0.8)",
      white: "rgb(255, 255, 255)",
      gray: "rgb(136, 136, 136)",
      tealTransparent: "rgba(18, 232, 213, 0.3)",
    }

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.dark,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(18, 232, 213, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(142, 45, 226, 0.1) 0%, transparent 50%)`,
          padding: "80px",
        }}
      >
        {/* Certificate Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            border: `2px solid ${colors.tealTransparent}`,
            borderRadius: "24px",
            backgroundColor: colors.darkTransparent,
            padding: "60px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: colors.teal, marginBottom: "8px" }}>
              NEXALARIS TECH
            </div>
            <div style={{ fontSize: "32px", color: colors.purple, fontWeight: "600" }}>Certificate of Completion</div>
          </div>

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
              gap: "24px",
            }}
          >
            <div style={{ fontSize: "24px", color: colors.gray }}>This certifies that</div>
            <div style={{ fontSize: "56px", fontWeight: "bold", color: colors.white, textAlign: "center" }}>
              {certificate.holder_name}
            </div>
            <div style={{ fontSize: "24px", color: colors.gray }}>has successfully completed</div>
            <div style={{ fontSize: "40px", fontWeight: "600", color: colors.teal, textAlign: "center" }}>
              {certificate.programs?.name}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "18px", color: colors.gray, marginBottom: "8px" }}>Issue Date</div>
              <div style={{ fontSize: "20px", color: colors.white }}>
                {new Date(certificate.issued_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ fontSize: "18px", color: colors.gray, marginBottom: "8px" }}>Certificate ID</div>
              <div style={{ fontSize: "20px", color: colors.teal, fontWeight: "600" }}>{certificate.cert_code}</div>
            </div>
          </div>

          {/* Border Effects */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              width: "100px",
              height: "100px",
              border: `2px solid ${colors.purple}`,
              borderRight: "none",
              borderBottom: "none",
              borderRadius: "24px 0 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              width: "100px",
              height: "100px",
              border: `2px solid ${colors.teal}`,
              borderLeft: "none",
              borderTop: "none",
              borderRadius: "0 0 24px 0",
            }}
          />
        </div>
      </div>,
      {
        width: 1200,
        height: 800,
      },
    )
  } catch (error) {
    console.error("[v0] Error generating OG image:", error)
    return new Response("Failed to generate image", { status: 500 })
  }
}
