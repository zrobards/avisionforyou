'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Users, Download } from 'lucide-react'

interface DonationStats {
  totalAllTime: number
  totalThisYear: number
  totalThisMonth: number
  totalThisWeek: number
  donationCountByFrequency: Record<string, number>
  avgAmount: number
  topDonors: Array<{ name: string; total: number }>
  monthlyTrend: Array<{ month: string; total: number; count: number }>
}

export default function DonationReportsPage() {
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/board/donations')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching donation stats:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/board/donations/export')
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `donations-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting donations:', error)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load donation statistics</p>
      </div>
    )
  }

  const maxMonthlyTotal = Math.max(...stats.monthlyTrend.map(m => m.total))

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Donation Reports</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive donation analytics and insights
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total All Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalAllTime.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Year</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalThisYear.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalThisMonth.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalThisWeek.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Donation Frequency */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Frequency</h2>
          <div className="space-y-3">
            {Object.entries(stats.donationCountByFrequency).map(([freq, count]) => (
              <div key={freq} className="flex items-center justify-between">
                <span className="text-gray-700">
                  {freq.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                </span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Donation */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Donation</h2>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600">
                ${stats.avgAmount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Per donation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Donors */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Donors</h2>
        <div className="space-y-2">
          {stats.topDonors.map((donor, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600">#{index + 1}</span>
                </div>
                <span className="text-gray-700">{donor.name}</span>
              </div>
              <span className="font-semibold text-gray-900">
                ${donor.total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend (Pure CSS Bar Chart) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trend (Last 12 Months)</h2>
        <div className="space-y-4">
          {stats.monthlyTrend.map((month, index) => {
            const percentage = maxMonthlyTotal > 0 ? (month.total / maxMonthlyTotal) * 100 : 0
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${month.total.toLocaleString()} ({month.count})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
