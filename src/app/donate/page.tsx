'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

const amounts = [1, 20, 50, 100, 250, 500]

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState('ONE_TIME')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [donated, setDonated] = useState(false)

  const stripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder')

  const handleDonate = async () => {
    setError('')
    
    if (!email || !name) {
      setError('Please enter your name and email')
      return
    }

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount

    if (amount < 1) {
      setError('Amount must be at least $1')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/donate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, frequency, email, name })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout session')
        return
      }

      // Redirect to Stripe checkout
      if (data.url) {
        // Track donation event in Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'donation', {
            value: amount,
            currency: 'USD',
            transaction_id: data.donationId || '',
          })
        }
        window.location.href = data.url
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">Vision For You</Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/programs" className="text-gray-700 hover:text-blue-600 font-medium">Programs</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium">Blog</Link>
            <Link href="/donate" className="text-gray-700 hover:text-blue-600 font-medium">Donate</Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-r from-blue-700 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Make a Donation</h1>
          <p className="text-xl opacity-95">Your generosity directly supports lives transformed through recovery</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg shadow-lg p-10">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Choose Your Impact</h2>
            <p className="text-gray-600 mb-8">Your donation helps us provide housing, treatment, meals, and employment support.</p>

            {!stripeConfigured && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Stripe Not Configured</p>
                  <p>Donations are not yet enabled. Visit Admin Dashboard to set up Stripe.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Donation Amount Selection */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">Select Amount</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount)
                        setCustomAmount('')
                      }}
                      className={`py-3 px-4 rounded-lg font-bold text-center transition ${
                        selectedAmount === amount && !customAmount
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-blue-600'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                
                <label className="block text-sm text-gray-600 mb-2">Or enter custom amount</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 bg-gray-200 rounded-l-lg text-gray-600">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(0)
                    }}
                    placeholder="Enter amount"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Frequency Selection */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">Donation Type</label>
                <div className="space-y-3">
                  {[
                    { value: 'ONE_TIME', label: 'One-Time Donation', desc: 'Give once and make an immediate impact' },
                    { value: 'MONTHLY', label: 'Monthly Support', desc: 'Sustain our programs with recurring support' },
                    { value: 'YEARLY', label: 'Annual Support', desc: 'Provide yearly impact for long-term stability' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition hover:border-blue-600" style={{borderColor: frequency === option.value ? 'rgb(37, 99, 235)' : 'rgb(209, 213, 219)'}}>
                      <input
                        type="radio"
                        name="frequency"
                        value={option.value}
                        checked={frequency === option.value}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <p className="font-bold text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Your Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Impact Statement */}
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 text-center">
                <p className="text-gray-900 font-bold mb-2">Your Impact</p>
                <p className="text-3xl font-bold text-green-600">${(finalAmount || 0).toFixed(2)}</p>
                <p className="text-gray-700 mt-2">provides {finalAmount < 25 ? 'meals for clients in recovery' : finalAmount < 100 ? '2 weeks of shelter and support' : finalAmount < 500 ? 'a month of comprehensive recovery services' : 'ongoing support for multiple clients'}</p>
              </div>

              {/* Donation Button */}
              <button
                onClick={handleDonate}
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Donate ${finalAmount > 0 ? `$${finalAmount.toFixed(2)}` : 'Now'}`}
              </button>

              {/* Security Badge */}
              <p className="text-center text-sm text-gray-600">
                🔒 Powered by Stripe | Your donation is secure and tax-deductible
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Every Dollar Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-4xl font-bold text-blue-600 mb-2">$25</p>
              <p className="text-gray-700">Provides 10 nutritious meals for clients</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-4xl font-bold text-green-600 mb-2">$100</p>
              <p className="text-gray-700">Supports 1 week of intensive treatment services</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-4xl font-bold text-blue-600 mb-2">$500</p>
              <p className="text-gray-700">Provides 1 month of housing and comprehensive support</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div><h4 className="text-white font-bold mb-4">A Vision For You</h4><p className="text-sm">Supporting recovery and transformation for those facing homelessness, addiction, and mental health challenges.</p></div>
            <div><h4 className="text-white font-bold mb-4">Links</h4><ul className="space-y-2 text-sm"><li><Link href="/programs" className="hover:text-white">Programs</Link></li><li><Link href="/about" className="hover:text-white">About</Link></li><li><Link href="/blog" className="hover:text-white">Blog</Link></li><li><Link href="/donate" className="hover:text-white">Donate</Link></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">Account</h4><ul className="space-y-2 text-sm"><li><Link href="/login" className="hover:text-white">Sign In</Link></li><li><Link href="/signup" className="hover:text-white">Create Account</Link></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">Contact</h4><p className="text-sm mb-2"><strong>1675 Story Ave, Louisville, KY 40206</strong></p><p className="text-sm mb-2"><a href="tel:+15027496344" className="hover:text-white">(502) 749-6344</a></p><p className="text-sm"><a href="mailto:info@avisionforyourecovery.org" className="hover:text-white">info@avisionforyourecovery.org</a></p></div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm"><p>&copy; 2025 A Vision For You Recovery. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  )
}
