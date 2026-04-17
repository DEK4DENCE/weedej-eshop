'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

type VerifyState = 'loading' | 'logging-in' | 'success' | 'error'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [state, setState] = useState<VerifyState>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setErrorMessage('V URL nebyl nalezen ověřovací token.')
      return
    }

    async function verify() {
      try {
        // Step 1: verify the token
        const res = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()

        if (!res.ok) {
          setState('error')
          setErrorMessage(data.error ?? 'Neplatný nebo vypršelý ověřovací odkaz.')
          return
        }

        // Step 2: auto-login using the verification token
        setState('logging-in')
        const autoLoginToken = data.autoLoginToken
        if (autoLoginToken) {
          const result = await signIn('credentials', {
            autoLoginToken,
            email: '',
            password: '',
            redirect: false,
          })
          if (result?.ok) {
            setState('success')
            setTimeout(() => router.push('/products'), 1500)
            return
          }
        }

        // Auto-login failed — redirect to login with success message
        setState('success')
        setTimeout(() => router.push('/login?verified=true'), 2000)
      } catch {
        setState('error')
        setErrorMessage('Něco se pokazilo. Zkuste to prosím znovu.')
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="bg-white border border-[#DEE2E6] rounded-2xl p-8 w-full max-w-md text-center">
      {(state === 'loading' || state === 'logging-in') && (
        <>
          <div className="w-12 h-12 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-xl font-semibold text-[#1d1d1f] mb-2">
            {state === 'logging-in' ? 'Přihlašování…' : 'Ověřování e-mailu…'}
          </h1>
          <p className="text-[#6e6e73] text-sm">Mělo by to trvat jen chvíli.</p>
        </>
      )}

      {state === 'success' && (
        <>
          <div className="w-14 h-14 bg-[#f0faf0] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#1d1d1f] mb-2">E-mail ověřen!</h1>
          <p className="text-[#6e6e73] text-sm mb-6">
            Váš účet je aktivní. Přesměrováváme vás do obchodu…
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            Přejít do obchodu
          </Link>
        </>
      )}

      {state === 'error' && (
        <>
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#1d1d1f] mb-2">Ověření selhalo</h1>
          <p className="text-[#6e6e73] text-sm mb-6">{errorMessage}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-block bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold rounded-xl px-6 py-3 transition-colors text-center"
            >
              Zpět na přihlášení
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
