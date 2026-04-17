import { NextRequest, NextResponse } from "next/server"

const AGE_COOKIE = "age_verified"

// Paths that are always accessible without age verification
const PUBLIC_PREFIXES = [
  "/age-gate",
  "/api/",
  "/_next/",
  "/favicon",
  "/__nextjs",
]

// HTTP methods that change server state
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

// Paths exempt from CSRF check — webhooks use their own auth (HMAC / Stripe sig)
// and NextAuth internals must never be blocked.
function isCsrfExempt(pathname: string): boolean {
  return (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/webhooks/")
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── H-1: CSRF hardening ───────────────────────────────────────────────────
  // For state-changing requests to /api/* (excluding webhooks and auth),
  // require Origin to match the app host OR X-Requested-With: XMLHttpRequest.
  // This prevents cross-origin form POST attacks (e.g. a third-party page
  // silently submitting a form to our API using the victim's cookies).
  if (
    MUTATING_METHODS.has(request.method) &&
    pathname.startsWith("/api/") &&
    !isCsrfExempt(pathname)
  ) {
    const origin = request.headers.get("origin")
    const xrw    = request.headers.get("x-requested-with")
    const host   = request.headers.get("host")

    if (origin && host && !origin.includes(host) && xrw !== "XMLHttpRequest") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // Allow Next.js internals, API routes, and the age-gate page itself
  const isPublic = PUBLIC_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  if (isPublic) {
    return NextResponse.next()
  }

  // Check for the age verification cookie
  const ageVerified = request.cookies.get(AGE_COOKIE)?.value === "true"
  if (!ageVerified) {
    // Store the original destination so we can redirect back after verification
    const url = request.nextUrl.clone()
    url.pathname = "/age-gate"
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on all routes except static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
}
