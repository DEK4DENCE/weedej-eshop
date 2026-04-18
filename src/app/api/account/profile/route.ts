import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import crypto from "crypto"
import { sendEmail } from "@/lib/email/send"
import { EmailVerification } from "@/lib/email/templates/EmailVerification"
export const dynamic = 'force-dynamic'

const schema = z.object({
  name:      z.string().min(1).max(100).optional(),
  phone:     z.string().max(20).optional().nullable(),
  newsletter: z.boolean().optional(),
  // H2: email change is handled separately via token verification
  email:     z.string().email().max(254).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, newsletter: true },
  })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const { email, ...safeFields } = parsed.data

  // H2: If the user wants to change their email, do NOT update it directly.
  // Instead, issue a verification token and send a confirmation to the NEW address.
  if (email) {
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    })

    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // No-op if same email
    if (email.toLowerCase() === currentUser.email.toLowerCase()) {
      return NextResponse.json({ message: "Email unchanged" })
    }

    // Check that the new email isn't already taken
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 })
    }

    const token   = crypto.randomBytes(32).toString("hex")
    const expiry  = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.user.update({
      where: { id: session.user.id },
      data: {
        emailChangePending:     email.toLowerCase(),
        emailChangeToken:       token,
        emailChangeTokenExpiry: expiry,
      },
    })

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email-change?token=${token}`
    const firstName = currentUser.name?.split(" ")[0] ?? "there"

    await sendEmail({
      to:        email,
      subject:   "Potvrďte změnu e-mailové adresy — Weedej",
      emailType: "registration",
      react:     EmailVerification({
        name:     firstName,
        verifyUrl,
      }),
    })

    return NextResponse.json({
      message: "Verification email sent. Please check your new email address to confirm the change.",
    })
  }

  // Update non-email fields directly
  const user = await db.user.update({
    where: { id: session.user.id },
    data:  safeFields,
    select: { id: true, name: true, email: true, phone: true, newsletter: true },
  })
  return NextResponse.json(user)
}
