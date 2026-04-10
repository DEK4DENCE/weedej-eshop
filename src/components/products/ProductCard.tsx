'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, variantId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0]
  const price = defaultVariant?.price ?? product.basePrice
  const isOutOfStock = defaultVariant ? defaultVariant.stock === 0 : false
  const isLowStock = defaultVariant ? defaultVariant.stock > 0 && defaultVariant.stock <= 5 : false
  const mainImage = product.imageUrls[0] ?? '/images/placeholder-product.webp'
  const adjustments = product.imageAdjustments ? JSON.parse(product.imageAdjustments) : {}
  const savedAdj = adjustments[mainImage]
  const mainAdj = savedAdj ?? { x: 50, y: 50, zoom: 1 }
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!defaultVariant || isOutOfStock) return
    if (onAddToCart) {
      onAddToCart(product, defaultVariant.id)
      return
    }
    await addItem({
      variantId: defaultVariant.id,
      productId: product.id,
      productName: product.name,
      variantName: defaultVariant.name,
      price: Number(defaultVariant.price),
      imageUrl: mainImage,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <Link
        href={`/products/${product.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden border border-[#DEE2E6] hover:border-[#2E7D32] transition-all duration-300 shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.14)]"
      >
        {/* Image */}
        <div
          className="relative overflow-hidden aspect-square"
          style={{
            backgroundImage: `url(${mainImage})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: savedAdj ? `${mainAdj.zoom * 100}%` : 'contain',
            backgroundPosition: `${mainAdj.x}% ${mainAdj.y}%`,
            backgroundColor: '#ffffff',
          }}
        >

          {/* Category badge */}
          {product.category && (
            <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/30 text-[#2E7D32]">
              {product.category.name}
            </span>
          )}

          {/* Low stock / out of stock overlay badge */}
          {isLowStock && !isOutOfStock && (
            <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              Poslední kusy
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-2">
          {/* Strain type */}
          {product.strainType && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#aeaeb2]">
              {product.strainType}
            </span>
          )}

          <h3 className="text-base font-semibold text-[#1d1d1f] leading-snug line-clamp-2 group-hover:text-[#2E7D32] transition-colors">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-xs text-[#6e6e73] line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* THC/CBD if present */}
          {(product.thcContent || product.cbdContent) && (
            <div className="flex gap-3 text-xs text-[#6e6e73]">
              {product.thcContent != null && <span>THC: {product.thcContent}%</span>}
              {product.cbdContent != null && <span>CBD: {product.cbdContent}%</span>}
            </div>
          )}

          {/* Stock status */}
          {defaultVariant && (
            <div>
              {defaultVariant.stock === 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Není skladem
                </span>
              ) : defaultVariant.stock <= 5 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  Posledních {defaultVariant.stock} ks
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-[#2E7D32]">
                  Skladem
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-bold text-[#8B6914] font-mono">
              {formatPrice(Number(price))}
            </span>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock || added}
              aria-label={`Přidat ${product.name} do košíku`}
              className="w-9 h-9 rounded-full bg-[#2E7D32] hover:bg-[#1a9020] flex items-center justify-center text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-green-sm"
            >
              {added ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
