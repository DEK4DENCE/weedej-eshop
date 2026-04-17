// QUALITY-2: Single source-of-truth for admin auth guard
// Usage: const { session, error } = await requireAdmin()
//        if (error) return error

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'

type AdminSession = Session & { user: Session['user'] & { role: string } }

export async function requireAdmin(req?: Request): Promise<
  { error: NextResponse; session?: never } |
  { session: AdminSession; error?: never }
> {
  const session = await auth()

  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (session.user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  // SECURITY-6: Basic CSRF guard — reject cross-origin state-mutating requests
  if (req) {
    const method = req.method?.toUpperCase()
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const origin = req.headers.get('origin')
      const host = req.headers.get('host')
      if (origin && host) {
        try {
          const originHost = new URL(origin).host
          if (originHost !== host) {
            return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
          }
        } catch {
          return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
        }
      }
    }
  }

  return { session: session as AdminSession }
}
