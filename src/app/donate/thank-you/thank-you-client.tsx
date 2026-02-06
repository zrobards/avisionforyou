'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Heart, Share2 } from 'lucide-react'

export default function ThankYouClient() {
  const searchParams = useSearchParams()
  const amountParam = searchParams?.get('amount')
  const frequency = (searchParams?.get('frequency') || 'ONE_TIME').toUpperCase()
  const ein = process.env.NEXT_PUBLIC_EIN?.trim()

  const amount = amountParam ? Number(amountParam) : null
  const formattedAmount = amount && !Number.isNaN(amount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : null

  const frequencyLabel = frequency === 'MONTHLY'
    ? 'Monthly'
    : frequency === 'YEARLY'
      ? 'Yearly'
      : 'One-Time'

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank you for your generosity</h1>
        <p className="text-gray-600 text-lg mb-8">
          Your support helps provide recovery services, housing, and hope for those who need it most.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-brand-purple" />
            <h2 className="text-2xl font-bold text-gray-900">Donation Summary</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p><strong>Amount:</strong> {formattedAmount || 'Thank you!'}</p>
            <p><strong>Frequency:</strong> {frequencyLabel}</p>
            <p><strong>Status:</strong> Received</p>
            {ein && (
              <p><strong>EIN:</strong> {ein}</p>
            )}
            <p className="text-sm text-gray-500">
              A Vision For You is a 501(c)(3) nonprofit. No goods or services were provided in exchange for this donation.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-purple text-white font-semibold hover:bg-purple-800 transition"
          >
            Return Home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-brand-purple text-brand-purple font-semibold hover:bg-purple-50 transition"
          >
            Read Recovery Stories
          </Link>
        </div>

        <div className="mt-8 text-gray-600 flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          <span>Share your support with friends and family.</span>
        </div>
      </section>
    </div>
  )
}
