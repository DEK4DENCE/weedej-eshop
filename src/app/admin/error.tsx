'use client'

import { useEffect } from 'react'

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-5xl mb-6">⚠️</p>
      <h2 className="text-2xl font-bold text-[#212121] mb-2">Chyba v administraci</h2>
      <p className="text-[#6e6e73] mb-8">{error.message || 'Nastala neočekávaná chyba.'}</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold rounded-xl transition-colors"
      >
        Zkusit znovu
      </button>
    </div>
  )
}
