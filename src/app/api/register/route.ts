import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/utils/hashPassword'
import { registerSchema } from '@/lib/validations/auth'
import { generateToken } from '@/lib/utils/generateToken'
import { sendEmail } from '@/lib/email/send'
import { WelcomeEmail } from '@/lib/email/templates/WelcomeEmail'
import { EmailVerification } from '@/lib/email/templates/EmailVerification'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }
    const { name, email, password, dateOfBirth } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, dateOfBirth: new Date(dateOfBirth) },
    })

    // Create email verification token valid for 24 hours
    const token = generateToken()
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
    const firstName = name?.split(' ')[0] ?? 'there'

    await sendEmail({
      to: email,
      subject: 'Verify your Weedej account',
      react: EmailVerification({ name: firstName, verifyUrl }),
    })

    await sendEmail({
      to: email,
      subject: 'Welcome to Weedej — Your First Order Awaits',
      react: WelcomeEmail({ name: firstName }),
    })

    return NextResponse.json(
      { message: 'Account created. Please check your email to verify.' },
      { status: 201 }
    )
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
