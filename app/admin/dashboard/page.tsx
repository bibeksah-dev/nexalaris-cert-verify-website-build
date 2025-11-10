import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { FileText, List, FolderOpen, Award, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServerClient()

  // Fetch stats
  const { count: totalCerts } = await supabase.from("certificates").select("*", { count: "exact", head: true })

  const { count: validCerts } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("status", "VALID")

  const { count: revokedCerts } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("status", "REVOKED")

  const stats = [
    {
      label: "Total Issued",
      value: totalCerts || 0,
      icon: Award,
      color: "from-[#12E8D5] to-[#8E2DE2]",
    },
    {
      label: "Active Certificates",
      value: validCerts || 0,
      icon: CheckCircle,
      color: "from-[#14F195] to-[#12E8D5]",
    },
    {
      label: "Revoked",
      value: revokedCerts || 0,
      icon: XCircle,
      color: "from-[#FF4B4B] to-[#FFC857]",
    },
  ]

  const quickActions = [
    {
      label: "Issue Certificate",
      href: "/admin/issue",
      icon: FileText,
      description: "Create a new certificate",
    },
    {
      label: "Manage Certificates",
      href: "/admin/manage",
      icon: List,
      description: "View and manage all certificates",
    },
    {
      label: "Manage Programs",
      href: "/admin/programs",
      icon: FolderOpen,
      description: "Add or edit programs",
    },
  ]

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F3F7FA]">Admin Dashboard</h1>
          <p className="mt-2 text-[#F3F7FA]/70">Manage certificates and programs</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#F3F7FA]/70">{stat.label}</p>
                    <p className="mt-2 text-4xl font-bold text-[#F3F7FA]">{stat.value}</p>
                  </div>
                  <div className={`rounded-full bg-gradient-to-br ${stat.color} p-4`}>
                    <Icon className="h-8 w-8 text-[#0B0C10]" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-[#F3F7FA]">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-[#12E8D5]/50">
                    <Icon className="mb-4 h-8 w-8 text-[#12E8D5]" />
                    <h3 className="mb-2 text-xl font-semibold text-[#F3F7FA]">{action.label}</h3>
                    <p className="text-sm text-[#F3F7FA]/70">{action.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
