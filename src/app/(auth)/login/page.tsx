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
        title: 'Účet vytvořen!',
        description: 'Zkontrolujte prosím svůj e-mail a ověřte účet před přihlášením.',
      })
    }
    if (searchParams.get('verified') === 'true') {
      toast({
        title: 'E-mail ověřen!',
        description: 'Váš účet je aktivní. Nyní se můžete přihlásit.',
      })
    }
    if (searchParams.get('reset') === 'true') {
      toast({
        title: 'Heslo aktualizováno',
        description: 'Vaše heslo bylo aktualizováno. Nyní se můžete přihlásit.',
      })
    }
  }, [searchParams, toast])

  return <LoginForm />
}
