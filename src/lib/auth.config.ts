import type { NextAuthConfig } from 'next-auth'

// Edge-safe auth config — no Node.js modules (no Prisma, no bcrypt)
// Used by middleware only. Full auth.ts extends this.
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  providers: [], // Providers added in auth.ts (Node.js runtime only)
}
