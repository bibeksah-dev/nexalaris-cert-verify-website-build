import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword, setAdminSession } from "@/lib/auth"

const SESSION_COOKIE = "nexalaris_admin_session"

// Rate limiter: prefer Redis when REDIS_URL is set, otherwise fall back to in-memory limiter.
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

let redisClient: any | null = null

async function getRedisClient() {
  if (redisClient) return redisClient
  try {
    if (!process.env.REDIS_URL) return null
    const IORedis = await import("ioredis")
    redisClient = new IORedis.default(process.env.REDIS_URL)
    return redisClient
  } catch (err) {
    console.warn("Redis not available or ioredis not installed, falling back to in-memory limiter")
    return null
  }
}

const inMemoryAttempts = new Map<string, number[]>()

// Cleanup interval for in-memory map to prevent DoS via memory exhaustion
const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour
let lastCleanup = Date.now()

function cleanupInMemoryAttempts() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  for (const [ip, attempts] of inMemoryAttempts.entries()) {
    const recent = attempts.filter((t) => now - t < WINDOW_MS)
    if (recent.length === 0) {
      inMemoryAttempts.delete(ip)
    } else {
      inMemoryAttempts.set(ip, recent)
    }
  }
  lastCleanup = now
}

async function isRateLimited(ip: string) {
  const now = Date.now()
  const client = await getRedisClient()
  if (client) {
    const key = `login:attempts:${ip}`
    try {
      const attempts = await client.incr(key)
      if (attempts === 1) {
        await client.pexpire(key, WINDOW_MS)
      }
      return attempts > MAX_ATTEMPTS
    } catch (err) {
      // Fall back to in-memory logic on Redis error
    }
  }

  // Trigger cleanup occasionally
  cleanupInMemoryAttempts()

  const attempts = inMemoryAttempts.get(ip) || []
  const recent = attempts.filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  inMemoryAttempts.set(ip, recent)
  return recent.length > MAX_ATTEMPTS
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Prefer the server-provided remote IP when available. Only fall back to
    // X-Forwarded-For if the runtime/platform (trusted proxy) sets it.
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = ((request as any).ip || (forwarded ? forwarded.toString().split(",")[0].trim() : "unknown")).toString()

    if (await isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 })
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const isValid = await verifyAdminPassword(password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Create server-side session (sets cookies via cookieStore)
    await setAdminSession()

    // Always send a redirect target the client expects
    return NextResponse.json({ success: true, redirect: "/admin/dashboard" })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
