"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils/formatPrice"
import { Loader2, Truck, Store, MapPin, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type DeliveryType = "COURIER" | "PICKUP_IN_STORE"

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

  const shippingCents = deliveryType === "PICKUP_IN_STORE" ? 0 : totalPrice >= 1500 ? 0 : 99
  const shippingEur = shippingCents
  const total = totalPrice + shippingEur

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
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button asChild><Link href="/products">Browse Products</Link></Button>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-green-400" />Delivery Method</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {([
                { value: "COURIER", label: "Home Delivery", desc: "Delivered to your address", icon: Truck },
                { value: "PICKUP_IN_STORE", label: "Pickup in Store", desc: "Free — collect at our shop", icon: Store },
              ] as const).map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDeliveryType(value)}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-colors ${
                    deliveryType === value
                      ? "border-[#2E7D32] bg-[#f0faf0]"
                      : "border-[#DEE2E6] hover:border-[#2E7D32]"
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${deliveryType === value ? "text-[#2E7D32]" : "text-[#6e6e73]"}`} />
                  <span className="font-medium text-sm">{label}</span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Address — only for courier */}
          {deliveryType === "COURIER" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-green-400" />Delivery Address</CardTitle></CardHeader>
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
                        {addr.isDefault && <span className="ml-auto text-xs text-green-400 shrink-0">Default</span>}
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
                      <Plus className="h-4 w-4" />Enter a new address
                    </button>
                  </div>
                )}

                {(selectedAddressId === "new" || addresses.length === 0) && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <Label>Full Name</Label>
                        <Input value={newAddress.fullName} onChange={(e) => setNewAddress((p) => ({ ...p, fullName: e.target.value }))} required />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label>Phone</Label>
                        <Input value={newAddress.phone} onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))} placeholder="+420 ..." />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label>Street Address</Label>
                        <Input value={newAddress.line1} onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))} required placeholder="Street and house number" />
                      </div>
                      <div className="space-y-1">
                        <Label>Postal Code</Label>
                        <Input value={newAddress.postalCode} onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))} required placeholder="110 00" />
                      </div>
                      <div className="space-y-1">
                        <Label>City</Label>
                        <Input value={newAddress.city} onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} required />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label>Country</Label>
                        <select
                          value={newAddress.country}
                          onChange={(e) => setNewAddress((p) => ({ ...p, country: e.target.value }))}
                          className="w-full h-10 px-3 rounded-md border border-[#DEE2E6] bg-[#F8F9FA] text-[#1d1d1f] text-sm outline-none focus:border-[#2E7D32]"
                          required
                        >
                          <option value="CZ">Czech Republic</option>
                          <option value="SK">Slovakia</option>
                          <option value="DE">Germany</option>
                          <option value="AT">Austria</option>
                          <option value="PL">Poland</option>
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
              <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-green-400" />Pickup Location</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Weedej Store</p>
                <p>Václavské náměstí 1, 110 00 Praha 1</p>
                <p>Mon–Sat: 10:00–20:00 | Sun: 12:00–18:00</p>
                <p className="text-green-400 text-xs mt-2">✓ Free pickup — no shipping fee</p>
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
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
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
                  <span>Subtotal</span><span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shippingEur === 0 ? <span className="text-green-400">Free</span> : formatPrice(shippingEur)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base pt-1">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E7D32] hover:bg-[#1a9020] text-white font-bold"
                size="lg"
              >
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting to payment...</>
                  : `Pay ${formatPrice(total)}`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                🔒 Secure payment via Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
