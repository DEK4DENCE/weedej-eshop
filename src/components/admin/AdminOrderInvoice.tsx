'use client'

import { useState } from 'react'
import { Download, RefreshCw, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  orderId: string
  invoiceNumber: string | null
  hasInvoicePdf: boolean
}

export function AdminOrderInvoice({ orderId, invoiceNumber, hasInvoicePdf }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function download(refresh = false) {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/admin/orders/${orderId}/invoice${refresh ? '?refresh=1' : ''}`
      const res = await fetch(url)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Faktura není dostupná')
        return
      }
      const blob = await res.blob()
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = invoiceNumber ? `faktura-${invoiceNumber}.pdf` : 'faktura.pdf'
      a.click()
      URL.revokeObjectURL(href)
    } catch {
      setError('Chyba při stahování faktury')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => download(false)}
          className="gap-2"
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {loading ? 'Stahování…' : 'Stáhnout fakturu'}
        </Button>

        {!hasInvoicePdf && (
          <Button
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={() => download(true)}
            className="gap-2 text-muted-foreground"
            title="Znovu načíst PDF z ERP systému"
          >
            <RefreshCw size={14} />
            Načíst z ERP
          </Button>
        )}
      </div>

      {!hasInvoicePdf && !error && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <FileText size={12} />
          PDF zatím není uloženo lokálně — bude staženo z ERP
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
