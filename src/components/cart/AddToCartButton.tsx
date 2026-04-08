'use client'
import { useState } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'

interface AddToCartButtonProps {
  variantId: string
  productId: string
  productName: string
  variantName: string
  price: number
  imageUrl?: string
  quantity?: number
  disabled?: boolean
  className?: string
}

type ButtonState = 'idle' | 'loading' | 'success'

export default function AddToCartButton({
  variantId,
  productId,
  productName,
  variantName,
  price,
  imageUrl,
  quantity = 1,
  disabled = false,
  className,
}: AddToCartButtonProps) {
  const [state, setState] = useState<ButtonState>('idle')
  const { addItem } = useCart()

  const handleClick = async () => {
    if (state !== 'idle' || disabled) return

    setState('loading')
    try {
      await addItem({ variantId, productId, productName, variantName, price, imageUrl, quantity })
      setState('success')
      setTimeout(() => setState('idle'), 1500)
    } catch {
      setState('idle')
    }
  }

  const baseClass =
    'relative bg-[#22A829] hover:bg-[#38C424] disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-full w-9 h-9 flex items-center justify-center transition-all duration-200 overflow-hidden'

  return (
    <button
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      aria-label="Add to cart"
      className={`${baseClass} ${className ?? ''}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === 'idle' && (
          <motion.span
            key="idle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Plus size={18} strokeWidth={2.5} />
          </motion.span>
        )}
        {state === 'loading' && (
          <motion.span
            key="loading"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Loader2 size={18} className="animate-spin" />
          </motion.span>
        )}
        {state === 'success' && (
          <motion.span
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Check size={18} strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
