'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  Download, 
  Filter, 
  Search, 
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Heart,
  ArrowLeft
} from 'lucide-react'

interface Donation {
  id: string
  amount: number
  currency: string
  frequency: string
  status: string
  email?: string
  name?: string
  comment?: string
  createdAt: string
  user?: {
    id: string
    email: string
    name?: string
  }
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

export default function AdminDonations() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<Record<string, number>[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFrequency, setFilterFrequency] = useState('all')

  const fetchDonations = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/donations')
      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations)
        setStats(data.stats)
        setMonthlyData(data.monthlyDonations)
      } else if (response.status === 403) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchDonations()
    }
  }, [status, router, fetchDonations])

  usePolling(fetchDonations, 30000, status === 'authenticated')

  const filteredDonations = donations.filter(d => {
    const matchesSearch = !searchTerm || 
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || d.status.toLowerCase() === filterStatus
    const matchesFrequency = filterFrequency === 'all' || d.frequency.toLowerCase() === filterFrequency.toLowerCase()
    
    return matchesSearch && matchesStatus && matchesFrequency
  })

  const downloadCSV = () => {
    if (donations.length === 0) return

    const headers = ['Date', 'Name', 'Email', 'Amount', 'Currency', 'Frequency', 'Status', 'Comment']
    const rows = donations.map(d => [
      new Date(d.createdAt).toLocaleDateString(),
      d.name || 'Anonymous',
      d.email || 'N/A',
      d.amount,
      d.currency,
      d.frequency,
      d.status,
      d.comment || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 backdrop-blur-sm animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Heart className="w-8 h-8 text-red-500" />
                  Donations Tracking
                </h1>
                <p className="text-slate-400 mt-1">Professional donation management and reporting</p>
              </div>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover-scale"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 animate-stagger">
            {/* Total Amount */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-semibold">Total Raised</h3>
                  <DollarSign className="w-6 h-6 text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-bold text-white">${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-slate-500 mt-2">{stats.totalDonations} donations</p>
              </div>
            </div>

            {/* Average Donation */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-semibold">Average Donation</h3>
                  <TrendingUp className="w-6 h-6 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-bold text-white">${stats.averageDonation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-slate-500 mt-2">Per donation</p>
              </div>
            </div>

            {/* Recurring Revenue */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-semibold">Monthly Recurring</h3>
                  <CheckCircle className="w-6 h-6 text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-bold text-white">${stats.totalRecurring.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-slate-500 mt-2">{stats.recurringDonations} recurring</p>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-semibold">Success Rate</h3>
                  <CheckCircle className="w-6 h-6 text-orange-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {stats.totalDonations > 0 
                    ? Math.round((stats.completedDonations / stats.totalDonations) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-slate-500 mt-2">{stats.completedDonations} completed</p>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-12 animate-stagger">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all">
              <p className="text-slate-400 text-xs font-semibold mb-2">One-Time</p>
              <p className="text-2xl font-bold text-white">{stats.oneTimeDonations}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all">
              <p className="text-slate-400 text-xs font-semibold mb-2">Recurring</p>
              <p className="text-2xl font-bold text-white">{stats.recurringDonations}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all">
              <p className="text-slate-400 text-xs font-semibold mb-2">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingDonations}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all">
              <p className="text-slate-400 text-xs font-semibold mb-2">Failed</p>
              <p className="text-2xl font-bold text-red-400">{stats.failedDonations}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all">
              <p className="text-slate-400 text-xs font-semibold mb-2">Anonymous</p>
              <p className="text-2xl font-bold text-slate-300">{stats.anonymousDonations}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-8 bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 backdrop-blur-sm animate-slide-up">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
              <Search className="w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white placeholder-slate-500 outline-none flex-1"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <select
                value={filterFrequency}
                onChange={(e) => setFilterFrequency(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="ONE_TIME">One-Time</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <p className="text-sm text-slate-400">
              Showing {filteredDonations.length} of {donations.length} donations
            </p>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden backdrop-blur-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Donor</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((donation, index) => (
                    <tr 
                      key={donation.id}
                      className="hover:bg-slate-800/50 transition-colors duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-white">{donation.name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500">{donation.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm font-semibold text-white">
                        ${donation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          donation.frequency === 'ONE_TIME'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}>
                          {donation.frequency === 'ONE_TIME' ? 'One-Time' : donation.frequency}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 w-fit ${
                          donation.status === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-300'
                            : donation.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {donation.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                          {donation.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {donation.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                        {donation.comment || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-8 text-center text-slate-400">
                      No donations found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
