"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { AgeGate } from "@/components/layout/AgeGate"
import { ConsentAnalytics } from "@/components/ConsentAnalytics"
import { CookieConsent } from "@/components/layout/CookieConsent"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AgeGate />
      {children}
      <CookieConsent />
      <ConsentAnalytics />
    </SessionProvider>
  )
}
