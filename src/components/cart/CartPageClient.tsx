"use client"

import { useCart } from "@/hooks/useCart"
import CartItem from "@/components/cart/CartItem"
import CartSummary from "@/components/cart/CartSummary"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import type { CartItem as CartItemType } from "@/types/cart"
import type { GuestCartItem } from "@/store/cartStore"

function getItemId(item: CartItemType | GuestCartItem): string {
  if ('product' in item && 'variant' in item) {
    return (item as CartItemType).id
  }
  return (item as GuestCartItem).variantId
}

export function CartPageClient() {
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart, isLoading } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <ShoppingBag className="w-16 h-16 text-[#2D5C2D]" />
        <h2 className="text-2xl font-semibold text-[#F0F5F0]">Your cart is empty</h2>
        <p className="text-[#6B8A6B]">Add some products to get started</p>
        <Link
          href="/products"
          className="bg-[#2E7D32] hover:bg-[#38C424] text-black font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#F0F5F0]">
            Cart Items ({items.length})
          </h2>
          <button
            onClick={clearCart}
            className="text-sm text-[#6B8A6B] hover:text-[#E53E3E] transition-colors"
          >
            Clear cart
          </button>
        </div>
        <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-4">
          {items.map((item) => {
            const itemId = getItemId(item as CartItemType | GuestCartItem)
            return (
              <CartItem
                key={itemId}
                item={item as CartItemType | GuestCartItem}
                itemId={itemId}
                onUpdateQty={updateQty}
                onRemove={removeItem}
              />
            )
          })}
        </div>
      </div>
      <div>
        <CartSummary
          totalPrice={totalPrice}
          itemCount={totalItems}
        />
      </div>
    </div>
  )
}
