'use client'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cartStore'
import { useState, useEffect, useCallback, useRef } from 'react'

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
    } catch (err) {
      console.error('[Cart] Failed to fetch cart:', err)
    }
  }, [session?.user, setServerItems])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Track whether we have already attempted a merge for this session to avoid
  // re-running on every render after items is emptied by clearCart().
  const mergeAttemptedRef = useRef(false)

  // Merge guest cart into DB on login — properly awaited with error handling (H8)
  useEffect(() => {
    if (session?.user && guestCart.items.length > 0 && !mergeAttemptedRef.current) {
      mergeAttemptedRef.current = true
      const merge = async () => {
        const failed: string[] = []
        for (const item of guestCart.items) {
          try {
            const res = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                variantId: item.variantId,
                productId: item.productId,
                quantity: item.quantity,
              }),
            })
            if (!res.ok) {
              failed.push(item.productName)
            }
          } catch {
            failed.push(item.productName)
          }
        }
        guestCart.clearCart()
        await fetchCart()
        if (failed.length > 0) {
          console.error('[Cart] Some items failed to merge:', failed.join(', '))
          // Surface to user via a custom DOM event so any toast listener can pick it up
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('cart:merge-error', {
                detail: { items: failed },
              })
            )
          }
        }
      }
      merge().catch((err) => {
        console.error('[Cart] Merge failed unexpectedly:', err)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart:merge-error', { detail: { items: [] } }))
        }
      })
    }
    // Reset merge flag when session is cleared (user logs out)
    if (!session?.user) {
      mergeAttemptedRef.current = false
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
      // PERF-3: Optimistic update — reflect change immediately, no full refetch
      setServerItems(serverItems.map((i: any) =>
        i.id === itemId ? { ...i, quantity } : i
      ))
      fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      }).then((res) => {
        if (!res.ok) {
          // Re-sync on any server error (including 409 stock exceeded)
          fetchCart()
        }
      }).catch((err) => {
        console.error('[Cart] updateQty failed:', err)
        fetchCart()  // re-sync on error
      })
    } else {
      guestCart.updateQty(variantId, quantity)
    }
  }

  const removeItem = async (itemId: string, variantId: string) => {
    if (session?.user) {
      // PERF-3: Optimistic update — remove immediately, no full refetch
      setServerItems(serverItems.filter((i: any) => i.id !== itemId))
      fetch(`/api/cart/${itemId}`, { method: 'DELETE' }).catch((err) => {
        console.error('[Cart] removeItem failed:', err)
        fetchCart()  // re-sync on error
      })
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
