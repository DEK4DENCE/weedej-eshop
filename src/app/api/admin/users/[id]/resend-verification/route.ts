import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateToken } from "@/lib/utils/generateToken"
import { sendEmail } from "@/lib/email/send"
import { EmailVerification } from "@/lib/email/templates/EmailVerification"

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") return null
  return session
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params

  const user = await db.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (user.emailVerified) return NextResponse.json({ error: "User already verified" }, { status: 400 })

  // Invalidate old tokens
  await db.emailVerificationToken.deleteMany({ where: { userId: user!.id } })

  const token = generateToken()
  await db.emailVerificationToken.create({
    data: { token, userId: user!.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  })

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  const firstName = user!.name?.split(" ")[0] ?? "there"
  await sendEmail({
    to: user!.email,
    subject: "Verify your Weedej account",
    react: EmailVerification({ name: firstName, verifyUrl }),
  })

  return NextResponse.json({ ok: true })
}
