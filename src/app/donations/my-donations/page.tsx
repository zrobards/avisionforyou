'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, RefreshCw, XCircle } from 'lucide-react'

interface Donation {
  id: string
  amount: number
  frequency: string
  status: string
  nextRenewalDate: string | null
  createdAt: string
  squareSubscriptionId: string | null
}

export default function MyDonations() {
  const { status } = useSession()
  const router = useRouter()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetch('/api/donations/my-donations')
        .then(res => res.json())
        .then(data => setDonations(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [status, router])

  const handleCancel = async (donationId: string) => {
    if (!confirm('Are you sure you want to cancel this recurring donation? This cannot be undone.')) return

    setCancelling(donationId)
    try {
      const res = await fetch('/api/donations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId }),
      })
      if (res.ok) {
        setDonations(prev => prev.map(d =>
          d.id === donationId ? { ...d, status: 'CANCELLED' } : d
        ))
      }
    } catch (error) {
      console.error('Failed to cancel:', error)
    } finally {
      setCancelling(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple" />
      </div>
    )
  }

  const recurring = donations.filter(d => d.frequency !== 'ONE_TIME' && d.status !== 'CANCELLED')
  const oneTime = donations.filter(d => d.frequency === 'ONE_TIME')
  const cancelled = donations.filter(d => d.status === 'CANCELLED')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/dashboard" className="inline-flex items-center text-brand-purple hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donations</h1>
        <p className="text-gray-500 mb-8">View and manage your donation history</p>

        {/* Active Recurring Donations */}
        {recurring.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-purple" />
              Active Recurring Donations
            </h2>
            <div className="space-y-4">
              {recurring.map(donation => (
                <div key={donation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${donation.amount.toFixed(2)}
                        <span className="text-sm font-normal text-gray-500 ml-1">/ {donation.frequency.toLowerCase()}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Started {new Date(donation.createdAt).toLocaleDateString()}
                        {donation.nextRenewalDate && (
                          <> &middot; Next charge: {new Date(donation.nextRenewalDate).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancel(donation.id)}
                      disabled={cancelling === donation.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {cancelling === donation.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* One-Time Donations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-green" />
            Donation History
          </h2>
          {oneTime.length === 0 && recurring.length === 0 && cancelled.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t made any donations yet.</p>
              <Link href="/donate" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-lg font-semibold hover:bg-purple-800 transition">
                <Heart className="w-4 h-4" />
                Make a Donation
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Amount</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Type</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...oneTime, ...cancelled].map(donation => (
                    <tr key={donation.id}>
                      <td className="px-6 py-4 font-medium">${donation.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-500">{donation.frequency === 'ONE_TIME' ? 'One-time' : donation.frequency}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(donation.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          donation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          donation.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/donate" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition">
            <Heart className="w-5 h-5" />
            Make Another Donation
          </Link>
        </div>
      </div>
    </div>
  )
}
