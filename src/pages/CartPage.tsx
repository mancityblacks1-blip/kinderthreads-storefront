import React, { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { blink } from '../lib/blink'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, isAuthenticated } = useApp()
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const SHIPPING_THRESHOLD = 75
  const SHIPPING_COST = 9.99

  const subtotal = cart.subtotal
  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const discount = appliedPromo
    ? appliedPromo.type === 'percentage'
      ? (subtotal * appliedPromo.discount) / 100
      : Math.min(appliedPromo.discount, subtotal)
    : 0
  const total = Math.max(0, subtotal - discount + shippingCost)

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setIsApplyingPromo(true)
    setPromoError('')
    try {
      const codes = await blink.db.promoCodes.list({ where: { code: promoCode.trim().toUpperCase(), isActive: '1' }, limit: 1 })
      if (codes.length === 0) {
        setPromoError('Invalid or expired promo code')
      } else {
        const code = codes[0] as Record<string, unknown>
        if ((code.minOrder as number) > 0 && subtotal < (code.minOrder as number)) {
          setPromoError(`Minimum order of $${code.minOrder} required`)
        } else {
          setAppliedPromo({
            code: code.code as string,
            discount: code.discountValue as number,
            type: code.discountType as 'percentage' | 'fixed',
          })
          toast.success(`Promo code applied! ${code.discountType === 'percentage' ? `${code.discountValue}% off` : `$${code.discountValue} off`}`)
        }
      }
    } catch {
      setPromoError('Failed to apply promo code')
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      blink.auth.login(window.location.href)
      return
    }
    navigate({ to: '/checkout' })
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="text-7xl mb-6">🛒</div>
          <h1 className="font-display text-3xl font-bold mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet. Let's fix that!</p>
          <Link to="/products" className="btn-primary px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2">
            <ShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart ({cart.itemCount})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4 animate-fade-in">
                <Link to="/products/$slug" params={{ slug: item.product?.slug || '' }}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to="/products/$slug" params={{ slug: item.product?.slug || '' }}>
                        <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">{item.product?.name}</h3>
                      </Link>
                      <div className="flex gap-2 mt-1">
                        {item.size && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Size: {item.size}</span>}
                        {item.color && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.color}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => cart.removeItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-muted transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1.5 font-semibold text-sm border-x border-border">{item.quantity}</span>
                      <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-muted transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">${item.product?.price?.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link to="/products" className="flex items-center gap-2 text-primary font-medium text-sm hover:underline mt-4">
              <ArrowRight size={14} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 space-y-4">
              <h2 className="font-display text-xl font-bold">Order Summary</h2>

              {/* Promo Code */}
              <div>
                {!appliedPromo ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                        placeholder="Promo code"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="btn-primary px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        <Tag size={14} />
                      </button>
                    </div>
                    {promoError && <p className="text-xs text-destructive mt-1">{promoError}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Try: WELCOME20, BABY15</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
                    <span className="text-sm font-medium text-primary flex items-center gap-1.5">
                      <Tag size={13} /> {appliedPromo.code}
                    </span>
                    <button onClick={() => setAppliedPromo(null)} className="text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>${shippingCost.toFixed(2)}</span>
                  )}
                </div>
                {subtotal < SHIPPING_THRESHOLD && subtotal > 0 && (
                  <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">
                    Add ${(SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn-primary w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-base"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">🔒 Secure checkout powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
