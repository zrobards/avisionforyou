'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Heart, RefreshCw, XCircle, CheckCircle,
  Clock, DollarSign, Calendar, Star, TrendingUp,
} from 'lucide-react'

interface Donation {
  id: string
  amount: number
  frequency: string
  status: string
  nextRenewalDate: string | null
  createdAt: string
  donorName: string | null
  email: string | null
  squareSubscriptionId: string | null
  squarePaymentId: string | null
}

export default function MyDonations() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (authStatus === 'authenticated') {
      fetch('/api/donations/my-donations')
        .then(res => {
          const ct = res.headers.get('content-type') || ''
          if (!ct.includes('application/json')) return []
          return res.json()
        })
        .then(data => setDonations(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [authStatus, router])

  const handleCancel = async (donationId: string) => {
    if (!confirm('Are you sure you want to cancel this recurring donation? You can always start a new one later.')) return

    setCancelling(donationId)
    try {
      const res = await fetch('/api/donations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId }),
      })
      if (res.ok) {
        setDonations(prev => prev.map(d =>
          d.id === donationId ? { ...d, status: 'CANCELLED', nextRenewalDate: null } : d
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

  const activeRecurring = donations.filter(d => d.frequency !== 'ONE_TIME' && d.status === 'COMPLETED')
  const pendingDonations = donations.filter(d => d.status === 'PENDING')
  const completedOneTime = donations.filter(d => d.frequency === 'ONE_TIME' && d.status === 'COMPLETED')
  const cancelledDonations = donations.filter(d => d.status === 'CANCELLED')
  const failedDonations = donations.filter(d => d.status === 'FAILED')

  const totalDonated = donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0)

  const totalCount = donations.filter(d => d.status === 'COMPLETED').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <Link href="/dashboard" className="inline-flex items-center text-brand-purple hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
            <p className="text-gray-500 mt-1">
              {session?.user?.name ? `Thank you for your generosity, ${session.user.name.split(' ')[0]}!` : 'Manage your donations and giving history'}
            </p>
          </div>
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition self-start"
          >
            <Heart className="w-5 h-5" />
            Make a Donation
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-brand-green" />
              <span className="text-xs font-medium text-gray-500 uppercase">Total Given</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalDonated.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-500 uppercase">Donations</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-brand-purple" />
              <span className="text-xs font-medium text-gray-500 uppercase">Active Recurring</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeRecurring.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-gray-500 uppercase">Impact</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {totalDonated >= 500 ? 'Champion' : totalDonated >= 100 ? 'Supporter' : totalDonated > 0 ? 'Friend' : '--'}
            </p>
          </div>
        </div>

        {/* Pending Donations */}
        {pendingDonations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending ({pendingDonations.length})
            </h2>
            <div className="space-y-3">
              {pendingDonations.map(donation => (
                <div key={donation.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">${donation.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {donation.frequency === 'ONE_TIME' ? 'One-time' : donation.frequency} &middot; {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                    Processing
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Recurring Donations */}
        {activeRecurring.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-purple" />
              Active Recurring Donations
            </h2>
            <div className="space-y-4">
              {activeRecurring.map(donation => (
                <div key={donation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-bold text-gray-900">
                          ${donation.amount.toFixed(2)}
                        </p>
                        <span className="px-3 py-1 text-xs font-medium bg-brand-purple/10 text-brand-purple rounded-full">
                          {donation.frequency === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Started {new Date(donation.createdAt).toLocaleDateString()}
                        </span>
                        {donation.nextRenewalDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Next charge: {new Date(donation.nextRenewalDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancel(donation.id)}
                      disabled={cancelling === donation.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50 self-start"
                    >
                      {cancelling === donation.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Recurring CTA (if no active recurring) */}
        {activeRecurring.length === 0 && (
          <div className="mb-8 bg-gradient-to-r from-brand-purple/5 to-brand-green/5 border border-brand-purple/20 rounded-xl p-6 text-center">
            <RefreshCw className="w-8 h-8 text-brand-purple mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Become a Monthly Supporter</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Monthly donations are 2x more impactful — they let us plan ahead and help more people consistently.
            </p>
            <Link
              href="/donate?frequency=monthly"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-lg font-semibold hover:bg-purple-800 transition"
            >
              <Star className="w-4 h-4" />
              Give Monthly
            </Link>
          </div>
        )}

        {/* Completed One-Time Donations */}
        {(completedOneTime.length > 0 || cancelledDonations.length > 0 || failedDonations.length > 0) && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-brand-green" />
              Donation History
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Mobile: card layout, Desktop: table */}
              <div className="hidden sm:block">
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
                    {[...completedOneTime, ...cancelledDonations, ...failedDonations].map(donation => (
                      <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium">${donation.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {donation.frequency === 'ONE_TIME' ? 'One-time' :
                           donation.frequency === 'MONTHLY' ? 'Monthly' :
                           donation.frequency === 'YEARLY' ? 'Yearly' : donation.frequency}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{new Date(donation.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            donation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            donation.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' :
                            donation.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {donation.status === 'COMPLETED' ? 'Completed' :
                             donation.status === 'CANCELLED' ? 'Cancelled' :
                             donation.status === 'FAILED' ? 'Failed' : donation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile card layout */}
              <div className="sm:hidden divide-y divide-gray-100">
                {[...completedOneTime, ...cancelledDonations, ...failedDonations].map(donation => (
                  <div key={donation.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">${donation.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {donation.frequency === 'ONE_TIME' ? 'One-time' : donation.frequency} &middot; {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      donation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      donation.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' :
                      donation.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {donation.status === 'COMPLETED' ? 'Completed' :
                       donation.status === 'CANCELLED' ? 'Cancelled' :
                       donation.status === 'FAILED' ? 'Failed' : donation.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {donations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No donations yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Your donations help us provide housing, meals, treatment, and hope to people rebuilding their lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition"
              >
                <Heart className="w-5 h-5" />
                Make a One-Time Gift
              </Link>
              <Link
                href="/donate?frequency=monthly"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-purple-800 transition"
              >
                <RefreshCw className="w-5 h-5" />
                Give Monthly
              </Link>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {donations.length > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400 mb-4">
              A Vision For You is a 501(c)(3). EIN: 87-1066569. All donations are tax-deductible.
            </p>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition"
            >
              <Heart className="w-5 h-5" />
              Make Another Donation
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
