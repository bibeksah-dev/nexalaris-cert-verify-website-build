"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, QrCode } from "lucide-react"
import Image from "next/image"
import { AnimatedBackground } from "@/components/animated-background"

export default function HomePage() {
  const [certCode, setCertCode] = useState("")
  const router = useRouter()

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (certCode.trim()) {
      router.push(`/c/${certCode.trim()}`)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0C10]">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-6">
            <Image
              src="/images/design-mode/NexalarisFullLogo.webp"
              alt="Nexalaris Logo"
              width={200}
              height={50}
              className="h-12 w-auto"
            />
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-2xl text-center">
            {/* Glass Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-12">
              <h1 className="mb-4 text-4xl font-bold leading-tight text-[#F3F7FA] md:text-5xl lg:text-6xl">
                Verify your Nexalaris certificate
              </h1>

              <p className="mb-8 text-lg text-[#F3F7FA]/70 md:text-xl">Fast. Transparent. No login.</p>

              {/* Verify Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter Certificate ID"
                    value={certCode}
                    onChange={(e) => setCertCode(e.target.value)}
                    className="h-14 rounded-xl border-white/20 bg-white/10 px-6 text-lg text-[#F3F7FA] placeholder:text-[#F3F7FA]/40 focus:border-[#12E8D5] focus:ring-[#12E8D5]"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 flex-1 rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-lg font-semibold text-[#0B0C10] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#12E8D5]/50"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Verify
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="h-14 rounded-xl border-white/20 bg-white/5 text-lg text-[#F3F7FA] hover:bg-white/10"
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    Scan QR
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 text-center backdrop-blur-sm">
          <p className="text-sm text-[#F3F7FA]/50">© Nexalaris Tech Private Limited</p>
        </footer>
      </div>
    </div>
  )
}
