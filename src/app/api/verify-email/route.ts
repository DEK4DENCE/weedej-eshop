import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 })
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link. Please request a new one.' },
        { status: 400 }
      )
    }

    if (verificationToken.usedAt) {
      return NextResponse.json(
        { error: 'This verification link has already been used.' },
        { status: 400 }
      )
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This verification link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({ message: 'Email verified successfully.' })
  } catch (e) {
    console.error('Verify email error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
