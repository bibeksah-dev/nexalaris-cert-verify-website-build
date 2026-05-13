import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

/**
 * Cron job handler to keep the Supabase database alive.
 * Prevents the project from pausing due to inactivity.
 * Expected to be called every 2 days.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Verify the request is authorized via SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey && authHeader !== `Bearer ${serviceKey}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const supabase = getSupabaseAdminClient()
    
    // Perform a lightweight query to register activity in the database.
    // Using head: true avoids fetching actual data, only the count.
    const { count, error } = await supabase
      .from("programs")
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("Keep-alive ping failed:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database pinged successfully",
      timestamp: new Date().toISOString(),
      active_programs: count
    })
  } catch (err) {
    console.error("Cron internal error:", err)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
