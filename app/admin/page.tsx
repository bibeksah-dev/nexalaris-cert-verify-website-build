import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock, Home } from "lucide-react"
import Image from "next/image"
import { AnimatedBackground } from "@/components/animated-background"

export default function AdminPage() {
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
          <div className="w-full max-w-md text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:rounded-3xl sm:p-12">
              <div className="mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#12E8D5] to-[#8E2DE2]">
                  <Lock className="h-8 w-8 text-[#0B0C10]" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-[#F3F7FA] sm:text-3xl">Admin Portal</h1>
                <p className="text-sm text-[#F3F7FA]/70 sm:text-base">Manage certificates, programs, and settings</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-base font-semibold text-[#0B0C10] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#12E8D5]/50"
                >
                  <Link href="/admin/login">
                    <Lock className="mr-2 h-5 w-5" />
                    Login to Admin Panel
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
                    Back to Home
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
