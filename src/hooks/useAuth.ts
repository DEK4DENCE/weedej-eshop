'use client'

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isLoggedIn: status === 'authenticated',
    isAdmin: (session?.user as any)?.role === 'ADMIN',
    isLoading: status === 'loading',
  }
}
