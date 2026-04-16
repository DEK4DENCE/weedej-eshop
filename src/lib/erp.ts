// src/lib/erp.ts
// Klient pro komunikaci s ERP API
// Eshop → ERP: čtení produktů, skladu, odesílání objednávek

import { db } from '@/lib/db'

export interface ErpConfig {
  url: string
  key: string
}

/**
 * Načte ERP konfiguraci — priorita: env vars → DB settings (admin nastavení)
 * Tím pádem není nutný přístup k Vercel env vars, stačí nastavit v admin UI.
 */
export async function getErpConfig(): Promise<ErpConfig | null> {
  // 1. Zkus env vars (rychlejší, bez DB)
  const envUrl = process.env.ERP_API_URL?.trim()
  const envKey = process.env.ERP_API_KEY?.trim()
  if (envUrl && envKey) return { url: envUrl, key: envKey }

  // 2. Fallback: DB settings (uloženo přes admin UI → Nastavení → Propojení s ERP)
  try {
    const [urlRow, keyRow] = await Promise.all([
      db.setting.findUnique({ where: { key: 'erpApiUrl' } }),
      db.setting.findUnique({ where: { key: 'erpApiKey' } }),
    ])
    if (urlRow?.value?.trim() && keyRow?.value?.trim()) {
      return { url: urlRow.value.trim(), key: keyRow.value.trim() }
    }
  } catch {
    // DB nedostupná — ignoruj
  }

  return null
}

/**
 * Synchronní check (pouze env vars) — pro místa kde async není možné
 */
export function isErpConfigured(): boolean {
  return Boolean(process.env.ERP_API_URL && process.env.ERP_API_KEY)
}

/**
 * Základní fetch volání na ERP API s autentizací
 */
