'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'
import type { Product } from '@/types/product'

const SUBSTANCE_STYLES: Record<string, string> = {
  THC_X: 'bg-blue-50 border-blue-300 text-blue-700',
  THC:   'bg-purple-50 border-purple-300 text-purple-700',
  CBD:   'bg-green-50 border-green-300 text-green-700',
  HHC:   'bg-orange-50 border-orange-300 text-orange-700',
}
const SUBSTANCE_LABELS: Record<string, string> = { THC_X: 'THC-X', THC: 'THC', CBD: 'CBD', HHC: 'HHC' }

function SubstanceBadge({ substance }: { substance: string }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${SUBSTANCE_STYLES[substance] ?? 'bg-gray-50 border-gray-300 text-gray-600'}`}>
      {SUBSTANCE_LABELS[substance] ?? substance}
    </span>
  )
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, variantId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // ERP stock (raw units, e.g. 100 for 100g) — used as fallback when local variant stock is 0
  const erpStockUnits = Number(product.erpStock ?? 0)

  // Show the smallest in-stock variant by variantValue; fall back to smallest overall
  const inStockVariants = product.variants.filter((v) => v.stock > 0)
  const pickSmallest = (arr: typeof product.variants) =>
    arr.length === 0 ? undefined :
    arr.reduce((a, b) =>
      (a.variantValue ?? Infinity) <= (b.variantValue ?? Infinity) ? a : b
    )
  const defaultVariant = pickSmallest(inStockVariants) ?? pickSmallest(product.variants) ?? product.variants[0]
  const price = defaultVariant?.price ?? product.basePrice

  // A product is out of stock only when BOTH local variant stock is 0 AND ERP has no stock
  const isOutOfStock = defaultVariant ? (defaultVariant.stock === 0 && erpStockUnits === 0) : false
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
        <div className="relative overflow-hidden aspect-square bg-white">
          <Image
            src={mainImage}
            alt={`${product.name}${product.strainType ? ` — ${product.strainType}` : ''}${product.cbdContent ? `, CBD ${product.cbdContent}%` : ''}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            style={{
              objectPosition: `${mainAdj.x}% ${mainAdj.y}%`,
              transform: mainAdj.zoom !== 1 ? `scale(${mainAdj.zoom})` : undefined,
              transformOrigin: `${mainAdj.x}% ${mainAdj.y}%`,
            }}
          />

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
          {/* Strain type + substance badges */}
          {(product.strainType || (product as any).activeSubstance) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.strainType && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#aeaeb2]">
                  {product.strainType}
                </span>
              )}
              {(product as any).activeSubstance && (
                <SubstanceBadge substance={(product as any).activeSubstance} />
              )}
            </div>
          )}

          <h3 className="text-base font-semibold text-[#1d1d1f] leading-snug line-clamp-2 group-hover:text-[#2E7D32] transition-colors">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-xs text-[#6e6e73] line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* THC/CBD + Sativa/Indica if present */}
          {(product.thcContent != null || product.cbdContent != null || (product.sativaPercent != null && product.indicaPercent != null)) && (
            <div className="flex flex-wrap gap-2 text-xs text-[#6e6e73]">
              {product.thcContent != null && <span>THC: {product.thcContent}%</span>}
              {product.cbdContent != null && <span>CBD: {product.cbdContent}%</span>}
              {product.sativaPercent != null && product.indicaPercent != null && (
                <span>
                  <span className="text-green-600">S {product.sativaPercent}%</span>
                  {' / '}
                  <span className="text-purple-600">I {product.indicaPercent}%</span>
                </span>
              )}
            </div>
          )}

          {/* Effects + Flavours */}
          {(product.effects.length > 0 || product.flavours.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {product.effects.slice(0, 3).map((e) => (
                <span key={e} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2E7D32]/10 text-[#2E7D32]">{e}</span>
              ))}
              {product.flavours.slice(0, 3).map((f) => (
                <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#b8860b]/10 text-[#8B6914]">{f}</span>
              ))}
            </div>
          )}

          {/* Stock status */}
          {defaultVariant && (
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Není skladem
                </span>
              ) : defaultVariant.stock > 0 && defaultVariant.stock <= 5 ? (
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
            <div>
              <span className="text-xl font-bold text-[#8B6914] font-mono">
                {formatPrice(Number(price))}
              </span>
              {defaultVariant?.variantValue != null && defaultVariant?.variantUnit && (
                <span className="ml-1.5 text-xs text-[#6e6e73]">
                  / {defaultVariant.variantValue}{defaultVariant.variantUnit}
                </span>
              )}
            </div>

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
