'use client'
import { useRouter } from 'next/navigation'
import { Lock, Truck } from 'lucide-react'

interface CartSummaryProps {
  totalPrice: number
  itemCount: number
  onCheckout?: () => void
  compact?: boolean
}

const FREE_SHIPPING_THRESHOLD = 1500

export default function CartSummary({ totalPrice, itemCount, onCheckout, compact = false }: CartSummaryProps) {
  const router = useRouter()
  const shippingFree = totalPrice >= FREE_SHIPPING_THRESHOLD
  const shipping = shippingFree ? 0 : 99
  const total = totalPrice + shipping

  const handleCheckout = () => {
    if (onCheckout) onCheckout()
    else router.push('/checkout')
  }

  return (
    <div className={`bg-[#F8F9FA] border border-[#DEE2E6] rounded-2xl p-5 ${compact ? '' : 'sticky top-24'}`}>
      <h2 className="text-sm font-semibold text-[#1d1d1f] mb-3">Order Summary</h2>

      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#6e6e73]">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        <span className="text-sm font-medium text-[#1d1d1f]">{totalPrice.toLocaleString('cs-CZ')} Kč</span>
      </div>

      <div className="flex items-start justify-between py-1.5 border-t border-[#DEE2E6]">
        <div className="flex-1">
          <span className="text-sm text-[#6e6e73]">Shipping</span>
          {!shippingFree && (
            <p className="text-xs text-[#aeaeb2] mt-0.5 flex items-center gap-1">
              <Truck size={11} />
              Doprava zdarma nad 1 500 Kč
            </p>
          )}
        </div>
        {shippingFree ? (
          <span className="text-sm font-medium text-[#2E7D32]">Free</span>
        ) : (
          <span className="text-sm font-medium text-[#1d1d1f]">{shipping} Kč</span>
        )}
      </div>

      <div className="flex items-center justify-between py-2.5 border-t border-[#DEE2E6] mt-1">
        <span className="text-base font-bold text-[#1d1d1f]">Total</span>
        <span className="text-lg font-bold text-[#b8860b] font-mono">{total.toLocaleString('cs-CZ')} Kč</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={itemCount === 0}
        className="w-full mt-3 bg-[#2E7D32] hover:bg-[#1a9020] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)] text-sm"
      >
        Proceed to Checkout
      </button>

      <p className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-[#aeaeb2]">
        <Lock size={11} />
        Secure payment via Stripe
      </p>
    </div>
  )
}
