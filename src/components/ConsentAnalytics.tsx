"use client"

// H14: GDPR-compliant wrapper — only loads Vercel Analytics after cookie consent.
// Reads the `cookie_consent` cookie (set by the cookie banner) before rendering.

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/react"

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function ConsentAnalytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    // Check on mount and on storage events (in case consent is granted in another tab)
    function check() {
      const val = getCookieValue("cookie_consent") ?? getCookieValue("analytics_consent")
      setConsented(val === "true" || val === "1" || val === "accepted" || val === "all")
    }

    check()

    // Re-check when the user accepts the cookie banner (dispatches a storage event)
    window.addEventListener("storage", check)
    // Also re-check on a custom event that the cookie banner can dispatch
    window.addEventListener("cookieConsentUpdated", check)

    return () => {
      window.removeEventListener("storage", check)
      window.removeEventListener("cookieConsentUpdated", check)
    }
  }, [])

  if (!consented) return null

  return <Analytics />
}
