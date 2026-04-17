"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/react"
import { GoogleAnalytics } from "@next/third-parties/google"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ""

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function hasConsent(): boolean {
  const val = getCookieValue("cookie_consent") ?? getCookieValue("analytics_consent")
  return val === "true" || val === "1" || val === "accepted" || val === "all"
}

export function ConsentAnalytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    function check() { setConsented(hasConsent()) }
    check()
    window.addEventListener("storage", check)
    window.addEventListener("cookieConsentUpdated", check)
    return () => {
      window.removeEventListener("storage", check)
      window.removeEventListener("cookieConsentUpdated", check)
    }
  }, [])

  if (!consented) return null

  return (
    <>
      <Analytics />
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </>
  )
}
