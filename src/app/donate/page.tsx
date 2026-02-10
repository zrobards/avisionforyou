'use client'

import { useState, useMemo } from 'react'
import {
  AlertCircle,
  Heart,
  Home,
  Coffee,
  Bed,
  Users,
  Shield,
  Lock,
  Share2,
  Utensils,
  Star,
  CheckCircle,
  TrendingUp,
  ExternalLink,
} from 'lucide-react'
import AnimateOnScroll from '@/components/shared/AnimateOnScroll'
import CountUpNumber from '@/components/shared/CountUpNumber'

/* ─── Impact Tiers (used in preset buttons) ─── */
const impactLevels = [
  { amount: 25, label: '$25', impact: 'Provides 10 meals', icon: Coffee, color: 'from-emerald-400 to-emerald-600' },
  { amount: 50, label: '$50', impact: 'Supports 1 day of shelter', icon: Home, color: 'from-sky-400 to-sky-600' },
  { amount: 100, label: '$100', impact: 'Covers 1 week of recovery support', icon: Heart, color: 'from-violet-400 to-violet-600' },
  { amount: 250, label: '$250', impact: 'Provides 1 month of peer counseling', icon: Users, color: 'from-amber-400 to-amber-600' },
  { amount: 500, label: '$500', impact: 'Sponsors 1 full recovery program bed', icon: Bed, color: 'from-rose-400 to-rose-600' },
]

/* ─── Donor Impact Statements ─── */
const donorQuotes = [
  {
    quote: 'My $50/month helped provide stable housing for a mother and her child entering recovery. Knowing that family is safe gives me peace.',
    name: 'Sarah T.',
    role: 'Monthly Donor since 2024',
  },
  {
    quote: 'I donated because I know what addiction steals. AVFY gave my brother a second chance. Every dollar counts.',
    name: 'Marcus L.',
    role: 'One-Time Donor',
  },
  {
    quote: 'As a local business owner, supporting AVFY is an investment in Louisville. Healthier neighbors mean a stronger community for all of us.',
    name: 'Jennifer K.',
    role: 'Annual Supporter',
  },
]

/* ─── Fundraising Campaign ─── */
const CAMPAIGN_GOAL = 50000
const CAMPAIGN_RAISED = 23750
const CAMPAIGN_PERCENT = Math.round((CAMPAIGN_RAISED / CAMPAIGN_GOAL) * 100)

/* ─── Social Share URLs ─── */
const SHARE_TEXT = encodeURIComponent(
  'I just donated to @avisionforyourecovery to support addiction recovery in Louisville. Join me:'
)
const SHARE_URL = encodeURIComponent('https://avfy-main.vercel.app/donate')
const FACEBOOK_SHARE = `https://www.facebook.com/sharer/sharer.php?u=${SHARE_URL}&quote=${SHARE_TEXT}`
const TWITTER_SHARE = `https://twitter.com/intent/tweet?text=${SHARE_TEXT}&url=${SHARE_URL}`
const LINKEDIN_SHARE = `https://www.linkedin.com/sharing/share-offsite/?url=${SHARE_URL}`

