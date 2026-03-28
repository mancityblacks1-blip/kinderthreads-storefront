import { useState, useEffect, useCallback } from 'react'
import { blink } from '../lib/blink'
import type { CartItem, Product } from '../types'

interface CartItemWithProduct extends CartItem {
  product?: Product
}

export function useCart(userId: string | null | undefined) {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!userId) { setItems([]); return }
    setIsLoading(true)
    try {
      const cartItems = await blink.db.cartItems.list({ where: { userId } }) as CartItem[]
      if (cartItems.length === 0) { setItems([]); return }
      
      const productIds = [...new Set(cartItems.map(ci => ci.productId))]
      const productsRaw = await blink.db.products.list({ where: { isActive: '1' } })
      const productMap = new Map<string, Product>()
      for (const p of productsRaw) {
        const prod = p as Record<string, unknown>
        productMap.set(prod.id as string, {
          ...prod,
          images: JSON.parse((prod.images as string) || '[]'),
          sizes: JSON.parse((prod.sizes as string) || '[]'),
          colors: JSON.parse((prod.colors as string) || '[]'),
          tags: JSON.parse((prod.tags as string) || '[]'),
        } as Product)
      }

      const enriched = cartItems
        .filter(ci => productIds.includes(ci.productId))
        .map(ci => ({
          ...ci,
          product: productMap.get(ci.productId),
        }))
      setItems(enriched)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (productId: string, quantity = 1, size?: string, color?: string) => {
    if (!userId) {
      blink.auth.login(window.location.href)
      return
    }
    const existing = items.find(i => i.productId === productId && i.size === size && i.color === color)
    if (existing) {
      await blink.db.cartItems.update(existing.id, { quantity: existing.quantity + quantity })
    } else {
      await blink.db.cartItems.create({
        id: `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId,
        productId,
        quantity,
        size: size || null,
        color: color || null,
      })
    }
    await fetchCart()
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await blink.db.cartItems.delete(itemId)
    } else {
      await blink.db.cartItems.update(itemId, { quantity })
    }
    await fetchCart()
  }

  const removeItem = async (itemId: string) => {
    await blink.db.cartItems.delete(itemId)
    await fetchCart()
  }

  const clearCart = async () => {
    if (!userId) return
    const cartItems = await blink.db.cartItems.list({ where: { userId } })
    for (const item of cartItems) {
      await blink.db.cartItems.delete((item as CartItem).id)
    }
    setItems([])
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0)

  return { items, isLoading, addToCart, updateQuantity, removeItem, clearCart, itemCount, subtotal, refetch: fetchCart }
}
