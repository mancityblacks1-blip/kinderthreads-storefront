import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { User, Package, Heart, Settings, LogOut, Edit2, Check, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { blink } from '../lib/blink'
import type { Order } from '../types'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const { user, profile, isAuthenticated, isLoading } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.displayName || '')
  const [phone, setPhone] = useState(profile?.phone || '')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      blink.auth.login(window.location.href)
    }
  }, [isLoading, isAuthenticated])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      setOrdersLoading(true)
      blink.db.orders.list({ where: { userId: user.id as string }, orderBy: { createdAt: 'desc' }, limit: 20 })
        .then(data => {
          setOrders(data.map(o => {
            const ord = o as Record<string, unknown>
            return {
              ...ord,
              shippingAddress: typeof ord.shippingAddress === 'string' ? JSON.parse(ord.shippingAddress as string || '{}') : ord.shippingAddress,
              items: typeof ord.items === 'string' ? JSON.parse(ord.items as string || '[]') : ord.items,
            } as Order
          }))
        })
        .finally(() => setOrdersLoading(false))
    }
  }, [activeTab, user])

  const handleSaveProfile = async () => {
    if (!profile) return
    try {
      await blink.db.userProfiles.update(profile.id, { displayName, phone })
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
            {profile?.displayName?.[0]?.toUpperCase() || '👤'}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{profile?.displayName || 'My Account'}</h1>
            <p className="text-muted-foreground text-sm">{user?.email as string}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8">
          {[
            { id: 'profile', label: 'Profile', icon: <User size={15} /> },
            { id: 'orders', label: 'My Orders', icon: <Package size={15} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-md space-y-6 animate-fade-in">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold">Personal Information</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Edit2 size={13} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} className="flex items-center gap-1 text-sm text-green-600 hover:underline">
                      <Check size={13} /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-sm text-destructive hover:underline">
                      <X size={13} /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Display Name</label>
                  {isEditing ? (
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  ) : (
                    <p className="text-sm font-medium">{profile?.displayName || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Email</label>
                  <p className="text-sm font-medium">{user?.email as string}</p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Phone</label>
                  {isEditing ? (
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+20 100 000 0000"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  ) : (
                    <p className="text-sm font-medium">{profile?.phone || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Account Type</label>
                  <p className="text-sm font-medium capitalize">{profile?.role || 'Customer'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => { blink.auth.signOut(); navigate({ to: '/' }) }}
              className="flex items-center gap-2 text-destructive hover:underline text-sm font-medium"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="font-display text-xl font-bold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">When you place your first order, it will appear here.</p>
                <Link to="/products" className="btn-primary px-6 py-3 rounded-xl font-medium inline-block">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm font-bold">{order.id.slice(0, 20)}...</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="font-bold text-primary">${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {' · '}{order.items?.length || 0} items
                      {' · '}Payment: {order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'Card'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
