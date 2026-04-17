import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

// ── Age-gate ────────────────────────────────────────────────────────────────
const AGE_COOKIE = 'age_verified'

const AGE_GATE_PUBLIC_PREFIXES = [
  '/age-gate',
  '/api/',
  '/_next/',
  '/favicon',
  '/__nextjs',
]

// ── CSRF hardening ──────────────────────────────────────────────────────────
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function isCsrfExempt(pathname: string): boolean {
  return (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/webhooks/')
  )
}

// ── Admin rate limiting ─────────────────────────────────────────────────────
// NOTE: In-memory — does not persist across serverless cold starts.
// For production hardening, replace with Upstash Redis (@upstash/ratelimit).
const adminRateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkAdminRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = adminRateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    adminRateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return { allowed: true }
  }
  if (entry.count >= 60) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }
  entry.count++
  return { allowed: true }
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // ── CSRF: block cross-origin state-changing requests to /api/* ─────────────
  if (
    MUTATING_METHODS.has(req.method) &&
    pathname.startsWith('/api/') &&
    !isCsrfExempt(pathname)
  ) {
    const origin = req.headers.get('origin')
    const xrw    = req.headers.get('x-requested-with')
    const host   = req.headers.get('host')
    if (origin && host && !origin.includes(host) && xrw !== 'XMLHttpRequest') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // ── Age-gate: require cookie on all non-public routes ─────────────────────
  const isPublic = AGE_GATE_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (!isPublic) {
    const ageVerified = req.cookies.get(AGE_COOKIE)?.value === 'true'
    if (!ageVerified) {
      const url = req.nextUrl.clone()
      url.pathname = '/age-gate'
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  // ── Admin routes: require ADMIN role ──────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname.startsWith('/api/admin')) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
      const adminRl = checkAdminRateLimit(ip)
      if (!adminRl.allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: adminRl.retryAfter ? { 'Retry-After': String(adminRl.retryAfter) } : {} }
        )
      }
    }
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (session.user?.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // ── Protected user routes: require any session ────────────────────────────
  // /checkout/success is intentionally excluded: it derives userId from Stripe metadata
  // (not from session) and must be reachable even if the session cookie was dropped by
  // the browser during the cross-origin Stripe redirect. Ownership is verified server-side
  // inside the page via the cryptographically-random Stripe session_id in the URL.
  const protectedPaths = ['/account', '/checkout', '/api/cart', '/api/orders', '/api/checkout']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
    && !pathname.startsWith('/checkout/success')
  if (isProtected && !session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', req.url)
    // Preserve full URL including query string so session_id is not lost on redirect-back
    loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // ── Security headers on all matched routes ────────────────────────────────
  const res = NextResponse.next()
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return res
})

export const config = {
  // Run on all routes except static files and images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
