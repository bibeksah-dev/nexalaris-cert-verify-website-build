"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTimeout(() => {
          window.location.href = data.redirect
        }, 100)
        return
      }

      toast({
        title: "Login failed",
        description: data.error || "Invalid password",
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#12E8D5] to-[#8E2DE2]">
                  <Lock className="h-8 w-8 text-[#0B0C10]" />
                </div>
                <h1 className="text-3xl font-bold text-[#F3F7FA]">Admin Access</h1>
                <p className="mt-2 text-[#F3F7FA]/70">Enter your password to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#F3F7FA]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA] placeholder:text-[#F3F7FA]/40 focus:border-[#12E8D5] focus:ring-[#12E8D5]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-lg font-semibold text-[#0B0C10] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#12E8D5]/50"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
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
