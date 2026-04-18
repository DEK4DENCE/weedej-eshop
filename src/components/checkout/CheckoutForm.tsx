"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils/formatPrice"
import { Loader2, MapPin, Plus, Shield, Lock, Phone, Truck } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { DeliveryCarrierSelector, type DeliveryMethod } from "@/components/checkout/DeliveryCarrierSelector"
import { PacketaWidget } from "@/components/checkout/PacketaWidget"
import { DpdPickupSelector } from "@/components/checkout/DpdPickupSelector"

interface PickupPoint {
  id: string
  name: string
  nameStreet: string
  city: string
  zip: string
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

const SHIPPING_PRICE = 99
const FREE_THRESHOLD = 1500

function calcShipping(delivery: DeliveryMethod | null, subtotal: number): number {
  if (!delivery) return SHIPPING_PRICE
  if (delivery === "DPD_PICKUP" || delivery === "ZASILKOVNA_PICKUP") return SHIPPING_PRICE
  // Home delivery: free above threshold
  return subtotal >= FREE_THRESHOLD ? 0 : SHIPPING_PRICE
}

export function CheckoutForm({ user, addresses }: Props) {
  const { items, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [postalError, setPostalError] = useState<string | null>(null)

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const [pickupPoint, setPickupPoint] = useState<PickupPoint | null>(null)

  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id ?? "new")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name ?? "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "CZ",
    phone: user?.phone ?? "",
  })
  const [billingDifferent, setBillingDifferent] = useState(false)
  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    company: "",
    ico: "",
    line1: "",
    city: "",
    postalCode: "",
    country: "CZ",
  })

  const isPickup = deliveryMethod === "DPD_PICKUP" || deliveryMethod === "ZASILKOVNA_PICKUP"
  const isHome = deliveryMethod === "DPD_HOME" || deliveryMethod === "ZASILKOVNA_HOME"
  const shippingCost = calcShipping(deliveryMethod, totalPrice)
  const total = totalPrice + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0 || !deliveryMethod) return

    if (isPickup && !pickupPoint) {
      setError("Prosím vyberte výdejní místo.")
      return
    }

    setLoading(true)
    setError(null)

    const addressPayload = isHome
      ? selectedAddressId === "new"
        ? { ...newAddress, phone: newAddress.phone || phone, saveAddress: true }
        : { existingAddressId: selectedAddressId, phone }
      : undefined

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryType: deliveryMethod,
          address: addressPayload,
          phone,
          pickupPointId: pickupPoint?.id ?? undefined,
          pickupPointName: pickupPoint?.name ?? undefined,
          pickupPointAddress: pickupPoint ? `${pickupPoint.nameStreet}, ${pickupPoint.zip} ${pickupPoint.city}` : undefined,
          billingAddress: billingDifferent ? billingAddress : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Chyba při zpracování objednávky")
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const checkoutSteps = [
    { number: 1, label: "Košík" },
    { number: 2, label: "Objednávka" },
    { number: 3, label: "Platba" },
    { number: 4, label: "Potvrzení" },
  ]
  const currentStep = 2

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Váš košík je prázdný</p>
        <Button asChild><Link href="/products">Procházet produkty</Link></Button>
      </div>
    )
  }

  return (
    <>
      {/* Step indicator */}
      <nav aria-label="Průběh objednávky" className="mb-8">
        <ol className="flex items-center justify-center gap-0">
          {checkoutSteps.map((step, index) => {
            const isDone = step.number < currentStep
            const isCurrent = step.number === currentStep
            return (
              <li key={step.number} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    aria-current={isCurrent ? "step" : undefined}
                    className={[
                      "flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold border-2 transition-colors",
                      isDone
                        ? "bg-[#2E7D32] border-[#2E7D32] text-white"
                        : isCurrent
                        ? "bg-white border-[#2E7D32] text-[#2E7D32]"
                        : "bg-white border-[#DEE2E6] text-[#aeaeb2]",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={["text-xs font-medium whitespace-nowrap", isCurrent ? "text-[#2E7D32]" : isDone ? "text-[#1d1d1f]" : "text-[#aeaeb2]"].join(" ")}>
                    {step.label}
                  </span>
                </div>
                {index < checkoutSteps.length - 1 && (
                  <div
                    className={["h-0.5 w-16 mx-2 mb-5 rounded", isDone ? "bg-[#2E7D32]" : "bg-[#DEE2E6]"].join(" ")}
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-3 space-y-6">

            {/* Contact info */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-green-400" />Kontaktní údaje</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <Label>Jméno a příjmení *</Label>
                    <Input
                      value={newAddress.fullName || user?.name || ""}
                      onChange={(e) => setNewAddress((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Jan Novák"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Telefon *</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setNewAddress((p) => ({ ...p, phone: e.target.value })) }}
                      placeholder="+420 ..."
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>E-mail</Label>
                    <Input value={user?.email ?? ""} readOnly className="opacity-60 cursor-not-allowed" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery carrier selector */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-green-400" />Způsob doručení</CardTitle></CardHeader>
              <CardContent>
                <DeliveryCarrierSelector
                  selected={deliveryMethod}
                  onSelect={(m) => { setDeliveryMethod(m); setPickupPoint(null) }}
                  subtotal={totalPrice}
                />
              </CardContent>
            </Card>

            {/* Pickup point selector — shown for pickup delivery types */}
            {deliveryMethod === "ZASILKOVNA_PICKUP" && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-green-400" />Výdejní místo Zásilkovny</CardTitle></CardHeader>
                <CardContent>
                  <PacketaWidget
                    onSelect={setPickupPoint}
                    selectedPoint={pickupPoint}
                  />
                </CardContent>
              </Card>
            )}

            {deliveryMethod === "DPD_PICKUP" && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-green-400" />DPD Výdejní místo</CardTitle></CardHeader>
                <CardContent>
                  <DpdPickupSelector
                    onSelect={setPickupPoint}
                    selectedPoint={pickupPoint}
                  />
                </CardContent>
              </Card>
            )}

            {/* Pickup point delivery address — shown after pickup point is selected */}
            {isPickup && pickupPoint && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-green-400" />Adresa doručení</CardTitle></CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-[#2E7D32] bg-[#2E7D32]/5 p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                      <div>
                        <p className="text-sm font-semibold text-[#1d1d1f]">{pickupPoint.name}</p>
                        <p className="text-sm text-gray-600">{pickupPoint.nameStreet}</p>
                        <p className="text-sm text-gray-600">{pickupPoint.zip} {pickupPoint.city}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Address form — shown for home delivery types */}
            {isHome && (
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
                          <Label>Ulice a číslo domu</Label>
                          <Input value={newAddress.line1} onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))} required placeholder="Ulice a číslo domu" />
                        </div>
                        <div className="space-y-1">
                          <Label>PSČ</Label>
                          <Input
                            value={newAddress.postalCode}
                            onChange={(e) => { setNewAddress((p) => ({ ...p, postalCode: e.target.value })); setPostalError(null) }}
                            onBlur={(e) => {
                              const val = e.target.value.replace(/\s/g, '')
                              if (val && !/^\d{5}$/.test(val)) setPostalError('PSČ musí mít 5 číslic (např. 11000)')
                            }}
                            required
                            placeholder="110 00"
                          />
                          {postalError && <p className="text-xs text-red-600 mt-1">{postalError}</p>}
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

            {/* Billing address */}
            <Card>
              <CardContent className="pt-5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={billingDifferent}
                    onChange={(e) => setBillingDifferent(e.target.checked)}
                    className="h-4 w-4 accent-[#2E7D32] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-[#1d1d1f]">Fakturační adresa je jiná než doručovací</span>
                </label>

                {billingDifferent && (
                  <div className="mt-4 space-y-3 border-t border-[#DEE2E6] pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <Label>Jméno a příjmení / Název firmy *</Label>
                        <Input value={billingAddress.fullName} onChange={(e) => setBillingAddress((p) => ({ ...p, fullName: e.target.value }))} placeholder="Jan Novák nebo Firma s.r.o." required={billingDifferent} />
                      </div>
                      <div className="space-y-1">
                        <Label>Firma (nepovinné)</Label>
                        <Input value={billingAddress.company} onChange={(e) => setBillingAddress((p) => ({ ...p, company: e.target.value }))} placeholder="Název firmy" />
                      </div>
                      <div className="space-y-1">
                        <Label>IČO (nepovinné)</Label>
                        <Input value={billingAddress.ico} onChange={(e) => setBillingAddress((p) => ({ ...p, ico: e.target.value }))} placeholder="12345678" maxLength={12} />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label>Ulice a číslo domu *</Label>
                        <Input value={billingAddress.line1} onChange={(e) => setBillingAddress((p) => ({ ...p, line1: e.target.value }))} placeholder="Ulice a číslo domu" required={billingDifferent} />
                      </div>
                      <div className="space-y-1">
                        <Label>PSČ *</Label>
                        <Input value={billingAddress.postalCode} onChange={(e) => setBillingAddress((p) => ({ ...p, postalCode: e.target.value }))} placeholder="110 00" required={billingDifferent} />
                      </div>
                      <div className="space-y-1">
                        <Label>Město *</Label>
                        <Input value={billingAddress.city} onChange={(e) => setBillingAddress((p) => ({ ...p, city: e.target.value }))} placeholder="Praha" required={billingDifferent} />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label>Země *</Label>
                        <select
                          value={billingAddress.country}
                          onChange={(e) => setBillingAddress((p) => ({ ...p, country: e.target.value }))}
                          className="w-full h-10 px-3 rounded-md border border-[#DEE2E6] bg-[#F8F9FA] text-[#1d1d1f] text-sm outline-none focus:border-[#2E7D32]"
                          required={billingDifferent}
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
                  const productName = item.product?.name ?? item.productName ?? ""
                  const variantName = item.variant?.name ?? item.variantName ?? ""
                  const price = item.variant?.price ?? item.price ?? 0
                  const image = item.product?.imageUrls?.[0] ?? item.imageUrl
                  const displayName = productName
                    ? variantName ? `${productName} — ${variantName}` : productName
                    : variantName
                  return (
                    <div key={item.id ?? item.variantId} className="flex items-center gap-3">
                      {image && (
                        <Image src={image} alt={displayName} width={48} height={48} className="h-12 w-12 rounded-lg object-cover shrink-0 bg-muted" unoptimized={!image.includes('vercel-storage.com') && !image.includes('blob.vercel.app')} />
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
                    <span>{shippingCost === 0 ? <span className="text-green-400">Zdarma</span> : formatPrice(shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base pt-1">
                    <span>Celkem</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.08, color: '#2E7D32' }}
                      animate={{ scale: 1, color: '#1d1d1f' }}
                      transition={{ duration: 0.3 }}
                      className="font-mono"
                    >
                      {formatPrice(total)}
                    </motion.span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 py-2 text-xs text-[#6e6e73]">
                  <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-[#2E7D32]" />SSL šifrování</span>
                  <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-[#2E7D32]" />Bezpečná platba</span>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !deliveryMethod}
                  className="w-full bg-[#2E7D32] hover:bg-[#1a9020] text-white font-bold"
                  size="lg"
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Přesměrování na platbu...</>
                    : !deliveryMethod
                    ? "Vyberte způsob doručení"
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
    </>
  )
}
