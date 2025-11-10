import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { CertificateTable } from "@/components/certificate-table"

export default async function ManageCertificatesPage() {
  const supabase = await getSupabaseServerClient()

  const { data: certificates } = await supabase
    .from("certificates")
    .select(`
      *,
      programs (
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F3F7FA]">Manage Certificates</h1>
          <p className="mt-2 text-[#F3F7FA]/70">View, edit, and revoke certificates</p>
        </div>

        <CertificateTable certificates={certificates || []} />
      </div>
    </AdminLayout>
  )
}