async function erpFetch(path: string, options: RequestInit = {}, config?: ErpConfig): Promise<Response> {
  const cfg = config ?? await getErpConfig()
  if (!cfg) {
    throw new Error('ERP není nakonfigurováno. Nastav ERP URL a API klíč v admin Nastavení → Propojení s ERP.')
  }

  return fetch(`${cfg.url.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': cfg.key,
      ...options.headers,
    },
    signal: AbortSignal.timeout(10_000),
  })
}

// ─── Typy ────────────────────────────────────────────────────────────────────

export interface ErpVariant {
  id: string          // EshopVariant.id v ERP
  name: string
  price: number       // Cena s DPH (Kč)
  variantValue: number | null
  variantUnit: string | null
  isDefault: boolean
  isActive: boolean
}

export interface ErpProduct {
  id: string
  name: string
  slug: string | null
  description: string | null
  shortDescription: string | null
  imageUrls: string[]
  price: number           // Bez DPH (Kč)
  vatRate: number         // 0, 12, nebo 21
  priceWithVat: number    // S DPH (Kč)
  unit: string            // "ks" nebo "g"
  stock: number           // Aktuální stav skladu
  inStock: boolean
  isFeatured: boolean
  category: { id: string; name: string; slug: string | null } | null
  eshopVariants: ErpVariant[]  // Varianty spravované z ERP
}

export interface ErpStockItem {
  id: string
  name: string
  slug: string | null
  price: number
  vatRate: number
  priceWithVat: number
  unit: string
  stock: number
  inStock: boolean
}

export interface ErpOrderItem {
  erpProductId?: string   // ID produktu v ERP (pokud je propojení)
  productName: string
  quantity: number
  unit: string
  priceWithoutVat: number // Cena bez DPH za kus (Kč)
  vatRate: number
}

export interface ErpOrderInput {
  stripeSessionId?: string
  stripePaymentIntent?: string
  eshopUserId?: string
  eshopOrderId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  items: ErpOrderItem[]
  totalAmountCents: number  // Celkem v haléřích (z Stripe)
  note?: string
}

export interface ErpOrderResult {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  duplicate?: boolean
}

// ─── New contract (POST /api/orders) ─────────────────────────────────────────

export interface ErpOrderSyncInput {
  eshopOrderId:     string          // UUID v4 — idempotency key
  items: Array<{
    sku?:         string
    name:         string
    quantity:     number
    unit?:        string            // ERP base unit (g, ml, ks…); defaults to 'ks' in ERP
    unitPriceCzk: number            // CZK excl. VAT
    vatRate:      number
  }>
  customer: {
    name:    string
    email:   string
    address: {
      street:  string
      city:    string
      zip:     string
      country: string
    }
  }
  totalCzk:         number          // CZK incl. VAT
  paymentReference: string          // Stripe paymentIntent or session ID
  paidAt:           string          // ISO 8601
}

export interface ErpOrderSyncResult {
  erpOrderNumber:   string          // ESH{YYYY}{XXXX}
  invoiceNumber:    string | null
  invoicePdfBase64: string | null
  invoicePdfUrl:    string | null
}

// ─── API volání ───────────────────────────────────────────────────────────────

/**
 * Načte seznam aktivních produktů z ERP se stavem skladu
 */
export async function getErpProducts(): Promise<ErpProduct[]> {
  const res = await erpFetch('/api/external/products')
  if (!res.ok) throw new Error(`ERP products error: ${res.status}`)
  return res.json()
}

// ─── Inventory summary (admin) ───────────────────────────────────────────────

export interface ErpInventoryItem {
  productId: string
  productName: string
  unit: string
  price: number
  vatRate: number
  category: { id: string; name: string } | null
  physicalStock: number
  reservedStock: number
  availableStock: number
  expectedQuantity: number
  totalExpectedStock: number
  avgPurchasePrice: number
  totalPurchaseValue: number
  totalSalesValue: number
  stockStatus: 'empty' | 'low' | 'ok'
}

/**
 * Načte kompletní inventární přehled z ERP (pro admin stránku skladu)
 * Zahrnuje fyzický sklad, rezervace, dostupné množství a očekávané dodávky
 */
export async function getErpInventory(): Promise<ErpInventoryItem[]> {
  const res = await erpFetch('/api/external/inventory')
  if (!res.ok) throw new Error(`ERP inventory error: ${res.status}`)
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Načte aktuální stav skladu pro konkrétní ERP produkt ID
 * Pokud ids není zadáno, vrátí vše
 */
export async function getErpStock(erpProductIds?: string[]): Promise<ErpStockItem[]> {
  const params = erpProductIds?.length ? `?ids=${erpProductIds.join(',')}` : ''
  const res = await erpFetch(`/api/external/stock${params}`)
  if (!res.ok) throw new Error(`ERP stock error: ${res.status}`)
  return res.json()
}

/**
 * Odešle objednávku do ERP po úspěšné Stripe platbě
 * Bezpečné pro opakované volání — používá stripeSessionId pro deduplikaci
 */
export async function createErpOrder(order: ErpOrderInput): Promise<ErpOrderResult> {
  const res = await erpFetch('/api/external/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ERP order error ${res.status}: ${err}`)
  }
  return res.json()
}

/**
 * Vrátí stav konkrétní objednávky z ERP
 */
export async function getErpOrder(
  params: { id?: string; stripeSessionId?: string }
): Promise<ErpOrderResult | null> {
  const query = params.id
    ? `?id=${params.id}`
    : `?stripeSessionId=${params.stripeSessionId}`
  const res = await erpFetch(`/api/external/orders${query}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`ERP order status error: ${res.status}`)
  return res.json()
}

/**
 * Syncs an e-shop order to the ERP using the new /api/orders contract.
 * Uses eshopOrderId (UUID) for idempotency — safe to retry.
 * Returns ERP order number + invoice data for email attachment.
 *
 * Throws on network/5xx error — caller is responsible for retry queue.
 */
export async function syncOrderToErp(
  input: ErpOrderSyncInput,
  config?: ErpConfig,
): Promise<ErpOrderSyncResult> {
  const res = await erpFetch('/api/orders', {
    method: 'POST',
    body:   JSON.stringify(input),
  }, config)

  if (!res.ok) {
    let detail = ''
    try { detail = await res.text() } catch {}
    throw new Error(`ERP sync error ${res.status}: ${detail}`)
  }

  return res.json() as Promise<ErpOrderSyncResult>
}
