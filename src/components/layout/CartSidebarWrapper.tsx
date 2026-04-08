"use client"

import { useCartStore } from "@/store/cartStore"
import CartSidebar from "@/components/layout/CartSidebar"

export function CartSidebarWrapper() {
  const sidebarOpen = useCartStore((s) => s.sidebarOpen)
  const closeSidebar = useCartStore((s) => s.closeSidebar)

  return <CartSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
}
