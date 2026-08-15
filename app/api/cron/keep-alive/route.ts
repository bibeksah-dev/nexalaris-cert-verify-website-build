import { NextResponse } from "next/server"
import crypto from "crypto"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

function timingSafeMatch(a: string, b: string): boolean {
  const bufA = new TextEncoder().encode(a)
  const bufB = new TextEncoder().encode(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Cron job handler to keep the Supabase database alive.
 * Prevents the project from pausing due to inactivity.
 * Expected to be called every 2 days.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || ""

  // Prefer a dedicated CRON_SECRET so the service role key is never sent as a
  // request header; fall back to the service key for existing deployments.
  const secret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY

  // Fail closed: an unset secret must not mean "no authentication required".
  if (!secret || !timingSafeMatch(authHeader, `Bearer ${secret}`)) {
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
