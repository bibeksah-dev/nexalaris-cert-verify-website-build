import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description, image_url } = await request.json()

    if (!name || !slug || !description) {
      return NextResponse.json({ error: "Name, slug, and description are required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from("programs")
      .insert({
        name,
        slug,
        description,
        image_url: image_url || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A program with this slug already exists" }, { status: 400 })
      }
      return NextResponse.json({ error: "Failed to create program" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Create program error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
