'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  DollarSign, Users, TrendingUp, TrendingDown, Calendar, BarChart3,
  Target, AlertCircle, CheckCircle, Info, ArrowUpRight, ArrowDownRight,
  Heart, Mail, BookOpen, UserCheck, RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsersLast30Days: number
    newUsersLast30Days: number
    userGrowthRate: number
    retentionRate: number
    userGrowthTrend: { month: string; count: number }[]
  }
  donations: {
    total: number
    last30Days: number
    totalAmount: number
    amountLast30Days: number
    averageDonation: number
    conversionRate: number
    recurringDonors: number
    growthRate: number
    donationTrend: { month: string; amount: number; count: number }[]
    donationMethods: { method: string; count: number; amount: number }[]
    topDonors: { name: string; amount: number; count: number }[]
  }
  engagement: {
    totalMeetings: number
    upcomingMeetings: number
    totalRSVPs: number
    rsvpsLast30Days: number
    attendanceRate: number
    avgRSVPsPerUser: number
    popularMeetings: { id: string; title: string; startDate: string; _count: { rsvps: number } }[]
  }
  programs: {
    assessmentsCompleted: number
    programInterest: { program: string; count: number }[]
  }
  admissions: {
    totalInquiries: number
    inquiriesLast30Days: number
    responseRate: number
  }
  content: {
    totalBlogPosts: number
    totalBlogViews: number
    avgViewsPerPost: number
  }
  funnel: {
    assessmentCompleted: number
    assessmentToRSVP: number
    rsvpToDonation: number
    assessmentToRSVPRate: number
    rsvpToDonationRate: number
  }
  insights: { type: string; title: string; message: string }[]
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'purple' }: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: number
  trendLabel?: string
  color?: 'purple' | 'green' | 'blue' | 'orange' | 'red'
}) {
  const colorMap = {
    purple: 'from-brand-purple to-purple-700',
    green: 'from-green-600 to-green-700',
    blue: 'from-blue-600 to-blue-700',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      {trendLabel && <p className="text-xs text-gray-400 mt-0.5">{trendLabel}</p>}
    </div>
  )
}

