import { NextRequest, NextResponse } from 'next/server'

const AGE_COOKIE    = 'age_verified'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year in seconds

/**
 * POST /api/age-gate/verify
 *
 * Sets the age_verified cookie server-side so that middleware can read it
 * and enforce age gating without JS. Cookie is NOT HttpOnly (middleware
 * reads cookies that are accessible to the Edge runtime via the request
 * headers — these are all cookies regardless of HttpOnly), SameSite=Strict,
 * Secure in production.
 *
 * C5: Age gate must be enforced server-side to prevent JS-bypass, back-button
 * bypass, and cookie-manipulation attacks.
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? ''

  let from = '/'
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const data = await req.formData()
    const raw  = data.get('from')?.toString() ?? '/'
    from = raw.startsWith('/') ? raw : '/'
  } else {
    try {
      const body = await req.json()
      const raw  = body.from ?? '/'
      from = typeof raw === 'string' && raw.startsWith('/') ? raw : '/'
    } catch {
      from = '/'
    }
  }

  // Avoid redirecting back to /age-gate to prevent loop
  if (from.startsWith('/age-gate')) from = '/'

  const isProduction = process.env.NODE_ENV === 'production'

  const response = NextResponse.json({ ok: true })
  response.cookies.set(AGE_COOKIE, 'true', {
    httpOnly: false,       // must be false — middleware reads it via req.cookies (Edge)
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })

  return response
}
