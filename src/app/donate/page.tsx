'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AlertCircle, Heart, Home, Coffee, Bed, Users } from 'lucide-react'

const impactLevels = [
  { amount: 25, label: '$25', impact: 'Provides 10 meals', icon: Coffee, color: 'from-blue-500 to-blue-600' },
  { amount: 50, label: '$50', impact: 'Supports 1 day of shelter', icon: Home, color: 'from-green-500 to-green-600' },
  { amount: 100, label: '$100', impact: 'Covers 1 week of recovery support', icon: Heart, color: 'from-purple-500 to-purple-600' },
  { amount: 250, label: '$250', impact: 'Provides 1 month of peer counseling', icon: Users, color: 'from-orange-500 to-orange-600' },
  { amount: 500, label: '$500', impact: 'Sponsors 1 full recovery program bed', icon: Bed, color: 'from-red-500 to-red-600' },
]

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState('ONE_TIME')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'square'>('square')

  const stripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder')
  const squareConfigured = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT && 
    (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'sandbox' || process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production')

  const handleDonate = async () => {
    setError('')
    
    if (!email || !name) {
      setError('Please enter your name and email')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Validate name
    if (name.trim().length < 2) {
      setError('Please enter a valid name')
      return
    }

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount

    if (amount < 1) {
      setError('Amount must be at least $1')
      return
    }

    // Check if recurring donation is supported
    if (frequency !== 'ONE_TIME' && paymentMethod === 'square') {
      setError('Recurring donations not yet supported with Square. Please use one-time donation.')
      return
    }

    setLoading(true)

    try {
      const endpoint = paymentMethod === 'square' 
        ? '/api/donate/square' 
        : '/api/donate/checkout'

      console.log('Donation: Submitting to', endpoint, { amount, frequency, email, name, paymentMethod })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, frequency, email, name })
      })

      console.log('Donation: Response status', response.status)

      const data = await response.json()
      console.log('Donation: Response data', data)

      if (!response.ok) {
        const errorMessage = data.error || `Failed to create checkout session (${response.status})`
        console.error('Donation: Error response', errorMessage)
        setError(errorMessage)
        return
      }

      if (data.url) {
        console.log('Donation: Redirecting to', data.url)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'donation', {
            value: amount,
            currency: 'USD',
            transaction_id: data.donationId || '',
          })
        }
        window.location.href = data.url
      } else if (data.sessionId) {
        // For Stripe
        console.log('Donation: Stripe session created', data.sessionId)
        window.location.href = data.url
      } else {
        console.error('Donation: No URL or sessionId in response', data)
        setError('Failed to create payment session. Please try again.')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred. Please try again.'
      console.error('Donation: Exception caught', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-brand-purple to-brand-green text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Make an Impact Today</h1>
          <p className="text-lg sm:text-xl opacity-90 mb-4 sm:mb-6">Your donation directly transforms lives through recovery support, housing, and hope</p>
          <p className="text-sm sm:text-lg opacity-75">A Vision For You Recovery is a 501(c)(3) nonprofit - EIN: XX-XXXXXXX</p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {!stripeConfigured && (
            <div className="mb-6 sm:mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 flex gap-3 sm:gap-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1 text-sm sm:text-base">Demo Mode</h3>
                <p className="text-xs sm:text-sm text-yellow-800">
                  Stripe is not configured. Add your keys to enable live donations.
                </p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-lg shadow-xl p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Choose Your Impact</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Every donation directly transforms lives in our community</p>

            {squareConfigured && (
              <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => setPaymentMethod('square')}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition ${
                      paymentMethod === 'square'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    Square (Sandbox Test)
                  </button>
                  {stripeConfigured && (
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition ${
                        paymentMethod === 'stripe'
                          ? 'bg-brand-purple text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-purple'
                      }`}
                    >
                      Stripe
                    </button>
                  )}
                </div>
                {paymentMethod === 'square' && (
                  <p className="text-xs sm:text-sm text-blue-700 mt-2">
                    ✨ Sandbox mode - Use test card: 4532 0151 1283 0366
                  </p>
                )}
              </div>
            )}

            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Donation Frequency</label>
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => setFrequency('ONE_TIME')}
                  className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition ${
                    frequency === 'ONE_TIME'
                      ? 'bg-brand-purple text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-purple'
                  }`}
                >
                  One-Time
                </button>
                <button
                  onClick={() => setFrequency('MONTHLY')}
                  className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition relative ${
                    frequency === 'MONTHLY'
                      ? 'bg-brand-green text-brand-purple shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-green'
                  }`}
                >
                  Monthly
                  <span className="absolute -top-2 -right-1 sm:-right-2 bg-orange-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    2x Impact
                  </span>
                </button>
              </div>
              {frequency === 'MONTHLY' && (
                <p className="text-xs sm:text-sm text-brand-purple mt-2">
                  💚 Monthly giving provides sustainable support and helps us plan long-term programs
                </p>
              )}
            </div>

            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Impact Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {impactLevels.map(({ amount, label, impact, icon: Icon, color }) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                    }}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all transform active:scale-95 sm:hover:scale-105 ${
                      selectedAmount === amount && !customAmount
                        ? 'border-brand-purple bg-purple-50 shadow-lg'
                        : 'border-gray-300 bg-white hover:border-brand-green'
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{label}</p>
                    <p className="text-xs text-gray-600">{impact}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Or Enter Custom Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(0)
                  }}
                  placeholder="Enter amount"
                  min="1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent text-lg"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Your Information</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-green-50 rounded-lg p-6 mb-8 border-2 border-brand-green">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">Your Total Impact</p>
                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green mb-3">
                  ${(finalAmount || 0).toFixed(2)}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {finalAmount < 25 && 'Will provide meals and basic necessities for someone in recovery'}
                  {finalAmount >= 25 && finalAmount < 50 && 'Will fund 2 weeks of shelter and daily support services'}
                  {finalAmount >= 50 && finalAmount < 100 && 'Will provide job training and housing assistance for one client'}
                  {finalAmount >= 100 && finalAmount < 250 && 'Will fund a month of comprehensive recovery services including counseling'}
                  {finalAmount >= 250 && 'Will provide ongoing support, housing, and treatment for multiple clients in need'}
                </p>
                {frequency === 'MONTHLY' && (
                  <div className="mt-4 inline-block bg-brand-green/20 px-4 py-2 rounded-full">
                    <p className="text-sm font-semibold text-brand-purple">
                      💚 Annual Impact: ${((finalAmount || 0) * 12).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDonate}
              disabled={loading || !finalAmount || !name || !email}
              className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-brand-purple to-brand-green text-white rounded-xl font-bold text-lg sm:text-xl shadow-xl active:scale-95 sm:hover:shadow-2xl sm:hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Complete Donation${finalAmount > 0 ? ` - $${finalAmount.toFixed(2)}` : ''}`
              )}
            </button>

            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure payment powered by {paymentMethod === 'square' ? 'Square' : 'Stripe'}
              </p>
              <p className="text-xs text-gray-500">
                A Vision For You Recovery is a 501(c)(3) nonprofit. Your donation is tax-deductible.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Your Donations Change Lives</h2>
          <p className="text-xl text-gray-600 mb-12">See the real impact of your generosity</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-brand-purple mb-2">$25</p>
              <p className="text-gray-700 font-semibold mb-2">Daily Essentials</p>
              <p className="text-sm text-gray-600">Provides 10 nutritious meals and basic necessities</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Home className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-green-600 mb-2">$100</p>
              <p className="text-gray-700 font-semibold mb-2">Safe Housing</p>
              <p className="text-sm text-gray-600">Funds 1 week of shelter and intensive support services</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-purple-600 mb-2">$500</p>
              <p className="text-gray-700 font-semibold mb-2">Full Recovery Program</p>
              <p className="text-sm text-gray-600">Provides 1 month of comprehensive treatment and housing</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-white font-bold mb-4">A Vision For You</h4>
              <p className="text-sm">Supporting recovery and transformation for those facing homelessness, addiction, and mental health challenges.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/programs" className="hover:text-white">Programs</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/donate" className="hover:text-white">Donate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-white">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <p className="text-sm mb-2"><strong>1675 Story Ave, Louisville, KY 40206</strong></p>
              <p className="text-sm mb-2"><a href="tel:+15027496344" className="hover:text-white">(502) 749-6344</a></p>
              <p className="text-sm"><a href="mailto:info@avisionforyourecovery.org" className="hover:text-white">info@avisionforyourecovery.org</a></p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2025 A Vision For You Recovery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
