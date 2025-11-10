"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
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
          <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
            <Image
              src="/images/design-mode/NexalarisFullLogo.webp"
              alt="Nexalaris Logo"
              width={200}
              height={50}
              className="h-10 w-auto sm:h-12"
            />
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12 md:py-16">
          <div className="w-full max-w-2xl text-center">
            {/* Glass Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:rounded-3xl sm:p-8 md:p-12">
              <h1 className="mb-3 text-3xl font-bold leading-tight text-[#F3F7FA] sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
                Verify your Nexalaris certificate
              </h1>

              <p className="mb-6 text-base text-[#F3F7FA]/70 sm:mb-8 sm:text-lg md:text-xl">
                Fast. Transparent. No login.
              </p>

              {/* Verify Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter Certificate ID"
                    value={certCode}
                    onChange={(e) => setCertCode(e.target.value)}
                    className="h-12 rounded-xl border-white/20 bg-white/10 px-4 text-base text-[#F3F7FA] placeholder:text-[#F3F7FA]/40 focus:border-[#12E8D5] focus:ring-[#12E8D5] sm:h-14 sm:px-6 sm:text-lg"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-base font-semibold text-[#0B0C10] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#12E8D5]/50 sm:h-14 sm:text-lg"
                >
                  <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Verify Certificate
                </Button>
              </form>
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
