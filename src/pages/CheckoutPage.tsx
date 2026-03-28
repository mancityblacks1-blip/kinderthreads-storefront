import React, { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { CreditCard, Phone, Shield, Check, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { blink } from '../lib/blink'
import toast from 'react-hot-toast'

type PaymentMethod = 'stripe' | 'vodafone_cash'

interface ShippingForm {
  fullName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

export default function CheckoutPage() {
  const { cart, user, profile, isAuthenticated } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
  const [vodafonePhone, setVodafonePhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false)

  const [form, setForm] = useState<ShippingForm>({
    fullName: profile?.displayName || '',
    email: (user?.email as string) || '',
    phone: profile?.phone || '',
    street: '',
    city: '',
    state: '',
    country: 'Egypt',
    zipCode: '',
  })

  const subtotal = cart.subtotal
  const shippingCost = subtotal >= 75 ? 0 : 9.99
  const total = subtotal + shippingCost

  if (!isAuthenticated) {
    navigate({ to: '/cart' })
    return null
  }

  if (cart.items.length === 0) {
    navigate({ to: '/cart' })
    return null
  }

  const handleFormChange = (field: keyof ShippingForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    const required = ['fullName', 'email', 'phone', 'street', 'city', 'country'] as const
    for (const field of required) {
      if (!form[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    if (!form.email.includes('@')) { toast.error('Please enter a valid email'); return false }
    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateStep1()) { setStep(1); return }
    if (paymentMethod === 'vodafone_cash' && !vodafonePhone.trim()) {
      toast.error('Please enter your Vodafone Cash number')
      return
    }

    setIsProcessing(true)
    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2)}`
      const orderItems = cart.items.map(item => ({
        productId: item.productId,
        name: item.product?.name || 'Product',
        price: item.product?.price || 0,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
        image: item.product?.images?.[0] || null,
      }))

      const shippingAddress = {
        fullName: form.fullName,
        phone: form.phone,
        street: form.street,
        city: form.city,
        state: form.state,
        country: form.country,
        zipCode: form.zipCode,
      }

      await blink.db.orders.create({
        id: orderId,
        userId: user?.id as string,
        status: paymentMethod === 'vodafone_cash' ? 'pending' : 'processing',
        paymentMethod,
        paymentStatus: paymentMethod === 'vodafone_cash' ? 'pending' : 'paid',
        subtotal,
        shippingCost,
        discount: 0,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify(orderItems),
        vodafonePhone: paymentMethod === 'vodafone_cash' ? vodafonePhone : null,
        notes: form.email,
      })

      if (paymentMethod === 'stripe') {
        // Simulate Stripe checkout - in production, this would redirect to Stripe
        toast.success('Redirecting to secure payment...', { duration: 2000 })
        await new Promise(r => setTimeout(r, 1500))
        await cart.clearCart()
        navigate({ to: '/order-confirmation', search: { orderId } })
      } else {
        // Vodafone Cash flow
        await cart.clearCart()
        navigate({ to: '/order-confirmation', search: { orderId, method: 'vodafone_cash' } })
      }
    } catch (err) {
      console.error('Order placement error:', err)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const steps = ['Shipping', 'Payment', 'Review']

  return (
    <div className="min-h-screen pt-20 pb-16 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => { if (i + 1 < step) setStep(i + 1 as 1 | 2 | 3) }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > i + 1 ? 'bg-green-500 text-white' :
                  step === i + 1 ? 'bg-primary text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step > i + 1 ? <Check size={14} /> : i + 1}
                </div>
                <span className={`font-medium text-sm hidden sm:block ${step === i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 mx-3 max-w-16 sm:max-w-24 ${step > i + 1 ? 'bg-green-500' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Shipping */}
            <div className={`bg-card border border-border rounded-2xl overflow-hidden ${step !== 1 ? 'opacity-60' : ''}`}>
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary rounded-full text-white text-xs flex items-center justify-center font-bold">1</span>
                  Shipping Information
                </h2>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline">Edit</button>
                )}
              </div>
              {step === 1 && (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <input type="text" value={form.fullName} onChange={e => handleFormChange('fullName', e.target.value)}
                      placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)}
                      placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone *</label>
                    <input type="tel" value={form.phone} onChange={e => handleFormChange('phone', e.target.value)}
                      placeholder="+20 100 000 0000" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Street Address *</label>
                    <input type="text" value={form.street} onChange={e => handleFormChange('street', e.target.value)}
                      placeholder="123 Main St, Apt 4" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City *</label>
                    <input type="text" value={form.city} onChange={e => handleFormChange('city', e.target.value)}
                      placeholder="Cairo" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">State / Governorate</label>
                    <input type="text" value={form.state} onChange={e => handleFormChange('state', e.target.value)}
                      placeholder="Cairo Governorate" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Country *</label>
                    <select value={form.country} onChange={e => handleFormChange('country', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="Egypt">Egypt</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="UAE">UAE</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Postal Code</label>
                    <input type="text" value={form.zipCode} onChange={e => handleFormChange('zipCode', e.target.value)}
                      placeholder="12345" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="sm:col-span-2">
                    <button onClick={() => { if (validateStep1()) setStep(2) }} className="btn-primary w-full py-3.5 rounded-xl font-semibold">
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-card border border-border rounded-2xl overflow-hidden ${step !== 2 ? 'opacity-60' : ''}`}>
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary rounded-full text-white text-xs flex items-center justify-center font-bold">2</span>
                  Payment Method
                </h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="text-xs text-primary hover:underline">Edit</button>
                )}
              </div>
              {step === 2 && (
                <div className="p-5 space-y-4">
                  {/* Payment Options */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                      <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'stripe' ? 'border-primary' : 'border-muted-foreground'}`}>
                        {paymentMethod === 'stripe' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                      </div>
                      <CreditCard size={20} className="text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, and more</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">VISA</div>
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">MC</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'vodafone_cash' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                      <input type="radio" name="payment" value="vodafone_cash" checked={paymentMethod === 'vodafone_cash'} onChange={() => setPaymentMethod('vodafone_cash')} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'vodafone_cash' ? 'border-primary' : 'border-muted-foreground'}`}>
                        {paymentMethod === 'vodafone_cash' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                      </div>
                      <Phone size={20} className="text-red-500" />
                      <div className="flex-1">
                        <p className="font-semibold">Vodafone Cash</p>
                        <p className="text-xs text-muted-foreground">Pay with your Vodafone Cash wallet</p>
                      </div>
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">VF Cash</div>
                    </label>
                  </div>

                  {paymentMethod === 'stripe' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm">
                      <p className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium mb-1">
                        <Lock size={14} /> Secure Payment via Stripe
                      </p>
                      <p className="text-blue-600 dark:text-blue-500 text-xs">
                        You will be redirected to Stripe's secure payment page to complete your purchase. Your card details are never stored on our servers.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'vodafone_cash' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Your Vodafone Cash Number *</label>
                        <input
                          type="tel"
                          value={vodafonePhone}
                          onChange={e => setVodafonePhone(e.target.value)}
                          placeholder="01X XXX XXXX"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm">
                        <p className="font-medium text-red-700 dark:text-red-400 mb-2">How to pay with Vodafone Cash:</p>
                        <ol className="text-xs text-red-600 dark:text-red-500 space-y-1 list-decimal pl-4">
                          <li>Enter your Vodafone Cash number above</li>
                          <li>Place your order - we'll send you a payment request</li>
                          <li>Check your Vodafone Cash app or dial *9# to approve</li>
                          <li>Your order will be confirmed once payment is received</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  <button onClick={() => setStep(3)} className="btn-primary w-full py-3.5 rounded-xl font-semibold">
                    Review Order
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-card border border-border rounded-2xl overflow-hidden animate-fade-in">
                <div className="p-5 border-b border-border">
                  <h2 className="font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary rounded-full text-white text-xs flex items-center justify-center font-bold">3</span>
                    Review & Confirm
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  {/* Summary cards */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">Shipping to:</p>
                      <p className="font-medium text-sm">{form.fullName}</p>
                      <p className="text-sm text-muted-foreground">{form.street}</p>
                      <p className="text-sm text-muted-foreground">{form.city}, {form.country}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">Payment via:</p>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {paymentMethod === 'stripe' ? <><CreditCard size={14} /> Card (Stripe)</> : <><Phone size={14} /> Vodafone Cash</>}
                      </p>
                      {paymentMethod === 'vodafone_cash' && <p className="text-sm text-muted-foreground">{vodafonePhone}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                    <Shield size={13} className="text-primary" />
                    Your order is protected by our 30-day return policy
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="btn-primary w-full py-4 rounded-xl font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><Lock size={16} /> Place Order — ${total.toFixed(2)}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24">
              <button
                className="w-full p-5 flex items-center justify-between font-semibold lg:cursor-default"
                onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
              >
                <span>Order Summary ({cart.itemCount} items)</span>
                <span className="lg:hidden">{orderSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
              </button>

              <div className={`${orderSummaryOpen ? 'block' : 'hidden lg:block'} border-t border-border`}>
                <div className="p-5 space-y-3 max-h-60 overflow-y-auto">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-lg">👕</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{item.size && `Size: ${item.size}`} × {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold flex-shrink-0">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-border pt-2">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
