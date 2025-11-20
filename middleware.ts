import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "nexalaris_admin_session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing admin routes (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get(SESSION_COOKIE)

    if (!session) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify session by calling internal verify endpoint. This avoids direct DB access from middleware.
    try {
      const base = `${request.nextUrl.protocol}//${request.nextUrl.host}`
      const verifyUrl = new URL("/api/admin/verify", base).toString()
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
