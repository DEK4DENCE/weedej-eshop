"use client"

import type { ReactNode } from "react"
import { Truck, MapPin, Package } from "lucide-react"

export type DeliveryMethod =
  | "DPD_HOME"
  | "DPD_PICKUP"
  | "ZASILKOVNA_HOME"
  | "ZASILKOVNA_PICKUP"

interface Props {
  selected: DeliveryMethod | null
  onSelect: (method: DeliveryMethod) => void
  subtotal: number
  className?: string
}

interface MethodCard {
  method: DeliveryMethod
  carrier: string
  name: string
  price: number
  icon: ReactNode
  deliveryTime: string
  isHomeDelivery: boolean
}

const FREE_SHIPPING_THRESHOLD = 1500

const METHODS: MethodCard[] = [
  {
    method: "DPD_HOME",
    carrier: "DPD",
    name: "Doručení na adresu",
    price: 99,
    icon: <Truck className="h-5 w-5" />,
    deliveryTime: "2–3 pracovní dny",
    isHomeDelivery: true,
  },
  {
    method: "DPD_PICKUP",
    carrier: "DPD",
    name: "Výdejní místo",
    price: 99,
    icon: <MapPin className="h-5 w-5" />,
    deliveryTime: "2–3 pracovní dny",
    isHomeDelivery: false,
  },
  {
    method: "ZASILKOVNA_HOME",
    carrier: "Zásilkovna",
    name: "Doručení na adresu",
    price: 99,
    icon: <Truck className="h-5 w-5" />,
    deliveryTime: "2–3 pracovní dny",
    isHomeDelivery: true,
  },
  {
    method: "ZASILKOVNA_PICKUP",
    carrier: "Zásilkovna",
    name: "Výdejní místo / Z-BOX",
    price: 99,
    icon: <Package className="h-5 w-5" />,
    deliveryTime: "2–3 pracovní dny",
    isHomeDelivery: false,
  },
]

export function DeliveryCarrierSelector({ selected, onSelect, subtotal, className }: Props) {
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {METHODS.map((card) => {
          const free = isFreeShipping && card.isHomeDelivery
          const isSelected = selected === card.method

          return (
            <button
              key={card.method}
              type="button"
              onClick={() => onSelect(card.method)}
              className={[
                "relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                "hover:border-[#2E7D32] hover:bg-[#2E7D32]/5",
                isSelected
                  ? "border-[#2E7D32] bg-[#2E7D32]/5 shadow-sm"
                  : "border-gray-200 bg-white",
              ].join(" ")}
            >
              {/* Carrier icon */}
              <span
                className={[
                  "mt-0.5 shrink-0 rounded-lg p-2",
                  isSelected
                    ? "bg-[#2E7D32] text-white"
                    : "bg-gray-100 text-gray-600",
                ].join(" ")}
              >
                {card.icon}
              </span>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1d1d1f]">{card.carrier}</span>
                  {free && (
                    <span className="rounded-full bg-[#2E7D32] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Zdarma
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{card.name}</p>
                <p className="mt-1 text-xs text-gray-400">{card.deliveryTime}</p>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                {free ? (
                  <span className="text-sm font-semibold text-[#2E7D32]">Zdarma</span>
                ) : (
                  <span className="text-sm font-semibold text-[#1d1d1f]">{card.price} Kč</span>
                )}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E7D32]">
                  <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none">
                    <path
                      d="M1 4l2.5 2.5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
