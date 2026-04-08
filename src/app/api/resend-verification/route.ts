import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateToken } from '@/lib/utils/generateToken'
import { sendEmail } from '@/lib/email/send'
import { EmailVerification } from '@/lib/email/templates/EmailVerification'

const RATE_LIMIT_MS = 5 * 60 * 1000 // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Return same message regardless to prevent enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If that email exists and is unverified, a new link has been sent.',
      })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Your email is already verified.' })
    }

    // Check rate limit — look for a token created within the last 5 minutes
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - RATE_LIMIT_MS) },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentToken) {
      return NextResponse.json(
        { error: 'A verification email was sent recently. Please wait a few minutes before requesting another.' },
        { status: 429 }
      )
    }

    const token = generateToken()
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
    const firstName = user.name?.split(' ')[0] ?? 'there'

    await sendEmail({
      to: email,
      subject: 'Verify your Weedej account',
      react: EmailVerification({ name: firstName, verifyUrl }),
    })

    return NextResponse.json({
      message: 'If that email exists and is unverified, a new link has been sent.',
    })
  } catch (e) {
    console.error('Resend verification error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
