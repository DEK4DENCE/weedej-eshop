'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

interface Props {
  settings: Record<string, string>
}

export function AdminSettingsForm({ settings }: Props) {
  const [orderEmail, setOrderEmail] = useState(settings.orderNotificationEmail ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNotificationEmail: orderEmail }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Email Notifications</h2>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Order notification email
          </label>
          <input
            type="email"
            value={orderEmail}
            onChange={(e) => setOrderEmail(e.target.value)}
            placeholder="orders@yourdomain.com"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            New order notifications are sent to this address. Leave empty to disable.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
      </button>
    </form>
  )
}
