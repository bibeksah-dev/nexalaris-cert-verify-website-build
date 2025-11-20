import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { verifyAdminRequest } from "@/lib/auth"
import crypto from "crypto"

function generateCertCode(): string {
  const year = new Date().getFullYear()
  const random = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 6)
  return `VC-${year}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const verification = await verifyAdminRequest(request)
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error || "Unauthorized" }, { status: 401 })
    }

    const { holder_name, holder_email, program_id, issued_at, expires_at, achievements_markdown } = await request.json()

    if (!holder_name || !program_id || !issued_at || !achievements_markdown) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Generate unique certificate code
    let certCode = generateCertCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const { count } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .eq("cert_code", certCode)

      if (count === 0) {
        isUnique = true
      } else {
        certCode = generateCertCode()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique certificate code" }, { status: 500 })
    }

    // Generate signature hash
    const signatureData = `${certCode}:${holder_name}:${program_id}:${issued_at}`
    const signatureHash = `sha256:${crypto.createHash("sha256").update(signatureData).digest("hex")}`

    // Insert certificate
    const { data, error } = await supabase
      .from("certificates")
      .insert({
        cert_code: certCode,
        holder_name,
        holder_email: holder_email || null,
        program_id,
        issued_at: new Date(issued_at).toISOString(),
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        status: "VALID",
        achievements_markdown,
        signature_hash: signatureHash,
      })
      .select()
      .single()

    if (error) {
      console.error("Insert error:", error)
      return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Issue certificate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
