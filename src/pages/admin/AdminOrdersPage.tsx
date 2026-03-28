import React, { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Search, Filter, Eye, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { blink } from '../../lib/blink'
import type { Order, OrderItem } from '../../types'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

export default function AdminOrdersPage() {
  const { isAdmin, isLoading } = useApp()
  const [orders, setOrders] = useState<Order[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) loadOrders()
  }, [isAdmin])

  async function loadOrders() {
    setIsDataLoading(true)
    try {
      const data = await blink.db.orders.list({ orderBy: { createdAt: 'desc' }, limit: 200 })
      setOrders(data.map(o => {
        const ord = o as Record<string, unknown>
        return {
          ...ord,
          shippingAddress: typeof ord.shippingAddress === 'string' ? JSON.parse(ord.shippingAddress as string || '{}') : ord.shippingAddress || {},
          items: typeof ord.items === 'string' ? JSON.parse(ord.items as string || '[]') : ord.items || [],
        } as Order
      }))
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId)
    try {
      await blink.db.orders.update(orderId, { status, updatedAt: new Date().toISOString() })
      toast.success(`Order status updated to ${status}`)
      await loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: status as Order['status'] } : null)
      }
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !search.trim() || o.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  if (isLoading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!isAdmin) return null

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Orders</h1>
            <p className="text-muted-foreground text-sm">{orders.length} total orders · Revenue: ${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', ...STATUS_OPTIONS].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${statusFilter === status ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Orders List */}
          <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl overflow-hidden">
            {isDataLoading ? (
              <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Items</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(order => (
                      <tr key={order.id} className={`hover:bg-muted/20 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelectedOrder(order)}>
                        <td className="p-4 font-mono text-xs">{order.id.slice(6, 20)}...</td>
                        <td className="p-4 text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-muted-foreground text-xs">{order.items?.length || 0} items</td>
                        <td className="p-4 text-xs">{order.paymentMethod === 'vodafone_cash' ? '📱 VF Cash' : '💳 Card'}</td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); handleUpdateStatus(order.id, e.target.value) }}
                            disabled={updatingStatus === order.id}
                            className={`text-xs px-2 py-1 rounded-lg border border-transparent font-medium cursor-pointer ${STATUS_COLORS[order.status] || 'bg-muted'}`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-right font-bold text-primary">${order.total?.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedOrder(order === selectedOrder ? null : order) }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Detail Panel */}
          {selectedOrder && (
            <div className="w-80 flex-shrink-0 bg-card border border-border rounded-2xl p-5 animate-slide-in-right sticky top-24 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Order ID</p>
                  <p className="font-mono text-xs break-all">{selectedOrder.id}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                    <p className="font-bold text-primary">${selectedOrder.total?.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Ship to:</p>
                  <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-0.5">
                    <p className="font-medium">{selectedOrder.shippingAddress?.fullName || '—'}</p>
                    <p className="text-muted-foreground">{selectedOrder.shippingAddress?.phone || '—'}</p>
                    <p className="text-muted-foreground">{selectedOrder.shippingAddress?.street || '—'}</p>
                    <p className="text-muted-foreground">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Items ({selectedOrder.items?.length || 0})</p>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item: OrderItem, i: number) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.name} {item.size && `(${item.size})`} ×{item.quantity}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{selectedOrder.shippingCost === 0 ? 'FREE' : `$${selectedOrder.shippingCost?.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Payment: {selectedOrder.paymentMethod === 'vodafone_cash' ? `Vodafone Cash (${selectedOrder.vodafonePhone || '—'})` : 'Credit/Debit Card'}
                </div>

                {/* Update Status */}
                <div>
                  <p className="text-xs font-medium mb-1.5">Update Status</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STATUS_OPTIONS.map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status || updatingStatus === selectedOrder.id}
                        className={`text-xs py-1.5 px-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${selectedOrder.status === status ? 'bg-primary text-primary-foreground' : 'border border-border hover:border-primary'}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
