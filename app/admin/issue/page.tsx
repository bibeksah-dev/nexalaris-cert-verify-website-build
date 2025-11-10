import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { IssueForm } from "@/components/issue-form"

export default async function IssueCertificatePage() {
  const supabase = await getSupabaseServerClient()

  const { data: programs } = await supabase.from("programs").select("id, name").order("name")

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F3F7FA]">Issue Certificate</h1>
          <p className="mt-2 text-[#F3F7FA]/70">Create a new certificate for a holder</p>
        </div>

        <IssueForm programs={programs || []} />
      </div>
    </AdminLayout>
  )
}
