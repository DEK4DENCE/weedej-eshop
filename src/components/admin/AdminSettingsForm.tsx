'use client'

import { useState } from 'react'
import { Save, Star, Link2, RefreshCw, CheckCircle, XCircle, Download, Trash2 } from 'lucide-react'

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

  // ERP integration state
  const [erpUrl, setErpUrl] = useState(settings.erpApiUrl ?? '')
  const [erpKey, setErpKey] = useState(settings.erpApiKey ?? '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ created: number; updated: number; skipped: number } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Reset database state
  const [resetting, setResetting] = useState(false)
  const [resetResult, setResetResult] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

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
          erpApiUrl: erpUrl,
          erpApiKey: erpKey,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  async function handleTestErp() {
    if (!erpUrl || !erpKey) {
      setTestResult({ ok: false, message: 'Vyplňte ERP URL a API klíč.' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/erp/import', {
        method: 'GET',
        headers: { 'x-erp-url': erpUrl, 'x-erp-key': erpKey },
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setTestResult({ ok: true, message: `Připojeno! Nalezeno ${data.productCount} produktů v ERP.` })
      } else {
        setTestResult({ ok: false, message: data.error ?? 'Nepodařilo se připojit k ERP.' })
      }
    } catch {
      setTestResult({ ok: false, message: 'Chyba sítě — zkontrolujte URL.' })
    } finally {
      setTesting(false)
    }
  }

  async function handleImportFromErp() {
    if (!erpUrl || !erpKey) {
      setImportError('Nejdřív uložte ERP URL a API klíč.')
      return
    }
    setImporting(true)
    setImportResult(null)
    setImportError(null)
    try {
      const res = await fetch('/api/admin/erp/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ erpUrl, erpKey }),
      })
      const data = await res.json()
      if (res.ok) {
        setImportResult({ created: data.created, updated: data.updated, skipped: data.skipped })
      } else {
        setImportError(data.error ?? 'Import selhal.')
      }
    } catch {
      setImportError('Chyba sítě při importu.')
    } finally {
      setImporting(false)
    }
  }

  async function handleResetDatabase() {
    const confirmed = window.confirm(
      '⚠️ POZOR: Tato akce je nevratná!\n\nBudou smazány:\n- Všechny objednávky\n- Všechny produkty a varianty\n- Skladové pohyby\n- Košíky\n- ERP sync záznamy\n\nZachováno:\n- Uživatelé\n- Kategorie\n- Nastavení\n\nOpravdu chcete pokračovat?'
    )
    if (!confirmed) return

    setResetting(true)
    setResetResult(null)
    setResetError(null)
    try {
      const res = await fetch('/api/admin/settings/reset-database', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setResetResult(data.message)
      } else {
        setResetError(data.error ?? 'Reset selhal.')
      }
    } catch {
      setResetError('Chyba sítě při resetování.')
    } finally {
      setResetting(false)
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

      {/* ERP Integration */}
      <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-blue-500" />
          <h2 className="text-base font-semibold text-foreground">Propojení s ERP</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Zadejte přístupové údaje k ERP systému. Pomocí tlačítka níže importujte produkty — název a cena se vezmou z ERP, obrázky a popis doplníte zde.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">ERP API URL</label>
            <input
              type="url"
              value={erpUrl}
              onChange={(e) => { setErpUrl(e.target.value); setTestResult(null) }}
              placeholder="http://localhost:3000"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">ERP API klíč</label>
            <input
              type="password"
              value={erpKey}
              onChange={(e) => { setErpKey(e.target.value); setTestResult(null) }}
              placeholder="erp_live_..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              API klíč vygenerujete v ERP pod Nastavení → API klíče.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={testing || !erpUrl || !erpKey}
            onClick={handleTestErp}
            className="flex items-center gap-2 bg-background border border-border hover:border-blue-500 disabled:opacity-50 text-foreground font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testuji…' : 'Otestovat připojení'}
          </button>
          {testResult && (
            <div className={`flex items-center gap-1.5 text-sm ${testResult.ok ? 'text-green-600' : 'text-red-500'}`}>
              {testResult.ok ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {testResult.message}
            </div>
          )}
        </div>

        <div className="border-t border-border/40 pt-4 space-y-3">
          <button
            type="button"
            disabled={importing || !erpUrl || !erpKey}
            onClick={handleImportFromErp}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Download className={`h-3.5 w-3.5 ${importing ? 'animate-bounce' : ''}`} />
            {importing ? 'Importuji…' : 'Importovat produkty z ERP'}
          </button>
          <p className="text-xs text-muted-foreground">
            Nové produkty se vytvoří jako skryté — aktivujete je ručně po doplnění obrázků. Již propojené produkty se aktualizují (cena, sklad).
          </p>
          {importResult && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 text-sm text-green-800">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                Import dokončen: <strong>{importResult.created}</strong> nových,{' '}
                <strong>{importResult.updated}</strong> aktualizováno,{' '}
                <strong>{importResult.skipped}</strong> přeskočeno.
              </div>
            </div>
          )}
          {importError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
              <XCircle className="h-4 w-4 shrink-0" />
              {importError}
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-red-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-red-500" />
          <h2 className="text-base font-semibold text-red-600">Nebezpečná zóna</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Smaže všechny objednávky, produkty, varianty, skladové pohyby a košíky. Zachová uživatele, kategorie a nastavení. Po resetu importujte produkty znovu z ERP.
        </p>
        <button
          type="button"
          disabled={resetting}
          onClick={handleResetDatabase}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Trash2 className={`h-3.5 w-3.5 ${resetting ? 'animate-pulse' : ''}`} />
          {resetting ? 'Resetuji…' : 'Resetovat databázi'}
        </button>
        {resetResult && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 text-sm text-green-800 whitespace-pre-line">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{resetResult}</span>
          </div>
        )}
        {resetError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
            <XCircle className="h-4 w-4 shrink-0" />
            {resetError}
          </div>
        )}
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
