import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "nexalaris_admin_session"

export function middleware(request: NextRequest) {
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
