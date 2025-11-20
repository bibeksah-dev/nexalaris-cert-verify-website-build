import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "nexalaris_admin_session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip checks for non-admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next()

  // Check if accessing admin route (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get(SESSION_COOKIE)

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify session by calling internal verify endpoint. Use the request URL as the base
    // to avoid constructing an origin from potentially tainted Host headers.
    try {
      const verifyUrl = new URL("/api/admin/verify", request.url).toString()
      const r = await fetch(verifyUrl, { headers: { cookie: request.headers.get("cookie") || "" }, method: "GET" })
      if (!r || r.status !== 200) {
        const loginUrl = new URL("/admin/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (err) {
      // On error, redirect to login for safety
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (pathname === "/admin/login") {
    const session = request.cookies.get(SESSION_COOKIE)

    if (session) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
