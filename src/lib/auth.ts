import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { comparePassword } from '@/lib/utils/hashPassword'
import { loginSchema } from '@/lib/validations/auth'
import { authConfig } from '@/lib/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:          { label: 'Email',           type: 'email' },
        password:       { label: 'Password',        type: 'password' },
        autoLoginToken: { label: 'Auto Login Token', type: 'text' },
      },
      async authorize(credentials) {
        // ── Auto-login after email verification ──────────────────────────────
        if (credentials?.autoLoginToken && typeof credentials.autoLoginToken === 'string') {
          const token = credentials.autoLoginToken as string
          const record = await db.emailVerificationToken.findUnique({ where: { token } })
          if (
            record &&
            !record.usedAt &&
            record.expiresAt > new Date()
          ) {
            const user = await db.user.findUnique({ where: { id: record.userId } })
            if (user?.emailVerified) {
              // Mark token as used
              await db.emailVerificationToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
              }).catch(() => {})
              return { id: user.id, email: user.email, name: user.name, role: user.role }
            }
          }
          return null
        }

        // ── Normal credentials login ──────────────────────────────────────────
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await comparePassword(password, user.passwordHash)
        if (!isValid) return null

        // Block login if email not verified (skip for ADMIN — admin accounts are trusted)
        if (!user.emailVerified && user.role !== 'ADMIN') {
          throw new Error('EMAIL_NOT_VERIFIED')
        }

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          role:  user.role,
        }
      },
    }),
  ],
})
