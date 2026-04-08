"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { AgeGate } from "@/components/layout/AgeGate"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AgeGate />
      {children}
    </SessionProvider>
  )
}
