"use client"

import type { ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, List, FolderOpen, Settings, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AnimatedBackground } from "@/components/animated-background"
import { useToast } from "@/hooks/use-toast"

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/issue", label: "Issue Certificate", icon: FileText },
  { href: "/admin/manage", label: "Manage Certificates", icon: List },
  { href: "/admin/programs", label: "Programs", icon: FolderOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0C10]">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 backdrop-blur-sm">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="border-b border-white/10 p-6">
              <Link href="/admin/dashboard">
                <Image
                  src="/images/design-mode/NexalarisFullLogo.webp"
                  alt="Nexalaris Logo"
                  width={150}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start rounded-xl ${
                        isActive
                          ? "bg-gradient-to-r from-[#12E8D5]/20 to-[#8E2DE2]/20 text-[#12E8D5]"
                          : "text-[#F3F7FA]/70 hover:bg-white/5 hover:text-[#F3F7FA]"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/10 p-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start rounded-xl text-[#FF4B4B] hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B]"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