function SimpleBarChart({ data, labelKey, valueKey, prefix = '', color = 'bg-brand-purple' }: {
  data: any[]
  labelKey: string
  valueKey: string
  prefix?: string
  color?: string
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20 text-right flex-shrink-0">{item[labelKey]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
            <div
              className={`${color} h-full rounded-full transition-all duration-500`}
              style={{ width: `${Math.max((item[valueKey] / max) * 100, 2)}%` }}
            />
            <span className="absolute inset-0 flex items-center px-3 text-xs font-semibold text-gray-700">
              {prefix}{typeof item[valueKey] === 'number' && item[valueKey] % 1 !== 0
                ? item[valueKey].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : item[valueKey].toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function FunnelStep({ label, value, rate, isLast = false }: {
  label: string
  value: number
  rate?: number
  isLast?: boolean
}) {
  return (
    <div className="flex-1 text-center">
      <div className="bg-gradient-to-b from-purple-100 to-purple-50 rounded-xl p-4 border border-purple-200">
        <p className="text-2xl font-bold text-brand-purple">{value}</p>
        <p className="text-xs text-gray-600 mt-1">{label}</p>
      </div>
      {!isLast && rate !== undefined && (
        <div className="my-2 text-xs font-semibold text-gray-500">
          → {rate}% →
        </div>
      )}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchAnalytics()
      const interval = setInterval(fetchAnalytics, 60000)
      return () => clearInterval(interval)
    }
  }, [status])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const json = await res.json()
      setData(json)
      setError('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Failed to load analytics</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const programLabels: Record<string, string> = {
    SURRENDER_PROGRAM: 'Surrender Program',
    MINDBODYSOUL_IOP: 'MindBodySoul IOP',
    MOVING_MOUNTAINS: 'Housing & Shelter',
    DUI_CLASSES: 'DUI Education',
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Organization performance at a glance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* AI Insights */}
      {data.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.insights.map((insight, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${
              insight.type === 'success' ? 'bg-green-50 border-green-200' :
              insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              {insight.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> :
               insight.type === 'warning' ? <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" /> :
               <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${data.donations.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
          trend={data.donations.growthRate}
          trendLabel="vs last 30 days"
        />
        <StatCard
          title="Total Users"
          value={data.overview.totalUsers.toLocaleString()}
          subtitle={`${data.overview.newUsersLast30Days} new this month`}
          icon={Users}
          color="purple"
          trend={data.overview.userGrowthRate}
        />
        <StatCard
          title="Active Users (30d)"
          value={data.overview.activeUsersLast30Days.toLocaleString()}
          subtitle={`${data.overview.retentionRate}% retention rate`}
          icon={UserCheck}
          color="blue"
        />
        <StatCard
          title="Avg Donation"
          value={`$${data.donations.averageDonation.toFixed(2)}`}
          subtitle={`${data.donations.conversionRate}% conversion rate`}
          icon={Heart}
          color="orange"
        />
      </div>

      {/* Donation & User Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trend */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Donation Trend</h2>
          <p className="text-xs text-gray-500 mb-4">Monthly revenue over last 6 months</p>
          <SimpleBarChart
            data={data.donations.donationTrend}
            labelKey="month"
            valueKey="amount"
            prefix="$"
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{data.donations.total}</p>
              <p className="text-xs text-gray-500">Total Donations</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{data.donations.last30Days}</p>
              <p className="text-xs text-gray-500">Last 30 Days</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{data.donations.recurringDonors}</p>
              <p className="text-xs text-gray-500">Recurring Donors</p>
            </div>
          </div>
        </div>

        {/* User Growth Trend */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">User Growth</h2>
          <p className="text-xs text-gray-500 mb-4">New users per month over last 6 months</p>
          <SimpleBarChart
            data={data.overview.userGrowthTrend}
            labelKey="month"
            valueKey="count"
            color="bg-gradient-to-r from-brand-purple to-purple-600"
          />
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{data.overview.totalUsers}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{data.overview.newUsersLast30Days}</p>
              <p className="text-xs text-gray-500">New This Month</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{data.overview.retentionRate}%</p>
              <p className="text-xs text-gray-500">90-Day Retention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Breakdown & Top Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Methods */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Donation Breakdown</h2>
          {data.donations.donationMethods.length > 0 ? (
            <div className="space-y-4">
              {data.donations.donationMethods.map((method, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{method.method}</p>
                    <p className="text-xs text-gray-500">{method.count} donation{method.count !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-lg font-bold text-green-700">
                    ${method.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No donations yet</p>
          )}
        </div>

        {/* Top Donors */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Donors</h2>
          {data.donations.topDonors.length > 0 ? (
            <div className="space-y-3">
              {data.donations.topDonors.slice(0, 5).map((donor, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{donor.name}</p>
                      <p className="text-xs text-gray-500">{donor.count} donation{donor.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">${donor.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No donors yet</p>
          )}
        </div>
      </div>

      {/* Engagement & Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Metrics */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-brand-purple" />
            <h2 className="text-lg font-bold text-gray-900">Engagement</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Meetings</span>
              <span className="font-bold text-gray-900">{data.engagement.totalMeetings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Upcoming</span>
              <span className="font-bold text-green-700">{data.engagement.upcomingMeetings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total RSVPs</span>
              <span className="font-bold text-gray-900">{data.engagement.totalRSVPs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">RSVPs (30d)</span>
              <span className="font-bold text-blue-700">{data.engagement.rsvpsLast30Days}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Attendance Rate</span>
              <span className="font-bold text-brand-purple">{data.engagement.attendanceRate}%</span>
            </div>
          </div>
        </div>

        {/* Program Interest */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-brand-purple" />
            <h2 className="text-lg font-bold text-gray-900">Program Interest</h2>
          </div>
          {data.programs.programInterest.length > 0 ? (
            <SimpleBarChart
              data={data.programs.programInterest.map(p => ({
                ...p,
                program: programLabels[p.program] || p.program
              }))}
              labelKey="program"
              valueKey="count"
              color="bg-gradient-to-r from-brand-green to-green-600"
            />
          ) : (
            <p className="text-gray-500 text-sm">No assessments completed yet</p>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Assessments</span>
              <span className="font-bold text-gray-900">{data.programs.assessmentsCompleted}</span>
            </div>
          </div>
        </div>

        {/* Admissions & Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-brand-purple" />
            <h2 className="text-lg font-bold text-gray-900">Outreach</h2>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Admission Inquiries</p>
              <div className="flex justify-between items-end">
                <p className="text-xl font-bold text-gray-900">{data.admissions.totalInquiries}</p>
                <p className="text-sm text-brand-purple font-semibold">{data.admissions.inquiriesLast30Days} this month</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{data.admissions.responseRate}% response rate</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Content Performance</p>
              <div className="flex justify-between items-end">
                <p className="text-xl font-bold text-gray-900">{data.content.totalBlogPosts}</p>
                <p className="text-sm text-green-700 font-semibold">posts published</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{data.content.totalBlogViews.toLocaleString()} total views ({data.content.avgViewsPerPost} avg/post)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-brand-purple" />
          <h2 className="text-lg font-bold text-gray-900">Conversion Funnel</h2>
          <p className="text-xs text-gray-500 ml-2">Assessment → RSVP → Donation pipeline</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <div className="flex-1 w-full text-center bg-gradient-to-b from-purple-100 to-purple-50 rounded-xl p-4 border border-purple-200">
            <p className="text-2xl font-bold text-brand-purple">{data.funnel.assessmentCompleted}</p>
            <p className="text-xs text-gray-600 mt-1">Assessments Completed</p>
          </div>
          <div className="text-sm font-semibold text-gray-400 hidden sm:block">→ {data.funnel.assessmentToRSVPRate}% →</div>
          <div className="text-xs font-semibold text-gray-400 sm:hidden">{data.funnel.assessmentToRSVPRate}% ↓</div>
          <div className="flex-1 w-full text-center bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-2xl font-bold text-blue-700">{data.funnel.assessmentToRSVP}</p>
            <p className="text-xs text-gray-600 mt-1">RSVPed to Meeting</p>
          </div>
          <div className="text-sm font-semibold text-gray-400 hidden sm:block">→ {data.funnel.rsvpToDonationRate}% →</div>
          <div className="text-xs font-semibold text-gray-400 sm:hidden">{data.funnel.rsvpToDonationRate}% ↓</div>
          <div className="flex-1 w-full text-center bg-gradient-to-b from-green-100 to-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-2xl font-bold text-green-700">{data.funnel.rsvpToDonation}</p>
            <p className="text-xs text-gray-600 mt-1">Made a Donation</p>
          </div>
        </div>
      </div>

      {/* Popular Meetings */}
      {data.engagement.popularMeetings.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Most Popular Meetings</h2>
          <div className="space-y-3">
            {data.engagement.popularMeetings.map((meeting, i) => (
              <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{meeting.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(meeting.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-purple">{meeting._count.rsvps}</p>
                  <p className="text-xs text-gray-500">RSVPs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
