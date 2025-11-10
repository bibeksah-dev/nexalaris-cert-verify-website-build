"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Login successful",
          description: "Redirecting to admin dashboard...",
        })
        setTimeout(() => {
          window.location.href = data.redirect
        }, 100)
        return
      }

      const errorMessage =
        response.status === 401
          ? "Incorrect password. Please try again."
          : response.status === 400
            ? "Password is required."
            : data.error || "Login failed. Please try again."

      setError(errorMessage)
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } catch (error) {
      const errorMessage = "Connection error. Please check your internet and try again."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
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
        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:rounded-3xl sm:p-8">
              <div className="mb-6 text-center sm:mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#12E8D5] to-[#8E2DE2] sm:h-16 sm:w-16">
                  <Lock className="h-7 w-7 text-[#0B0C10] sm:h-8 sm:w-8" />
                </div>
                <h1 className="text-2xl font-bold text-[#F3F7FA] sm:text-3xl">Admin Access</h1>
                <p className="mt-2 text-sm text-[#F3F7FA]/70 sm:text-base">Enter your password to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-[#F3F7FA] sm:text-base">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    className="h-11 rounded-xl border-white/20 bg-white/10 text-[#F3F7FA] placeholder:text-[#F3F7FA]/40 focus:border-[#12E8D5] focus:ring-[#12E8D5] sm:h-12"
                    required
                  />
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-base font-semibold text-[#0B0C10] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#12E8D5]/50 sm:h-12 sm:text-lg"
                >
                  {loading ? "Logging in..." : "Login"}
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
