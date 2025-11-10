import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: programs, error } = await supabase.from("programs").select("*").order("name")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
    }

    return NextResponse.json(programs)
  } catch (error) {
    console.error("Programs API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
