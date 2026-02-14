'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function DonationConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [donation, setDonation] = useState<{ id: string; amount: number; status: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const donationId = searchParams.get('id')
  const amount = searchParams.get('amount')

  useEffect(() => {
    if (!donationId || !amount) {
      setLoading(false)
      return
    }

    // Fetch donation details if needed
    setDonation({
      id: donationId,
      amount: parseFloat(amount),
      status: 'PENDING'
    })
    setLoading(false)
  }, [donationId, amount])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!donation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Invalid donation session</p>
          <Link href="/donate" className="text-blue-600 hover:text-blue-700">← Back to Donate</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Your donation of <span className="font-bold text-brand-purple">${donation.amount.toFixed(2)}</span> has been received
          </p>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What Happens Next?</h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Your donation is being processed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>A personalized thank you email with payment details will arrive shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>You'll receive a tax receipt for your records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Your impact will directly help those in recovery</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">💡 Multiply Your Impact</h2>
            <p className="text-blue-800 mb-3">
              Your ${donation.amount.toFixed(2)} donation makes a difference. Imagine if you gave that amount every month...
            </p>
            <div className="bg-white rounded p-3 mb-3 text-sm">
              <p><strong>Your one-time gift:</strong> ${donation.amount.toFixed(2)}</p>
              <p><strong>If given monthly:</strong> ${(donation.amount * 12).toFixed(2)}/year</p>
              <p className="text-green-600 font-bold mt-2">That's 12x more lives changed! 💚</p>
            </div>
            <p className="text-sm text-blue-700">
              Check your email for details on becoming a monthly recurring donor with just 2x the impact.
            </p>
          </div>

          <p className="text-gray-600 mb-8">
            Your generosity makes a profound difference in the lives of people seeking recovery and hope.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-smooth font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/donate"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-smooth font-medium"
            >
              Make Another Donation
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Donation Details</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p>Amount: <span className="font-semibold">${donation.amount.toFixed(2)}</span></p>
            <p>Donation ID: <span className="font-mono text-xs">{donation.id}</span></p>
            <p>Status: <span className="font-semibold">Pending Verification</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DonationConfirm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DonationConfirmContent />
    </Suspense>
  )
}
