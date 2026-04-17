import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

// Rate limiting for admin API routes — 60 requests per minute per IP
const adminRateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkAdminRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = adminRateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    adminRateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 60) return false
  entry.count++
  return true
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin routes — require ADMIN role
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Rate limit admin API endpoints
    if (pathname.startsWith('/api/admin')) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
      if (!checkAdminRateLimit(ip)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
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
    if ((session.user as any)?.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protected user routes — require any session
  const protectedPaths = ['/account', '/checkout', '/api/cart', '/api/orders', '/api/checkout']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Security headers on all matched routes
  const res = NextResponse.next()
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return res
})

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/api/cart/:path*',
    '/api/orders/:path*',
    '/api/checkout/:path*',
    '/api/admin/:path*',
  ],
}
