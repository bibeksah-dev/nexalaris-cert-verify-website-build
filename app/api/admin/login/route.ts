import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword, setAdminSession } from "@/lib/auth"

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

  const attempts = inMemoryAttempts.get(ip) || []
  const recent = attempts.filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  inMemoryAttempts.set(ip, recent)
  return recent.length > MAX_ATTEMPTS
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    const ip = (request.headers.get("x-forwarded-for") || request.ip || "unknown").toString().split(",")[0]

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 })
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const isValid = await verifyAdminPassword(password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Set session cookie (also sets csrf cookie)
    await setAdminSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
