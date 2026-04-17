'use client'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="cs">
      <body className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">Něco se pokazilo</h1>
          <p className="text-[#6e6e73] mb-6">Omlouváme se za potíže. Zkuste to prosím znovu.</p>
          <button onClick={reset} className="px-6 py-2 bg-[#2E7D32] text-white rounded-full hover:bg-[#1a9020] transition-colors">
            Zkusit znovu
          </button>
        </div>
      </body>
    </html>
  )
}
