export function getCsrfTokenFromCookie() {
  if (typeof document === "undefined") return null
  const name = "nexalaris_admin_csrf="
  const cookies = document.cookie.split(";")
  for (const c of cookies) {
    const v = c.trim()
    if (v.startsWith(name)) return decodeURIComponent(v.slice(name.length))
  }
  return null
}

export async function adminFetch(input: RequestInfo, init: RequestInit = {}) {
  const method = (init.method || "GET").toUpperCase()
  const headers = new Headers(init.headers || {})

  if (method !== "GET" && typeof window !== "undefined") {
    const token = getCsrfTokenFromCookie()
    if (token) headers.set("x-csrf-token", token)
  }

  // Ensure cookies are sent
  return fetch(input, { credentials: "include", ...init, headers })
}
