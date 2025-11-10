import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { name, slug, description, image_url } = await request.json()

    if (!name || !slug || !description) {
      return NextResponse.json({ error: "Name, slug, and description are required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from("programs")
      .update({
        name,
        slug,
        description,
        image_url: image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A program with this slug already exists" }, { status: 400 })
      }
      return NextResponse.json({ error: "Failed to update program" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Update program error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.from("programs").delete().eq("id", id)

    if (error) {
      if (error.code === "23503") {
        return NextResponse.json({ error: "Cannot delete program with existing certificates" }, { status: 400 })
      }
      return NextResponse.json({ error: "Failed to delete program" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete program error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
