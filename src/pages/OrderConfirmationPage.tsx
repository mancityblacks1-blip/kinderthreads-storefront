import React, { useEffect, useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { CheckCircle, Package, Phone, Clock, ShoppingBag } from 'lucide-react'
import { blink } from '../lib/blink'
import type { Order, OrderItem } from '../types'

export default function OrderConfirmationPage() {
  const search = useSearch({ from: '/order-confirmation' }) as Record<string, string>
  const orderId = search.orderId
  const method = search.method

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    async function loadOrder() {
      try {
        const orderData = await blink.db.orders.get(orderId)
        if (orderData) {
          const o = orderData as Record<string, unknown>
          setOrder({
            ...o,
            shippingAddress: typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress as string) : o.shippingAddress,
            items: typeof o.items === 'string' ? JSON.parse(o.items as string) : o.items,
          } as Order)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadOrder()
  }, [orderId])

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4">
      <div className="max-w-lg w-full animate-fade-in-up">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed! 🎉</h1>
          <p className="text-muted-foreground">
            {method === 'vodafone_cash'
              ? 'We\'ve received your order. Please complete payment via Vodafone Cash.'
              : 'Your order has been placed successfully. You\'ll receive a confirmation email shortly.'}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="p-5 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-mono font-bold text-sm">{orderId?.slice(0, 16)}...</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-bold text-primary text-lg">${order?.total?.toFixed(2) || '—'}</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Vodafone Cash Instructions */}
            {method === 'vodafone_cash' && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <h3 className="font-semibold flex items-center gap-2 text-red-700 dark:text-red-400 mb-3">
                  <Phone size={16} /> Vodafone Cash Payment Instructions
                </h3>
                <div className="space-y-2 text-sm text-red-600 dark:text-red-500">
                  <p>1. Open your Vodafone Cash app or dial <strong>*9#</strong></p>
                  <p>2. Select "Pay Bills" or check pending transactions</p>
                  <p>3. Find our payment request from <strong>KinderThreads</strong></p>
                  <p>4. Approve the payment of <strong>${order?.total?.toFixed(2)}</strong></p>
                  <p>5. Your order will be confirmed within 1-2 hours</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            {!isLoading && order?.items && order.items.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-3">Items in your order:</p>
                <div className="space-y-2">
                  {order.items.map((item: OrderItem, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} {item.size && `(${item.size})`} × {item.quantity}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="space-y-3">
              <p className="font-medium text-sm">What happens next:</p>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <p>We'll review your order and send you a confirmation email</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <p>Your order will be carefully packed and dispatched</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <p>You'll receive tracking information once shipped (3-5 business days)</p>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <Clock size={16} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Estimated Delivery</p>
                <p className="text-xs text-muted-foreground">3-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/orders" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-border hover:border-primary text-sm font-medium transition-colors">
            <Package size={16} /> Track My Order
          </Link>
          <Link to="/products" className="flex items-center justify-center gap-2 btn-primary py-3 px-4 rounded-xl text-sm font-medium">
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
