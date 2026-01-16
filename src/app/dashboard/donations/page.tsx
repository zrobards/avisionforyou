'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Donation {
  id: string
  amount: number
  frequency: 'ONE_TIME' | 'MONTHLY' | 'YEARLY'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  email?: string
  name?: string
  createdAt: string
  nextRenewalDate?: string
  cancelledAt?: string
}

export default function DonationsDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'one-time' | 'recurring' | 'active'>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchDonations()
    }
  }, [status, router])

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/donations/my-donations')
      if (!response.ok) throw new Error('Failed to fetch donations')
      
      const data = await response.json()
      setDonations(data)
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRecurring = async (donationId: string) => {
    if (!confirm('Are you sure you want to cancel this recurring donation?')) {
      return
    }

    try {
      setCancellingId(donationId)
      const response = await fetch(`/api/donations/${donationId}/cancel`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to cancel donation')
      
      setDonations(donations.map(d => 
        d.id === donationId 
          ? { ...d, status: 'CANCELLED', cancelledAt: new Date().toISOString() }
          : d
      ))
    } catch (error) {
      console.error('Error cancelling donation:', error)
      alert('Failed to cancel donation. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const filteredDonations = donations.filter(d => {
    switch (filter) {
      case 'one-time':
        return d.frequency === 'ONE_TIME'
      case 'recurring':
        return d.frequency !== 'ONE_TIME'
      case 'active':
        return d.frequency !== 'ONE_TIME' && d.status === 'COMPLETED' && !d.cancelledAt
      default:
        return true
    }
  })

  const stats = {
    totalDonated: donations.reduce((sum, d) => sum + (d.status === 'COMPLETED' ? d.amount : 0), 0),
    recurringCount: donations.filter(d => d.frequency !== 'ONE_TIME' && d.status === 'COMPLETED').length,
    monthlyRecurring: donations
      .filter(d => d.frequency === 'MONTHLY' && d.status === 'COMPLETED' && !d.cancelledAt)
      .reduce((sum, d) => sum + d.amount, 0)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
            <Link
              href="/donate"
              className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition"
            >
              Make Another Donation
            </Link>
          </div>
          <p className="text-gray-600 mt-2">Track and manage your donations to A Vision For You</p>
        </div>

        {/* Stats */}
        {donations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-2">Total Donated</p>
              <p className="text-3xl font-bold text-brand-purple">
                ${stats.totalDonated.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-2">Active Recurring Donations</p>
              <p className="text-3xl font-bold text-green-600">{stats.recurringCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-2">Monthly Recurring Amount</p>
              <p className="text-3xl font-bold text-blue-600">
                ${stats.monthlyRecurring.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-4 flex-wrap">
              {[
                { key: 'all' as const, label: 'All Donations' },
                { key: 'one-time' as const, label: 'One-Time' },
                { key: 'recurring' as const, label: 'Recurring' },
                { key: 'active' as const, label: 'Active' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded transition ${
                    filter === key
                      ? 'bg-brand-purple text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Donations List */}
        <div className="space-y-4">
          {filteredDonations.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? 'You haven\'t made any donations yet.'
                  : `No ${filter} donations found.`}
              </p>
              <Link
                href="/donate"
                className="inline-block px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition"
              >
                Make a Donation
              </Link>
            </div>
          ) : (
            filteredDonations.map(donation => (
              <div key={donation.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        ${donation.amount.toFixed(2)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        donation.frequency === 'ONE_TIME'
                          ? 'bg-gray-100 text-gray-800'
                          : donation.frequency === 'MONTHLY'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {donation.frequency === 'ONE_TIME' ? 'One-Time' : `${donation.frequency}`}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        donation.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : donation.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : donation.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {donation.status === 'CANCELLED' ? 'Cancelled' : donation.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Donation ID: {donation.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {donation.nextRenewalDate && (
                    <div>
                      <p className="text-gray-600">Next Renewal</p>
                      <p className="font-medium text-gray-900">
                        {new Date(donation.nextRenewalDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {donation.cancelledAt && (
                    <div>
                      <p className="text-gray-600">Cancelled</p>
                      <p className="font-medium text-gray-900">
                        {new Date(donation.cancelledAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {donation.frequency !== 'ONE_TIME' && donation.status === 'COMPLETED' && !donation.cancelledAt && (
                  <button
                    onClick={() => handleCancelRecurring(donation.id)}
                    disabled={cancellingId === donation.id}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50"
                  >
                    {cancellingId === donation.id ? 'Cancelling...' : 'Cancel Recurring Donation'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 text-sm text-blue-900">
            <div>
              <p className="font-semibold">How do I cancel my recurring donation?</p>
              <p className="mt-1">Click the "Cancel Recurring Donation" button on any active recurring donation. You can also contact us at <a href="mailto:donate@avisionforyou.org" className="underline">donate@avisionforyou.org</a></p>
            </div>
            <div>
              <p className="font-semibold">When will my next donation be charged?</p>
              <p className="mt-1">Recurring donations are processed on the anniversary of your original donation date. Check the "Next Renewal" date on your donation.</p>
            </div>
            <div>
              <p className="font-semibold">Can I change my donation amount?</p>
              <p className="mt-1">Please contact us at <a href="mailto:donate@avisionforyou.org" className="underline">donate@avisionforyou.org</a> to modify your recurring donation amount.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