export default function Donate() {
  /* ─── State (preserved from original) ─── */
  const [selectedAmount, setSelectedAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState('ONE_TIME')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'square'>('square')
  const isSandbox = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
  const ein = process.env.NEXT_PUBLIC_EIN?.trim()

  const stripeConfigured =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder')
  const squareConfigured =
    process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT &&
    (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'sandbox' ||
      process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production')

  /* ─── Derived values ─── */
  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  const dynamicImpact = useMemo(() => {
    const a = finalAmount || 0
    if (a < 10) return 'Will help provide basic necessities for someone beginning recovery'
    if (a < 25) return 'Will provide several nutritious meals and hygiene supplies'
    if (a < 50) return 'Will fund 10 nutritious meals and daily essentials for a person in need'
    if (a < 100) return 'Will provide job-readiness materials and one day of safe housing'
    if (a < 250) return 'Will cover one full week of safe housing and intensive support services'
    if (a < 500) return 'Will fund a month of comprehensive recovery services including counseling and housing'
    return 'Will provide ongoing treatment, housing, and wraparound support for multiple clients in need'
  }, [finalAmount])

  /* ─── Original handleDonate logic (fully preserved) ─── */
  const handleDonate = async () => {
    setError('')

    if (!email || !name) {
      setError('Please enter your name and email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (name.trim().length < 2) {
      setError('Please enter a valid name')
      return
    }

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount

    if (amount < 1) {
      setError('Amount must be at least $1')
      return
    }

    setLoading(true)

    try {
      const endpoint =
        paymentMethod === 'square' ? '/api/donate/square' : '/api/donate/checkout'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, frequency, email, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage =
          data.error || `Failed to create checkout session (${response.status})`
        console.error('Donation: Error response', errorMessage)
        setError(errorMessage)
        return
      }

      if (data.url) {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', 'donation', {
            value: amount,
            currency: 'USD',
            transaction_id: data.donationId || '',
          })
        }
        window.location.href = data.url
      } else if (data.sessionId) {
        window.location.href = data.url
      } else {
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

  /* ──────────────────────── RENDER ──────────────────────── */
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* ═══════════ 1. EMOTIONAL HERO HEADER ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-dark-lighter to-brand-dark py-20 sm:py-28">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#b6e41f]/10 blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <AnimateOnScroll variant="fadeUp">
            <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-[#b6e41f]/30 bg-[#b6e41f]/10 px-4 py-1.5 text-sm font-medium text-[#b6e41f]">
              <Shield className="w-4 h-4" />
              501(c)(3) Tax-Exempt Organization{ein ? ` \u2014 EIN: ${ein}` : ''}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Your Generosity{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b6e41f] to-emerald-400">
                Saves Lives
              </span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.2}>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              Every dollar funds addiction recovery treatment, safe housing, nutritious meals, and the wraparound support
              that gives people in Louisville a real second chance at life.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#b6e41f]" />
                100% Tax-Deductible
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#b6e41f]" />
                Secure Payment
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#b6e41f]" />
                Every Dollar Counts
              </span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ 2. SOCIAL PROOF ═══════════ */}
      <section className="bg-brand-dark-lighter border-y border-white/5 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <AnimateOnScroll variant="fade">
            <p className="text-center text-sm uppercase tracking-widest text-[#b6e41f]/80 font-semibold mb-2">
              Community of Changemakers
            </p>
            <h2 className="text-center text-2xl sm:text-3xl font-bold mb-4">
              Join{' '}
              <CountUpNumber end={200} suffix="+" className="text-[#b6e41f]" />
              {' '}donors who believe in recovery
            </h2>
            <p className="text-center text-white/50 mb-12 max-w-xl mx-auto">
              Real supporters. Real impact. Here is what they have to say.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {donorQuotes.map((d, i) => (
              <AnimateOnScroll key={i} variant="fadeUp" delay={i * 0.15}>
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-[#b6e41f] text-[#b6e41f]" />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed flex-1 italic">
                    &ldquo;{d.quote}&rdquo;
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="font-semibold text-white">{d.name}</p>
                    <p className="text-xs text-white/40">{d.role}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 3. FUNDRAISING PROGRESS BAR ═══════════ */}
      <section className="bg-brand-dark py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <div className="rounded-2xl border border-white/10 bg-brand-dark-lighter/80 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#b6e41f]" />
                <h3 className="text-lg font-bold">Spring 2026 Campaign Goal: $50,000</h3>
              </div>

              <div className="relative w-full h-5 rounded-full bg-slate-800 overflow-hidden mb-3">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#b6e41f] to-emerald-400 transition-all duration-[2000ms] ease-out"
                  style={{ width: `${CAMPAIGN_PERCENT}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse"
                  style={{ width: `${CAMPAIGN_PERCENT}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#b6e41f] font-bold">
                  $<CountUpNumber end={CAMPAIGN_RAISED} /> raised
                </span>
                <span className="text-white/50">
                  {CAMPAIGN_PERCENT}% of ${CAMPAIGN_GOAL.toLocaleString()} goal
                </span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ 4. ENHANCED DONATION FORM ═══════════ */}
      <section className="bg-brand-dark pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto px-4">
          <AnimateOnScroll variant="scaleUp">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-brand-dark-lighter to-brand-dark-lighter/80 shadow-2xl shadow-[#b6e41f]/5 p-6 sm:p-8 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-center">Choose Your Impact</h2>
              <p className="text-white/50 text-center mb-8">
                Every donation directly transforms lives in our community
              </p>

              {/* ── Payment Method ── */}
              <div className="mb-8 rounded-xl border border-white/10 bg-slate-800/50 p-5">
                <label className="block text-sm font-semibold text-white/70 mb-3">Payment Method</label>
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => setPaymentMethod('square')}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                      paymentMethod === 'square'
                        ? 'bg-[#b6e41f] text-slate-950 shadow-lg shadow-[#b6e41f]/20'
                        : 'bg-slate-700 text-white/70 hover:bg-slate-600'
                    }`}
                  >
                    Square{isSandbox ? ' (Sandbox)' : ''}
                  </button>
                  {stripeConfigured && (
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                        paymentMethod === 'stripe'
                          ? 'bg-[#b6e41f] text-slate-950 shadow-lg shadow-[#b6e41f]/20'
                          : 'bg-slate-700 text-white/70 hover:bg-slate-600'
                      }`}
                    >
                      Stripe
                    </button>
                  )}
                </div>
                {paymentMethod === 'square' && isSandbox && (
                  <p className="text-xs sm:text-sm text-[#b6e41f]/80 mt-2">
                    Sandbox mode - Use test card: 4532 0151 1283 0366
                  </p>
                )}
              </div>

              {/* ── Frequency ── */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-white/70 mb-3">Donation Frequency</label>
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => setFrequency('ONE_TIME')}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                      frequency === 'ONE_TIME'
                        ? 'bg-white text-slate-950 shadow-lg'
                        : 'bg-slate-800 text-white/70 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    One-Time
                  </button>
                  <button
                    onClick={() => setFrequency('MONTHLY')}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all relative ${
                      frequency === 'MONTHLY'
                        ? 'bg-[#b6e41f] text-slate-950 shadow-lg shadow-[#b6e41f]/20'
                        : 'bg-slate-800 text-white/70 border border-[#b6e41f]/30 hover:border-[#b6e41f]/60'
                    }`}
                  >
                    Monthly
                    <span className="absolute -top-2.5 -right-1 sm:-right-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                      Most Impact
                    </span>
                  </button>
                  <button
                    onClick={() => setFrequency('YEARLY')}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all relative ${
                      frequency === 'YEARLY'
                        ? 'bg-white text-slate-950 shadow-lg'
                        : 'bg-slate-800 text-white/70 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    Yearly
                    <span className="absolute -top-2.5 -right-1 sm:-right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                      Best Value
                    </span>
                  </button>
                </div>
                {frequency === 'MONTHLY' && (
                  <p className="text-xs sm:text-sm text-[#b6e41f]/80 mt-3">
                    Monthly giving provides sustainable support and helps us plan long-term programs.
                  </p>
                )}
                {frequency === 'YEARLY' && (
                  <p className="text-xs sm:text-sm text-white/50 mt-3">
                    Annual giving ensures we can plan and execute our best programs year-round.
                  </p>
                )}
              </div>

              {/* ── Amount Preset Buttons ── */}
              <div className="mb-6 sm:mb-8">
                <label className="block text-sm font-semibold text-white/70 mb-3">Select Impact Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {impactLevels.map(({ amount, label, impact, icon: Icon, color }) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount)
                        setCustomAmount('')
                      }}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all transform active:scale-95 sm:hover:scale-105 ${
                        selectedAmount === amount && !customAmount
                          ? 'border-[#b6e41f] bg-[#b6e41f]/10 shadow-lg shadow-[#b6e41f]/10'
                          : 'border-white/10 bg-slate-800/50 hover:border-[#b6e41f]/40'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-white mb-1">{label}</p>
                      <p className="text-xs text-white/50">{impact}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Custom Amount ── */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-white/70 mb-2">Or Enter Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(0)
                    }}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-lg placeholder:text-white/30 focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* ── Dynamic Impact Statement ── */}
              <div className="rounded-xl border border-[#b6e41f]/20 bg-[#b6e41f]/5 p-5 sm:p-6 mb-8">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-[#b6e41f]/70 font-semibold mb-2">
                    Your Total Impact
                  </p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-[#b6e41f] mb-3">
                    ${(finalAmount || 0).toFixed(2)}
                  </p>
                  <p className="text-white/60 leading-relaxed text-sm sm:text-base">{dynamicImpact}</p>
                  {frequency === 'MONTHLY' && (finalAmount || 0) > 0 && (
                    <div className="mt-4 inline-block bg-[#b6e41f]/15 border border-[#b6e41f]/20 px-4 py-2 rounded-full">
                      <p className="text-sm font-semibold text-[#b6e41f]">
                        Annual Impact: ${((finalAmount || 0) * 12).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Tax Deductible Disclosure ── */}
              <div className="rounded-xl border border-white/10 bg-slate-800/40 p-5 mb-8">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#b6e41f] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Tax-Deductible Giving</h3>
                    <p className="text-xs text-white/50 leading-relaxed">
                      A Vision For You is a registered 501(c)(3) nonprofit organization. Contributions are
                      tax-deductible to the extent permitted by law. No goods or services are provided in exchange for
                      your donation. You will receive a tax receipt via email within 24 hours.
                    </p>
                    {ein && (
                      <p className="text-xs text-white/40 mt-1">Federal Tax ID: {ein}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Error ── */}
              {error && (
                <div className="bg-red-900/30 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl mb-6 flex gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* ── Donor Info ── */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-white/70 mb-4">Your Information</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent outline-none transition"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* ── Submit Button ── */}
              <button
                onClick={handleDonate}
                disabled={loading || !finalAmount || !name || !email}
                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-[#b6e41f] to-emerald-400 text-slate-950 rounded-2xl font-bold text-lg sm:text-xl shadow-xl shadow-[#b6e41f]/20 active:scale-[0.98] sm:hover:shadow-2xl sm:hover:shadow-[#b6e41f]/30 sm:hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <Heart className="w-5 h-5 inline-block mr-2 -mt-0.5" />
                    Complete Donation{finalAmount > 0 ? ` \u2014 $${finalAmount.toFixed(2)}` : ''}
                  </>
                )}
              </button>

              {/* ── Trust Signals ── */}
              <div className="mt-6 flex flex-col items-center gap-2.5 text-center">
                <p className="text-sm text-white/40 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#b6e41f]" />
                  Secure payment powered by {paymentMethod === 'square' ? 'Square' : 'Stripe'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    501(c)(3) Verified
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    100% Tax-Deductible
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    No Goods or Services Exchanged
                  </span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ 5. IMPACT TIERS ═══════════ */}
      <section className="bg-brand-dark-lighter py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              See Where Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b6e41f] to-emerald-400">
                Money Goes
              </span>
            </h2>
            <p className="text-center text-white/50 mb-12 max-w-xl mx-auto">
              Transparent impact. Every cent is accounted for.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Tier 1 */}
            <AnimateOnScroll variant="fadeUp" delay={0}>
              <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/80 to-slate-800/40 p-6 sm:p-8 text-center transition-all hover:border-[#b6e41f]/30 hover:shadow-lg hover:shadow-[#b6e41f]/5">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#b6e41f] mb-2">$25</p>
                <p className="font-semibold text-white mb-2">Daily Essentials</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  Provides 10 nutritious meals and basic necessities for someone taking their first steps in recovery.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Tier 2 */}
            <AnimateOnScroll variant="fadeUp" delay={0.15}>
              <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/80 to-slate-800/40 p-6 sm:p-8 text-center transition-all hover:border-[#b6e41f]/30 hover:shadow-lg hover:shadow-[#b6e41f]/5">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#b6e41f] mb-2">$100</p>
                <p className="font-semibold text-white mb-2">Safe Housing</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  Covers one full week of safe, stable housing and intensive daily support services.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Tier 3 */}
            <AnimateOnScroll variant="fadeUp" delay={0.3}>
              <div className="group relative rounded-2xl border border-[#b6e41f]/20 bg-gradient-to-b from-[#b6e41f]/10 to-slate-800/40 p-6 sm:p-8 text-center transition-all hover:border-[#b6e41f]/40 hover:shadow-lg hover:shadow-[#b6e41f]/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#b6e41f] to-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">
                  Greatest Need
                </div>
                <div className="w-16 h-16 mx-auto mb-5 mt-2 rounded-2xl bg-gradient-to-br from-[#b6e41f] to-emerald-500 flex items-center justify-center shadow-lg shadow-[#b6e41f]/20">
                  <Heart className="w-8 h-8 text-slate-950" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#b6e41f] mb-2">$500</p>
                <p className="font-semibold text-white mb-2">Full Month of Treatment</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  Sponsors one complete month of comprehensive treatment, housing, counseling, and wraparound care.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════ 6. SOCIAL SHARING ═══════════ */}
      <section className="bg-brand-dark border-t border-white/5 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <AnimateOnScroll variant="fadeUp">
            <Share2 className="w-8 h-8 text-[#b6e41f] mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              Help Us Reach More People
            </h2>
            <p className="text-white/50 mb-6 text-sm sm:text-base">
              Even if you cannot donate today, sharing our mission multiplies the impact. Let your network know you stand
              with recovery.
            </p>

            {/* Pre-written post preview */}
            <div className="rounded-xl border border-white/10 bg-brand-dark-lighter/60 p-5 mb-6 text-left">
              <p className="text-sm text-white/70 leading-relaxed italic">
                &ldquo;I just donated to @avisionforyourecovery to support addiction recovery in Louisville. Join me:
                avfy-main.vercel.app/donate&rdquo;
              </p>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href={FACEBOOK_SHARE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1877F2] text-white text-sm font-semibold hover:bg-[#1877F2]/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Facebook
              </a>
              <a
                href={TWITTER_SHARE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-950 text-sm font-semibold hover:bg-white/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                X / Twitter
              </a>
              <a
                href={LINKEDIN_SHARE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A66C2] text-white text-sm font-semibold hover:bg-[#0A66C2]/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════ 7. FINAL CTA / FOOTER NOTE ═══════════ */}
      <section className="bg-brand-dark-lighter border-t border-white/5 py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-white/30 text-xs leading-relaxed">
            A Vision For You Inc. is a 501(c)(3) tax-exempt organization{ein ? ` (EIN: ${ein})` : ''}. All donations are
            tax-deductible to the fullest extent of the law. No goods or services are provided in exchange for your
            contribution. A tax receipt will be emailed to you within 24 hours.
          </p>
          <p className="text-white/20 text-xs mt-3">
            1675 Story Ave, Louisville, KY 40206 &middot; (502) 749-6344 &middot; info@avisionforyourecovery.org
          </p>
        </div>
      </section>
    </div>
  )
}
