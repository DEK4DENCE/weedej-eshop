"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils/formatPrice"
import { Loader2, Truck, Store, MapPin, Plus } from "lucide-react"
import Link from "next/link"

type DeliveryType = "COURIER" | "PICKUP_IN_STORE"

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  freeThreshold: number | null
  estimatedDays: string
}

interface Address {
  id: string
  fullName: string
  line1: string
  line2?: string | null
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface User {
  name?: string | null
  phone?: string | null
  email?: string | null
}

interface Props {
  user: User | null
  addresses: Address[]
}

export function CheckoutForm({ user, addresses }: Props) {
  const { items, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("COURIER")
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id ?? "new")
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name ?? "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "CZ",
    phone: user?.phone ?? "",
  })

  useEffect(() => {
    fetch("/api/shipping")
      .then((r) => r.json())
      .then((data: any[]) => {
        const methods = data.map((m) => ({ ...m, price: Number(m.price), freeThreshold: m.freeThreshold != null ? Number(m.freeThreshold) : null }))
        setShippingMethods(methods)
        if (methods.length > 0) setSelectedShippingId(methods[0].id)
      })
      .catch(() => {})
  }, [])

  const selectedMethod = shippingMethods.find((m) => m.id === selectedShippingId) ?? null
  const methodPrice = deliveryType === "PICKUP_IN_STORE"
    ? 0
    : selectedMethod
      ? (selectedMethod.freeThreshold != null && totalPrice >= selectedMethod.freeThreshold ? 0 : selectedMethod.price)
      : (totalPrice >= 1500 ? 0 : 99)
  const total = totalPrice + methodPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true)
    setError(null)

    const addressPayload =
      deliveryType === "PICKUP_IN_STORE"
        ? null
        : selectedAddressId === "new"
        ? { ...newAddress, saveAddress: true }
        : { existingAddressId: selectedAddressId }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryType,
          address: addressPayload,
          shippingMethodId: deliveryType === "COURIER" ? selectedShippingId : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Checkout failed")
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Váš košík je prázdný</p>
        <Button asChild><Link href="/products">Procházet produkty</Link></Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: form */}
        <div className="lg:col-span-3 space-y-6">

          {/* Delivery type */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-green-400" />Způsob doručení</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {/* Dynamic shipping methods */}
              {shippingMethods.map((method) => {
                const isFree = method.freeThreshold != null && totalPrice >= method.freeThreshold
                const displayPrice = isFree ? "Zdarma" : `${method.price} Kč`
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => { setDeliveryType("COURIER"); setSelectedShippingId(method.id) }}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                      deliveryType === "COURIER" && selectedShippingId === method.id
                        ? "border-[#2E7D32] bg-[#f0faf0]"
                        : "border-[#DEE2E6] hover:border-[#2E7D32]"
                    }`}
                  >
                    <Truck className={`h-5 w-5 mt-0.5 shrink-0 ${deliveryType === "COURIER" && selectedShippingId === method.id ? "text-[#2E7D32]" : "text-[#6e6e73]"}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{method.estimatedDays}</p>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${isFree ? "text-green-600" : ""}`}>{displayPrice}</span>
                  </button>
                )
              })}

              {/* Always show PICKUP_IN_STORE */}
              <button
                type="button"
                onClick={() => setDeliveryType("PICKUP_IN_STORE")}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                  deliveryType === "PICKUP_IN_STORE"
                    ? "border-[#2E7D32] bg-[#f0faf0]"
                    : "border-[#DEE2E6] hover:border-[#2E7D32]"
                }`}
              >
                <Store className={`h-5 w-5 mt-0.5 shrink-0 ${deliveryType === "PICKUP_IN_STORE" ? "text-[#2E7D32]" : "text-[#6e6e73]"}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">Vyzvednutí v prodejně</p>
                  <p className="text-xs text-muted-foreground">Vyzvedněte objednávku osobně v naší prodejně</p>
                </div>
                <span className="text-sm font-semibold shrink-0 text-green-600">Zdarma</span>
              </button>
            </CardContent>
          </Card>

          {/* Address — only for courier */}
          {deliveryType === "COURIER" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-green-400" />Dodací adresa</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                          selectedAddressId === addr.id
                            ? "border-[#2E7D32] bg-[#f0faf0]"
                            : "border-[#DEE2E6] hover:border-[#2E7D32]"
                        }`}
                      >
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">{addr.fullName}</p>
                          <p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                          <p className="text-muted-foreground">{addr.postalCode} {addr.city}, {addr.country}</p>
                        </div>
                        {addr.isDefault && <span className="ml-auto text-xs text-green-400 shrink-0">Výchozí</span>}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId("new")}
                      className={`w-full flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-colors ${
                        selectedAddressId === "new"
                          ? "border-[#2E7D32] bg-[#f0faf0]"
                          : "border-[#DEE2E6] hover:border-[#2E7D32]"
                      }`}
                    >
                      <Plus className="h-4 w-4" />Zadat novou adresu
                    </button>
                  </div>
                )}

                {(selectedAddressId === "new" || addresses.length === 0) && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <Label>Celé jméno</Label>
                        <Input value={newAddress.fullName} onChange={(e) => setNewAddress((p) => ({ ...p, fullName: e.target.value }))} required />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label>Telefon</Label>
                        <Input value={newAddress.phone} onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))} placeholder="+420 ..." />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label>Ulice a číslo domu</Label>
                        <Input value={newAddress.line1} onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))} required placeholder="Ulice a číslo domu" />
                      </div>
                      <div className="space-y-1">
                        <Label>PSČ</Label>
                        <Input value={newAddress.postalCode} onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))} required placeholder="110 00" />
                      </div>
                      <div className="space-y-1">
                        <Label>Město</Label>
                        <Input value={newAddress.city} onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} required />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label>Země</Label>
                        <select
                          value={newAddress.country}
                          onChange={(e) => setNewAddress((p) => ({ ...p, country: e.target.value }))}
                          className="w-full h-10 px-3 rounded-md border border-[#DEE2E6] bg-[#F8F9FA] text-[#1d1d1f] text-sm outline-none focus:border-[#2E7D32]"
                          required
                        >
                          <option value="CZ">Česká republika</option>
                          <option value="SK">Slovensko</option>
                          <option value="DE">Německo</option>
                          <option value="AT">Rakousko</option>
                          <option value="PL">Polsko</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pickup info */}
          {deliveryType === "PICKUP_IN_STORE" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-green-400" />Místo vyzvednutí</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Prodejna Weedej</p>
                <p>Benešovská 432/3, 405 02 Děčín 2</p>
                <p>Po–Pá: 11:00–19:00 | So: 11:00–17:00</p>
                <p className="text-green-400 text-xs mt-2">✓ Vyzvednutí zdarma — bez poplatku za dopravu</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl">{error}</p>
          )}
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader><CardTitle>Shrnutí objednávky</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {items.map((item: any) => {
                const productName = item.variant?.product?.name ?? item.productName ?? ""
                const variantName = item.variant?.name ?? item.variantName ?? ""
                const price = item.variant?.price ?? item.price ?? 0
                const image = item.variant?.product?.imageUrls?.[0] ?? item.imageUrl
                const displayName = productName
                  ? variantName
                    ? `${productName} — ${variantName}`
                    : productName
                  : variantName
                return (
                  <div key={item.id ?? item.variantId} className="flex items-center gap-3">
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={displayName} className="h-12 w-12 rounded-lg object-cover shrink-0 bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium shrink-0">{formatPrice(Number(price) * item.quantity)}</p>
                  </div>
                )
              })}

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Mezisoučet</span><span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Doprava</span>
                  <span>{methodPrice === 0 ? <span className="text-green-400">Zdarma</span> : formatPrice(methodPrice)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base pt-1">
                  <span>Celkem</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E7D32] hover:bg-[#1a9020] text-white font-bold"
                size="lg"
              >
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Přesměrování na platbu...</>
                  : `Zaplatit ${formatPrice(total)}`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                🔒 Bezpečná platba přes Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
