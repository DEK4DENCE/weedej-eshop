"use client"

import { motion } from "framer-motion"
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
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center justify-center py-24 gap-6"
      >
        <div className="p-5 rounded-2xl bg-[#E8F5E9]">
          <ShoppingBag className="w-12 h-12 text-[#2E7D32]" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#1d1d1f]">Váš košík je prázdný</h2>
          <p className="text-[#6e6e73] mt-1">Přidejte produkty pro zahájení nákupu</p>
        </div>
        <Link
          href="/products"
          className="bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Procházet produkty
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1d1d1f]">
            Položky košíku ({items.length})
          </h2>
          <button
            onClick={clearCart}
            className="text-sm text-[#6e6e73] hover:text-red-500 transition-colors"
          >
            Vyprázdnit košík
          </button>
        </div>
        <div className="bg-white border border-[#DEE2E6] rounded-2xl p-4 shadow-sm">
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
