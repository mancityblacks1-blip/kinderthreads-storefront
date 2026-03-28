import React, { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Package, ShoppingBag, DollarSign, Users, TrendingUp, Plus, Eye } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { blink } from '../../lib/blink'

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  pendingOrders: number
}

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useApp()
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, pendingOrders: 0 })
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!isAdmin) return

    async function loadData() {
      try {
        const [orders, products] = await Promise.all([
          blink.db.orders.list({ orderBy: { createdAt: 'desc' }, limit: 50 }),
          blink.db.products.list({ limit: 1000 }),
        ])

        const totalRevenue = orders.reduce((sum, o) => sum + ((o as Record<string, unknown>).total as number || 0), 0)
        const pendingOrders = orders.filter(o => (o as Record<string, unknown>).status === 'pending').length

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          pendingOrders,
        })
        setRecentOrders(orders.slice(0, 10) as Record<string, unknown>[])
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [isAdmin, isLoading])

  if (isLoading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access the admin area.</p>
          <Link to="/" className="btn-primary px-6 py-3 rounded-xl font-medium inline-block">Go Home</Link>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag size={20} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: <DollarSign size={20} />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
    { label: 'Products', value: stats.totalProducts, icon: <Package size={20} />, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <TrendingUp size={20} />, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your KinderThreads store</p>
          </div>
          <Link to="/admin/products" className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link to="/admin/products" className="bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Manage Products</h3>
                <p className="text-sm text-muted-foreground">Add, edit, or remove products</p>
              </div>
              <Package size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
          <Link to="/admin/orders" className="bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">View Orders</h3>
                <p className="text-sm text-muted-foreground">Process and track all orders</p>
              </div>
              <ShoppingBag size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              <Eye size={13} /> View All
            </Link>
          </div>
          {isLoadingData ? (
            <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map(order => (
                    <tr key={order.id as string} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-mono text-xs">{(order.id as string).slice(0, 16)}...</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(order.createdAt as string).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status as string] || 'bg-muted text-muted-foreground'}`}>
                          {(order.status as string).charAt(0).toUpperCase() + (order.status as string).slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground capitalize">
                        {order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'Card'}
                      </td>
                      <td className="p-4 text-right font-bold text-primary">${(order.total as number)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
