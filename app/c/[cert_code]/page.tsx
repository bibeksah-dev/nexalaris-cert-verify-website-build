import { notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CertificateDetailsClient } from "@/components/certificate-details-client"
import { AnimatedBackground } from "@/components/animated-background"
import Image from "next/image"
import Link from "next/link"

interface Certificate {
  id: string
  cert_code: string
  holder_name: string
  holder_email: string | null
  issued_at: string
  expires_at: string | null
  status: "VALID" | "EXPIRED" | "REVOKED"
  achievements_markdown: string
  signature_hash: string | null
  programs: {
    name: string
    slug: string
  }
}

export default async function CertificateDetailsPage({
  params,
}: {
  params: Promise<{ cert_code: string }>
}) {
  const { cert_code } = await params
  const supabase = await getSupabaseServerClient()

  // Fetch certificate with program details
  const { data: certificate, error } = await supabase
    .from("certificates")
    .select(`
      *,
      programs (
        name,
        slug
      )
    `)
    .eq("cert_code", cert_code)
    .single<Certificate>()

  if (error || !certificate) {
    notFound()
  }

  // Check if expired
  const now = new Date()
  const expiresAt = certificate.expires_at ? new Date(certificate.expires_at) : null
  const isExpired = expiresAt && expiresAt < now

  const actualStatus = isExpired ? "EXPIRED" : certificate.status

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0C10]">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-6">
            <Link href="/">
              <Image
                src="/images/design-mode/NexalarisFullLogo.webp"
                alt="Nexalaris Logo"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto flex-1 px-4 py-12">
          <CertificateDetailsClient
            certificate={{
              ...certificate,
              status: actualStatus,
              programName: certificate.programs.name,
              programSlug: certificate.programs.slug,
            }}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 text-center backdrop-blur-sm">
          <p className="text-sm text-[#F3F7FA]/50">© Nexalaris Tech Private Limited</p>
        </footer>
      </div>
    </div>
  )
}
