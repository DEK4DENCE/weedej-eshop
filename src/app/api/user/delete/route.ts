import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * DELETE /api/user/delete
 *
 * H4: GDPR Article 17 — Right to Erasure (Right to be Forgotten).
 *
 * Anonymises the user record rather than hard-deleting so that order history
 * integrity is preserved (OrderItems, financial records). Personal identifiers
 * are cleared and the email is replaced with an opaque placeholder.
 *
 * Side-effects:
 * - Increments sessionVersion → invalidates all active sessions.
 * - Sets deletedAt timestamp for audit trail.
 * - Clears cart, addresses, and pending tokens.
 */
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true, sessionVersion: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (user.deletedAt) {
    return NextResponse.json({ error: "Account already deleted" }, { status: 410 })
  }

  // Anonymise in a transaction so all steps are atomic
  await db.$transaction(async (tx) => {
    // 1. Anonymise user PII
    await tx.user.update({
      where: { id: userId },
      data: {
        email:                  `deleted-${userId}@deleted.invalid`,
        name:                   null,
        phone:                  null,
        passwordHash:           null,
        emailVerified:          null,
        newsletter:             false,
        dateOfBirth:            null,
        // H2 cleanup
        emailChangePending:     null,
        emailChangeToken:       null,
        emailChangeTokenExpiry: null,
        // Invalidate all sessions
        sessionVersion:         (user.sessionVersion ?? 1) + 1,
        deletedAt:              new Date(),
      },
    })

    // 2. Remove saved addresses (personal data)
    await tx.address.deleteMany({ where: { userId } })

    // 3. Clear cart items
    await tx.cartItem.deleteMany({ where: { cart: { userId } } })

    // 4. Revoke pending tokens
    await tx.passwordResetToken.deleteMany({ where: { userId } })
    await tx.emailVerificationToken.deleteMany({ where: { userId } })
  })

  return NextResponse.json({ message: "Account successfully deleted." })
}
