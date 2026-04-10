export const dynamic = 'force-dynamic'

import { AccountSettingsClient } from "@/components/account/AccountSettingsClient"

export const metadata = { title: "Nastavení — Weedej", robots: { index: false, follow: false } }

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-playfair">Nastavení účtu</h1>
      <AccountSettingsClient />
    </div>
  )
}