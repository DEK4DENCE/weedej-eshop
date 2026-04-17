import type { NextAuthConfig } from 'next-auth'

// Edge-safe auth config — no Node.js modules (no Prisma, no bcrypt)
// Used by middleware only. Full auth.ts extends this.
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  // SECURITY-6: SameSite=Lax allows cookies on top-level cross-origin redirects (e.g. Stripe
  // payment redirect back to /checkout/success) while still blocking them on cross-origin
  // subresource requests (images, iframes, fetch). SameSite=Strict would drop the cookie on
  // any third-party redirect, silently invalidating the session after Stripe payment.
  // CSRF is already hardened by the explicit origin-check in proxy.ts — SameSite=Lax is safe.
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
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
        session.user.role = token.role as 'CUSTOMER' | 'ADMIN'
      }
      return session
    },
  },
  providers: [], // Providers added in auth.ts (Node.js runtime only)
}
