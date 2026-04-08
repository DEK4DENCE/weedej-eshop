'use client'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types/cart'
import type { GuestCartItem } from '@/store/cartStore'

interface CartItemProps {
  item: CartItemType | GuestCartItem
  itemId: string
  onUpdateQty: (itemId: string, variantId: string, quantity: number) => void
  onRemove: (itemId: string, variantId: string) => void
}

function isDbItem(item: CartItemType | GuestCartItem): item is CartItemType {
  return 'product' in item && 'variant' in item
}

export default function CartItem({ item, itemId, onUpdateQty, onRemove }: CartItemProps) {
  const isDb = isDbItem(item)

  const productName = isDb ? item.product.name : (item as GuestCartItem).productName
  const variantName = isDb ? item.variant.name : (item as GuestCartItem).variantName
  const price = isDb ? Number(item.variant.price) : (item as GuestCartItem).price
  const imageUrl = isDb
    ? item.product.imageUrls?.[0] ?? '/images/placeholder-product.webp'
    : (item as GuestCartItem).imageUrl || '/images/placeholder-product.webp'
  const variantId = item.variantId

  return (
    <div className="flex items-start gap-3 py-4 border-b border-[#DEE2E6] last:border-0">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#F8F9FA]">
        <Image src={imageUrl} alt={productName} fill className="object-cover" sizes="64px" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1d1d1f] leading-snug line-clamp-2">{productName}</p>
        <p className="text-xs text-[#6e6e73] mt-0.5">{variantName}</p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => item.quantity > 1 && onUpdateQty(itemId, variantId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="w-6 h-6 rounded-full border border-[#DEE2E6] flex items-center justify-center text-[#6e6e73] hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={12} />
          </button>
          <span className="text-sm font-medium text-[#1d1d1f] w-5 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(itemId, variantId, item.quantity + 1)}
            aria-label="Increase quantity"
            className="w-6 h-6 rounded-full border border-[#DEE2E6] flex items-center justify-center text-[#6e6e73] hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Price + Remove */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-sm font-bold text-[#b8860b] font-mono">
          {Math.round(price * item.quantity).toLocaleString('cs-CZ')} Kč
        </span>
        <button
          onClick={() => onRemove(itemId, variantId)}
          aria-label="Remove item"
          className="text-[#aeaeb2] hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
