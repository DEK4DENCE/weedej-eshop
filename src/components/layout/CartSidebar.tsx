'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'
import type { CartItem as CartItemType } from '@/types/cart'
import type { GuestCartItem } from '@/store/cartStore'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const drawerVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, totalItems, totalPrice, updateQty, removeItem, isLoading } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  const getItemId = (item: CartItemType | GuestCartItem): string => {
    if ('id' in item && 'product' in item) {
      // DB CartItem: id is the CartItem row id
      return (item as CartItemType).id
    }
    // Guest item: use variantId as the itemId (store uses variantId for lookups)
    return item.variantId
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 z-50 h-full w-[400px] max-w-[90vw] bg-white border-l border-[#d2d2d7] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] flex flex-col"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d2d2d7] flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#22A829]" />
                <h2 className="text-base font-semibold text-[#1d1d1f]">
                  Cart
                  {totalItems > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center bg-[#22A829] text-white text-xs font-bold rounded-full w-5 h-5">
                      {totalItems}
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-[#22A829] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <ShoppingBag size={48} className="text-[#d2d2d7]" />
                  <p className="text-[#1d1d1f] font-medium">Your cart is empty</p>
                  <p className="text-sm text-[#6e6e73]">Add some products to get started</p>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="mt-2 bg-[#22A829] hover:bg-[#1a9020] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="py-2">
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
              )}
            </div>

            {/* Footer summary */}
            {items.length > 0 && (
              <div className="px-6 pb-6 pt-4 border-t border-[#d2d2d7] flex-shrink-0">
                <CartSummary
                  totalPrice={totalPrice}
                  itemCount={totalItems}
                  compact
                  onCheckout={handleCheckout}
                />
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
