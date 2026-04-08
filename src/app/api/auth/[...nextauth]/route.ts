import { handlers } from '@/lib/auth'
import type { NextRequest } from 'next/server'

// next-auth v5 beta handlers only accept NextRequest (no context param)
// We wrap them to satisfy Next.js 16 route handler type expectations
export async function GET(req: NextRequest) {
  return handlers.GET(req)
}

export async function POST(req: NextRequest) {
  return handlers.POST(req)
}
