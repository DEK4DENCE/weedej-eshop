'use client'

import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types/product'

interface ProductGridProps {
  products: Product[]
  onAddToCart?: (product: Product, variantId: string) => void
  emptyMessage?: string
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
}

export function ProductGrid({ products, onAddToCart, emptyMessage }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Leaf size={48} className="text-[#2E7D32] mb-4" />
        <p className="text-lg font-medium text-[#1d1d1f]">
          {emptyMessage ?? 'Žádné produkty nenalezeny'}
        </p>
        <p className="text-sm text-[#6e6e73] mt-1">
          Zkuste upravit filtry nebo se vraťte později.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      key={products.map((p) => p.id).join(',')}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </motion.div>
      ))}
    </motion.div>
  )
}
