'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type VerifyState = 'loading' | 'success' | 'error'

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
        const res = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (res.ok) {
          setState('success')
          setTimeout(() => router.push('/login'), 3000)
        } else {
          setState('error')
          setErrorMessage(data.error ?? 'Neplatný nebo vypršelý ověřovací odkaz.')
        }
      } catch {
        setState('error')
        setErrorMessage('Něco se pokazilo. Zkuste to prosím znovu.')
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-8 w-full max-w-md text-center">
      {state === 'loading' && (
        <>
          <div className="w-12 h-12 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-xl font-semibold text-[#F0F5F0] mb-2">Ověřování e-mailu…</h1>
          <p className="text-[#6B8F6B] text-sm">Mělo by to trvat jen chvíli.</p>
        </>
      )}

      {state === 'success' && (
        <>
          <div className="w-12 h-12 bg-[#1A2E1A] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#F0F5F0] mb-2">E-mail ověřen!</h1>
          <p className="text-[#6B8F6B] text-sm mb-6">
            Váš účet je nyní aktivní. Přesměrováváme vás na přihlášení…
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#2E7D32] hover:bg-[#38C424] text-black font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            Přihlásit se
          </Link>
        </>
      )}

      {state === 'error' && (
        <>
          <div className="w-12 h-12 bg-[#2E1A1A] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#F0F5F0] mb-2">Ověření selhalo</h1>
          <p className="text-[#6B8F6B] text-sm mb-6">{errorMessage}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-block bg-[#2E7D32] hover:bg-[#38C424] text-black font-semibold rounded-xl px-6 py-3 transition-colors text-center"
            >
              Zpět na přihlášení
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
