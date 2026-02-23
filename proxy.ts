// Next.js 16 auth guard (renamed from middleware.ts).
// Requires JWT session strategy in auth.ts — database strategy is not Edge-compatible.
// Protects /reviews and /github routes — the code review tool works without auth.
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: ["/reviews/:path*", "/github/:path*"],
}
