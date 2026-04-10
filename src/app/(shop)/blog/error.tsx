'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function BlogError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <p className="text-5xl mb-6">📝</p>
      <h2 className="text-2xl font-bold text-[#212121] mb-2">Nepodařilo se načíst blog</h2>
      <p className="text-[#6e6e73] mb-8">Zkuste to prosím znovu nebo se vraťte na hlavní stránku.</p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold rounded-xl transition-colors"
        >
          Zkusit znovu
        </button>
        <Link href="/" className="px-5 py-2.5 border border-[#DEE2E6] text-[#6e6e73] hover:text-[#1d1d1f] rounded-xl transition-colors">
          Domů
        </Link>
      </div>
    </div>
  )
}
