import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Package, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { blink } from '../lib/blink'
import type { Order } from '../types'

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading } = useApp()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      blink.auth.login(window.location.href)
      return
    }
    if (user) {
      blink.db.orders.list({ where: { userId: user.id as string }, orderBy: { createdAt: 'desc' }, limit: 50 })
        .then(data => {
          setOrders(data.map(o => {
            const ord = o as Record<string, unknown>
            return {
              ...ord,
              shippingAddress: typeof ord.shippingAddress === 'string' ? JSON.parse(ord.shippingAddress as string || '{}') : ord.shippingAddress || {},
              items: typeof ord.items === 'string' ? JSON.parse(ord.items as string || '[]') : ord.items || [],
            } as Order
          }))
        })
        .finally(() => setOrdersLoading(false))
    }
  }, [user, isAuthenticated, isLoading])

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/account" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-2xl font-bold">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-display text-2xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">When you place your first order, it will appear here.</p>
            <Link to="/products" className="btn-primary px-6 py-3 rounded-xl font-medium inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm font-bold">{order.id.slice(0, 20)}...</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="font-bold text-primary text-lg">${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{order.items?.length || 0} items</span>
                  <span>·</span>
                  <span>Payment: {order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'Credit/Debit Card'}</span>
                  <span>·</span>
                  <span>Payment Status: {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}</span>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="text-xs bg-muted rounded-lg px-2 py-1">
                          {item.name} ×{item.quantity}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs bg-muted rounded-lg px-2 py-1 text-muted-foreground">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
