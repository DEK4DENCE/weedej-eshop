"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils/formatPrice"
import { Loader2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { CartItem as DbCartItem } from "@/types/cart"
import type { GuestCartItem } from "@/store/cartStore"

function isDbItem(item: DbCartItem | GuestCartItem): item is DbCartItem {
  return "product" in item && "variant" in item
}

function getItemDetails(item: DbCartItem | GuestCartItem) {
  if (isDbItem(item)) {
    return {
      id: item.id,
      name: item.product.name,
      image: item.product.imageUrls?.[0] ?? null,
      price: Number(item.variant.price),
      quantity: item.quantity,
    }
  }
  return {
    id: item.variantId,
    name: item.productName,
    image: item.imageUrl || null,
    price: item.price,
    quantity: item.quantity,
  }
}

export function CheckoutClient() {
  const { items, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
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
        <ShoppingBag className="h-12 w-12 text-[#6B8A6B] mx-auto mb-4" />
        <p className="text-[#6B8A6B] mb-4">Váš košík je prázdný</p>
        <Button asChild><Link href="/products">Procházet produkty</Link></Button>
      </div>
    )
  }

  const shipping = 4.99
  const total = totalPrice + shipping

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader><CardTitle>Souhrn objednávky</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {items.map((rawItem) => {
            const item = getItemDetails(rawItem as DbCartItem | GuestCartItem)
            return (
              <div key={item.id} className="flex items-center gap-4">
                {item.image && (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Počet: {item.quantity}</p>
                </div>
                <p className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            )
          })}
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Mezisoučet</span><span>{formatPrice(totalPrice)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Doprava</span><span>{formatPrice(shipping)}</span></div>
            <Separator />
            <div className="flex justify-between font-semibold text-base"><span>Celkem</span><span>{formatPrice(total)}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Platba</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Budete přesměrováni na Stripe pro bezpečné dokončení platby.
          </p>
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</p>}
          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="lg"
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Zpracovávám...</> : `Zaplatit ${formatPrice(total)}`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Zabezpečeno Stripe • pouze 18+
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
