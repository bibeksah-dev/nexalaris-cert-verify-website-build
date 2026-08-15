// Shared helpers for deriving a trustworthy client IP and applying a simple
// in-memory rate limit. The in-memory limiter is per-instance only; for
// distributed enforcement put a WAF or Redis-backed limiter in front.

/**
 * Derive the client IP from proxy headers.
 *
 * `x-forwarded-for` is a client-appendable list: the *first* entry is whatever
 * the caller sent, so keying a rate limiter on it lets an attacker rotate the
 * value and bypass the limit entirely. Prefer the headers the platform sets
 * itself, and otherwise take the last (closest-to-us) hop of XFF.
 */
export function getClientIp(request: Request): string {
  const trusted = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-real-ip")
  if (trusted) return trusted.split(",")[0].trim()

  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const hops = forwarded.split(",")
    return hops[hops.length - 1].trim()
  }

  return "unknown"
}

const buckets = new Map<string, number[]>()
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return

  for (const [key, hits] of buckets.entries()) {
    const recent = hits.filter((t) => now - t < windowMs)
    if (recent.length === 0) buckets.delete(key)
    else buckets.set(key, recent)
  }
  lastCleanup = now
}

/**
 * Record a hit for `key` and report whether it exceeded `limit` within `windowMs`.
 * Returns true when the caller should be rejected.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  cleanup(windowMs)

  const now = Date.now()
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs)
  recent.push(now)
  buckets.set(key, recent)

  return recent.length > limit
}
