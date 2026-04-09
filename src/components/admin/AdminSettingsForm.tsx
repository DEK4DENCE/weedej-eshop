'use client'

import { useState } from 'react'
import { Save, Star } from 'lucide-react'

interface Product { id: string; name: string }

interface Props {
  settings: Record<string, string>
  products: Product[]
}

export function AdminSettingsForm({ settings, products }: Props) {
  const [orderEmail, setOrderEmail] = useState(settings.orderNotificationEmail ?? '')
  const [bestsellers, setBestsellers] = useState<string[]>(() => {
    try { return JSON.parse(settings.bestsellers ?? '[]') } catch { return [] }
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleBestseller(id: string) {
    setBestsellers((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 4) return prev
      return [...prev, id]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNotificationEmail: orderEmail,
          bestsellers: JSON.stringify(bestsellers),
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email notifications */}
      <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Email oznámení</h2>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Email pro nové objednávky
          </label>
          <input
            type="email"
            value={orderEmail}
            onChange={(e) => setOrderEmail(e.target.value)}
            placeholder="orders@yourdomain.com"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Oznámení o nových objednávkách. Nechte prázdné pro vypnutí.
          </p>
        </div>
      </div>

      {/* Bestsellers */}
      <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <h2 className="text-base font-semibold text-foreground">Bestsellery na hlavní stránce</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Vyberte až 4 produkty, které se zobrazí jako bestsellery na hlavní stránce.
          Vybráno: {bestsellers.length}/4
        </p>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {products.map((p) => {
            const selected = bestsellers.includes(p.id)
            const disabled = !selected && bestsellers.length >= 4
            return (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleBestseller(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors ${
                  selected
                    ? 'border-[#2E7D32] bg-[#f0faf0] text-[#1d1d1f]'
                    : disabled
                    ? 'border-border/40 text-muted-foreground opacity-50 cursor-not-allowed'
                    : 'border-border/40 hover:border-[#2E7D32] text-[#1d1d1f]'
                }`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'border-border'}`}>
                  {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                </span>
                {p.name}
                {selected && (
                  <span className="ml-auto text-xs text-[#2E7D32] font-medium">
                    #{bestsellers.indexOf(p.id) + 1}
                  </span>
                )}
              </button>
            )
          })}
          {products.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Žádné aktivní produkty</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1a9020] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Ukládám…' : saved ? 'Uloženo!' : 'Uložit nastavení'}
      </button>
    </form>
  )
}
