// src/lib/erp.ts
// Klient pro komunikaci s ERP API
// Eshop → ERP: čtení produktů, skladu, odesílání objednávek

const ERP_API_URL = process.env.ERP_API_URL
const ERP_API_KEY = process.env.ERP_API_KEY

/**
 * Zkontroluje zda je ERP integrace nakonfigurována
 */
export function isErpConfigured(): boolean {
  return Boolean(ERP_API_URL && ERP_API_KEY)
}

/**
 * Základní fetch volání na ERP API s autentizací
 */
async function erpFetch(path: string, options: RequestInit = {}): Promise<Response> {
  if (!ERP_API_URL || !ERP_API_KEY) {
    throw new Error('ERP není nakonfigurováno. Nastav ERP_API_URL a ERP_API_KEY v .env')
  }

  return fetch(`${ERP_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ERP_API_KEY,
      ...options.headers,
    },
    // Timeout 10 vteřin — ERP může být na localhostu nebo pomalejší
    signal: AbortSignal.timeout(10_000),
  })
}

// ─── Typy ────────────────────────────────────────────────────────────────────

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

// ─── API volání ───────────────────────────────────────────────────────────────

/**
 * Načte seznam aktivních produktů z ERP se stavem skladu
 */
export async function getErpProducts(): Promise<ErpProduct[]> {
  const res = await erpFetch('/api/external/products')
  if (!res.ok) throw new Error(`ERP products error: ${res.status}`)
  return res.json()
}

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
