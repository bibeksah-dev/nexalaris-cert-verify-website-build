import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { verifyAdminRequest } from "@/lib/auth"
import { sendCertificateIssuedEmail } from "@/lib/email"
import crypto from "crypto"

// 5 random bytes = 40 bits of entropy. The previous 3 bytes (24 bits) left only
// ~16M codes per year prefix, which is enumerable against an unmetered
// verification endpoint. Existing shorter codes remain valid.
function generateCertCode(): string {
  const year = new Date().getFullYear()
  const random = crypto.randomBytes(5).toString("hex").toUpperCase()
  return `VC-${year}-${random}`
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength
}

export async function POST(request: NextRequest) {
  try {
    const verification = await verifyAdminRequest(request)
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error || "Unauthorized" }, { status: 401 })
    }

    const { holder_name, holder_email, program_id, issued_at, expires_at, achievements_markdown } = await request.json()

    if (
      !isNonEmptyString(holder_name, 200) ||
      !isNonEmptyString(program_id, 100) ||
      !isNonEmptyString(issued_at, 100) ||
      !isNonEmptyString(achievements_markdown, 20000)
    ) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    if (Number.isNaN(new Date(issued_at).getTime())) {
      return NextResponse.json({ error: "Invalid issued_at date" }, { status: 400 })
    }

    if (expires_at !== undefined && expires_at !== null && expires_at !== "") {
      if (typeof expires_at !== "string" || Number.isNaN(new Date(expires_at).getTime())) {
        return NextResponse.json({ error: "Invalid expires_at date" }, { status: 400 })
      }
    }

    if (holder_email !== undefined && holder_email !== null && holder_email !== "") {
      if (typeof holder_email !== "string" || holder_email.length > 254 || !EMAIL_PATTERN.test(holder_email)) {
        return NextResponse.json({ error: "Invalid holder_email" }, { status: 400 })
      }
    }

    const supabase = getSupabaseAdminClient()

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

    // Send email notification if holder_email is provided (fire and forget)
    if (holder_email) {
      // Fetch program name for the email
      const { data: program } = await supabase
        .from("programs")
        .select("name")
        .eq("id", program_id)
        .single()

      if (program?.name) {
        sendCertificateIssuedEmail({
          holder_name,
          holder_email,
          cert_code: certCode,
          program_name: program.name,
        }).catch((err) => {
          console.error("Failed to send certificate email:", err)
        })
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Issue certificate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
