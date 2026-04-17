"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { AgeGate } from "@/components/layout/AgeGate"
import { Analytics } from "@vercel/analytics/react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AgeGate />
      {children}
      {/* SEO-1: Vercel Analytics — tracks page views and performance */}
      <Analytics />
    </SessionProvider>
  )
}
