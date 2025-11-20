import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, AlertCircle } from "lucide-react"
import Image from "next/image"
import { AnimatedBackground } from "@/components/animated-background"

export default function CertificateNotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0C10]">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
            <Link href="/">
              <Image
                src="/images/design-mode/NexalarisFullLogo.webp"
                alt="Nexalaris Logo"
                width={200}
                height={50}
                className="h-10 w-auto sm:h-12"
              />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:rounded-3xl sm:p-12">
              <div className="mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-[#F3F7FA] sm:text-3xl">Certificate Not Found</h2>
                <p className="text-base text-[#F3F7FA]/90 sm:text-lg">No such Certificate found in our database.</p>
                <p className="mt-2 text-sm text-[#F3F7FA]/70">
                  Please check the certificate ID and try again. Make sure it follows the format: VC-YYYY-XXXX
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-base font-semibold text-[#0B0C10] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#12E8D5]/50"
                >
                  <Link href="/">
                    <Search className="mr-2 h-5 w-5" />
                    Try Another Certificate
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-white/20 bg-white/10 text-base font-semibold text-[#F3F7FA] hover:bg-white/20"
                >
                  <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-4 text-center backdrop-blur-sm sm:py-6">
          <p className="px-4 text-xs text-[#F3F7FA]/50 sm:text-sm">© Nexalaris Tech Private Limited</p>
        </footer>
      </div>
    </div>
  )
}
