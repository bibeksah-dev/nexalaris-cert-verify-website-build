import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { ProgramsManager } from "@/components/programs-manager"

export default async function ManageProgramsPage() {
  const supabase = await getSupabaseServerClient()

  const { data: programs } = await supabase.from("programs").select("*").order("created_at", { ascending: false })

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F3F7FA]">Manage Programs</h1>
          <p className="mt-2 text-[#F3F7FA]/70">Create and edit training programs</p>
        </div>

        <ProgramsManager programs={programs || []} />
      </div>
    </AdminLayout>
  )
}
