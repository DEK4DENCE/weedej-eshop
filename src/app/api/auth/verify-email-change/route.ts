import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/verify-email-change?token=...
 *
 * H2: Validates the email-change token and applies the new email address.
 * Increments sessionVersion to invalidate existing sessions so the user
 * must log in again with the new email.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token || typeof token !== "string") {
    return NextResponse.redirect(
      new URL("/account/settings?error=invalid_token", req.nextUrl.origin)
    )
  }

  const user = await db.user.findUnique({
    where: { emailChangeToken: token },
    select: {
      id: true,
      emailChangePending:     true,
      emailChangeTokenExpiry: true,
      sessionVersion:         true,
    },
  })

  if (!user || !user.emailChangePending) {
    return NextResponse.redirect(
      new URL("/account/settings?error=invalid_token", req.nextUrl.origin)
    )
  }

  if (!user.emailChangeTokenExpiry || user.emailChangeTokenExpiry < new Date()) {
    // Clear expired token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailChangeToken:       null,
        emailChangePending:     null,
        emailChangeTokenExpiry: null,
      },
    })
    return NextResponse.redirect(
      new URL("/account/settings?error=token_expired", req.nextUrl.origin)
    )
  }

  // Check the new email isn't already taken by someone else
  const conflict = await db.user.findFirst({
    where: { email: user.emailChangePending, NOT: { id: user.id } },
  })
  if (conflict) {
    await db.user.update({
      where: { id: user.id },
      data: {
        emailChangeToken:       null,
        emailChangePending:     null,
        emailChangeTokenExpiry: null,
      },
    })
    return NextResponse.redirect(
      new URL("/account/settings?error=email_taken", req.nextUrl.origin)
    )
  }

  // Apply the email change and invalidate all sessions
  await db.user.update({
    where: { id: user.id },
    data: {
      email:                  user.emailChangePending,
      emailChangeToken:       null,
      emailChangePending:     null,
      emailChangeTokenExpiry: null,
      // Force re-login with new email
      sessionVersion:         (user.sessionVersion ?? 1) + 1,
    },
  })

  return NextResponse.redirect(
    new URL("/login?message=email_changed", req.nextUrl.origin)
  )
}
