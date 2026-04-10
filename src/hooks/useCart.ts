'use client'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cartStore'
import { useState, useEffect, useCallback } from 'react'

interface AddItemPayload {
  variantId: string
  productId: string
  quantity?: number
  productName: string
  variantName: string
  price: number
  imageUrl?: string
}

export function useCart() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const { data: session } = useSession()
  const guestCart = useCartStore()
  const serverItems = useCartStore((s) => s.serverItems)
  const setServerItems = useCartStore((s) => s.setServerItems)
  const toggleSidebar = useCartStore((s) => s.toggleSidebar)
  const closeSidebar = useCartStore((s) => s.closeSidebar)
  const sidebarOpen = useCartStore((s) => s.sidebarOpen)

  const fetchCart = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      setServerItems(data?.items ?? [])
    } catch {
      // ignore fetch errors silently
    }
  }, [session?.user, setServerItems])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Merge guest cart into DB on login
  useEffect(() => {
    if (session?.user && guestCart.items.length > 0) {
      const merge = async () => {
        for (const item of guestCart.items) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              variantId: item.variantId,
              productId: item.productId,
              quantity: item.quantity,
            }),
          })
        }
        guestCart.clearCart()
        await fetchCart()
      }
      merge()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user])

  const addItem = async (item: AddItemPayload) => {
    if (session?.user) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: item.variantId,
          productId: item.productId,
          quantity: item.quantity ?? 1,
        }),
      })
      await fetchCart()
    } else {
      guestCart.addItem({
        id: item.variantId,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        price: item.price,
        imageUrl: item.imageUrl ?? '',
        quantity: item.quantity ?? 1,
      })
    }
  }

  const updateQty = async (itemId: string, variantId: string, quantity: number) => {
    if (session?.user) {
      await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      await fetchCart()
    } else {
      guestCart.updateQty(variantId, quantity)
    }
  }

  const removeItem = async (itemId: string, variantId: string) => {
    if (session?.user) {
      await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      await fetchCart()
    } else {
      guestCart.removeItem(variantId)
    }
  }

  const items = session?.user ? serverItems : guestCart.items

  const actualTotalItems = items.reduce((sum, i: any) => sum + (i.quantity || 0), 0)
  const totalItems = hydrated ? actualTotalItems : 0

  const totalPrice = items.reduce((sum, i: any) => {
    const price = i.variant?.price ?? i.price ?? 0
    return sum + parseFloat(String(price)) * i.quantity
  }, 0)

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    updateQty,
    removeItem,
    clearCart: guestCart.clearCart,
    isLoading: false,
    refetch: fetchCart,
    toggleSidebar,
    closeSidebar,
    sidebarOpen,
  }
}
