import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateToken } from '@/lib/utils/generateToken'
import { sendEmail } from '@/lib/email/send'
import { PasswordReset } from '@/lib/email/templates/PasswordReset'
import { forgotPasswordSchema } from '@/lib/validations/auth'

// Always return the same message to prevent email enumeration
const SAFE_RESPONSE = { message: 'If that email exists, you will receive a reset link.' }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(SAFE_RESPONSE)
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (user) {
      const token = generateToken()
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      })

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      const firstName = user.name?.split(' ')[0] ?? 'there'

      await sendEmail({
        to: user.email,
        subject: 'Reset your Weedejna password',
        react: PasswordReset({ name: firstName, resetUrl }),
      })
    }

    return NextResponse.json(SAFE_RESPONSE)
  } catch (e) {
    console.error('Forgot password error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
