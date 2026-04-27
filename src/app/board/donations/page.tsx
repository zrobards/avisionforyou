'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, DollarSign, Download, Heart, TrendingUp } from 'lucide-react'

interface Donation {
  id: string
  amount: number
  frequency: string
  status: string
  name?: string | null
  email?: string | null
  comment?: string | null
  createdAt: string
}

interface DonationStats {
  totalDonations: number
  totalAmount: number
  averageDonation: number
  oneTimeDonations: number
  recurringDonations: number
  totalRecurring: number
  completedDonations: number
  failedDonations: number
  pendingDonations: number
  anonymousDonations: number
}

interface TopDonor {
  name: string
  total: number
}

interface DonationAnalyticsResponse {
  donations: Donation[]
  stats: DonationStats
  monthlyDonations: Record<string, { count: number; amount: number }>
  topDonors: TopDonor[]
}

export default function DonationReportsPage() {
  const [analytics, setAnalytics] = useState<DonationAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    void fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/board/donations')
      if (!res.ok) {
        throw new Error(`Failed to fetch board donation analytics: ${res.status}`)
      }

      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching donation stats:', error)
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/board/donations/export')
      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `donations-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting donations:', error)
    } finally {
      setExporting(false)
    }
  }

  const monthlyTrend = useMemo(() => {
    if (!analytics) {
      return []
    }

    return Object.entries(analytics.monthlyDonations).map(([month, values]) => ({
      month,
      total: values.amount,
      count: values.count
    }))
  }, [analytics])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">Failed to load donation analytics.</p>
      </div>
    )
  }

  const { donations, stats, topDonors } = analytics
  const maxMonthlyTotal = Math.max(...monthlyTrend.map((entry) => entry.total), 0)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Donation Reports</h1>
          <p className="mt-2 text-gray-600">Board-facing donation analytics aligned with the admin reporting view.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500">Total Raised</h2>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="mt-2 text-xs text-gray-500">{stats.totalDonations} donations</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500">Average Donation</h2>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.averageDonation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="mt-2 text-xs text-gray-500">Per donation</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500">Recurring Total</h2>
            <Heart className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRecurring.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="mt-2 text-xs text-gray-500">{stats.recurringDonations} recurring donations</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500">Success Rate</h2>
            <CheckCircle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalDonations > 0 ? Math.round((stats.completedDonations / stats.totalDonations) * 100) : 0}%
          </p>
          <p className="mt-2 text-xs text-gray-500">{stats.completedDonations} completed</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">One-Time</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.oneTimeDonations}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Recurring</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.recurringDonations}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pendingDonations}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Failed</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.failedDonations}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Anonymous</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.anonymousDonations}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Top Donors</h2>
          <div className="space-y-3">
            {topDonors.length > 0 ? topDonors.map((donor, index) => (
              <div key={`${donor.name}-${index}`} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    #{index + 1}
                  </div>
                  <span className="text-gray-800">{donor.name}</span>
                </div>
                <span className="font-semibold text-gray-900">${donor.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No donor data available yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Monthly Trend</h2>
          <div className="space-y-4">
            {monthlyTrend.map((month) => {
              const percentage = maxMonthlyTotal > 0 ? (month.total / maxMonthlyTotal) * 100 : 0
              return (
                <div key={month.month}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{month.month}</span>
                    <span className="font-semibold text-gray-900">
                      ${month.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({month.count})
                    </span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Donations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Donor</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Comment</th>
              </tr>
            </thead>
            <tbody>
              {donations.length > 0 ? donations.slice(0, 20).map((donation) => (
                <tr key={donation.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-4 text-gray-600">{new Date(donation.createdAt).toLocaleDateString()}</td>
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-gray-900">{donation.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{donation.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="py-4 font-semibold text-gray-900">${Number(donation.amount).toFixed(2)}</td>
                  <td className="py-4 text-gray-600">{donation.frequency === 'ONE_TIME' ? 'One-Time' : donation.frequency}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        donation.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : donation.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {donation.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                      {donation.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {donation.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                      {donation.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500">{donation.comment || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No donations available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
