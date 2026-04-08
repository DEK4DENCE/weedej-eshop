import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: 'CUSTOMER' | 'ADMIN'
    } & DefaultSession['user']
  }

  interface User {
    role: 'CUSTOMER' | 'ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'CUSTOMER' | 'ADMIN'
  }
}
