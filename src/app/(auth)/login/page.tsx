'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { useToast } from '@/hooks/useToast'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account before signing in.',
      })
    }
    if (searchParams.get('reset') === 'true') {
      toast({
        title: 'Password updated',
        description: 'Your password has been updated. You can now sign in.',
      })
    }
  }, [searchParams, toast])

  return <LoginForm />
}
