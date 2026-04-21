"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { AgeGate } from "@/components/layout/AgeGate"
import { ConsentAnalytics } from "@/components/ConsentAnalytics"
import { CookieConsent } from "@/components/layout/CookieConsent"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="weedej-theme">
      <SessionProvider>
        <AgeGate />
        {children}
        <CookieConsent />
        <ConsentAnalytics />
      </SessionProvider>
    </ThemeProvider>
  )
}
