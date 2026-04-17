"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { AgeGate } from "@/components/layout/AgeGate"
import { ConsentAnalytics } from "@/components/ConsentAnalytics"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AgeGate />
      {children}
      {/* H14: Analytics only loads after GDPR cookie consent */}
      <ConsentAnalytics />
    </SessionProvider>
  )
}
