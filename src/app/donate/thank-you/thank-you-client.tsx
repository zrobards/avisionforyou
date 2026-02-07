'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Heart } from 'lucide-react'

export default function ThankYouClient() {
  const searchParams = useSearchParams()
  const amountParam = searchParams?.get('amount')
  const frequency = (searchParams?.get('frequency') || 'ONE_TIME').toUpperCase()

  const amount = amountParam ? Number(amountParam) : null
  const formattedAmount = amount && !Number.isNaN(amount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : null

  const frequencyLabel = frequency === 'MONTHLY'
    ? 'Monthly'
    : frequency === 'YEARLY'
      ? 'Yearly'
      : 'One-Time'

  const shareText = encodeURIComponent(
    'I just donated to A Vision For You — a nonprofit helping people recover from addiction through housing, treatment, and community support. Join me in making a difference!'
  )
  const shareUrl = encodeURIComponent('https://avisionforyou.vercel.app/donate')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        {/* Animated checkmark */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-8 animate-bounce">
          <svg
            className="w-14 h-14 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              className="animate-[draw_0.6s_ease-in-out_forwards]"
              style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: 'draw 0.6s ease-in-out 0.3s forwards' }}
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Thank you for your generous donation!
        </h1>
        <p className="text-purple-200 text-lg mb-10">
          Your support helps provide recovery services, housing, and hope for those who need it most.
        </p>

        {/* Donation summary card */}
        <div className="bg-white/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 text-left mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-brand-green" />
            <h2 className="text-2xl font-bold text-white">Donation Summary</h2>
          </div>
          <div className="space-y-3 text-purple-100">
            {formattedAmount && <p><strong className="text-white">Amount:</strong> {formattedAmount}</p>}
            <p><strong className="text-white">Frequency:</strong> {frequencyLabel}</p>
            <p><strong className="text-white">Status:</strong> Received</p>
          </div>
        </div>

        {/* Tax receipt section */}
        <div className="bg-brand-purple/30 border border-purple-400/30 rounded-2xl p-8 text-left mb-10">
          <h3 className="text-lg font-bold text-white mb-3">Tax-Deductible Receipt</h3>
          <p className="text-purple-200 text-sm leading-relaxed">
            A Vision For You is a 501(c)(3) nonprofit organization. Your donation is tax-deductible
            to the extent permitted by law. You will receive a receipt via email for your records.
          </p>
        </div>

        {/* Social sharing */}
        <div className="mb-10">
          <p className="text-purple-200 mb-4">Share your support and inspire others</p>
          <div className="flex gap-4 justify-center">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877F2] text-white rounded-lg font-semibold hover:bg-[#166FE5] transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </a>
          </div>
        </div>

        {/* Return home */}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-brand-green text-brand-purple font-bold text-lg hover:bg-green-400 transition shadow-lg"
        >
          Return to Home
        </Link>
      </section>

      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}
