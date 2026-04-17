'use client'

import { useState, useEffect } from 'react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cookie_consent='))
    if (!consent) {
      setVisible(true)
    }
  }, [])

  function accept() {
    document.cookie = 'cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax'
    setVisible(false)
    window.dispatchEvent(new Event('cookieConsentUpdated'))
  }

  function reject() {
    document.cookie = 'cookie_consent=rejected; max-age=31536000; path=/; SameSite=Lax'
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.08)] border-t border-[#DEE2E6]">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-[#515154] text-center sm:text-left">
          Tento web používá cookies pro zajištění nejlepšího zážitku.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-medium bg-[#2E7D32] hover:bg-[#1a5e1f] text-white rounded-lg transition-colors"
          >
            Přijmout
          </button>
          <button
            onClick={reject}
            className="px-4 py-2 text-sm font-medium border border-[#DEE2E6] text-[#515154] hover:bg-[#F8F9FA] rounded-lg transition-colors"
          >
            Odmítnout
          </button>
        </div>
      </div>
    </div>
  )
}
