'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Calendar, 
  FileText, 
  Heart, 
  BarChart3, 
  Mail, 
  Image, 
  Share2, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  UserPlus,
  AlertCircle,
  Activity
} from 'lucide-react'

interface DashboardStats {
  users: {
    total: number
    newThisMonth: number
    admins: number
  }
  donations: {
    total: number
    totalAmount: number
    thisMonth: number
    recurring: number
  }
  inquiries: {
    contact: number
    contactNew: number
    admission: number
    admissionPending: number
  }
  content: {
    blogPosts: number
    newsletters: number
    teamMembers: number
  }
}

export default function AdminOverview() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/data', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const adminSections = [
    { href: '/admin/users', label: 'Users', icon: Users, description: 'Manage user accounts and permissions', color: 'blue' },
    { href: '/admin/donations', label: 'Donations', icon: Heart, description: 'Track donations and campaigns', color: 'red' },
    { href: '/admin/contact', label: 'Contact Inquiries', icon: Mail, description: 'View contact form submissions', color: 'purple' },
    { href: '/admin/admissions', label: 'Admissions', icon: UserPlus, description: 'Manage admission inquiries', color: 'green' },
    { href: '/admin/meetings', label: 'Meetings', icon: Calendar, description: 'Schedule and manage meetings', color: 'orange' },
    { href: '/admin/blog', label: 'Blog', icon: FileText, description: 'Create and edit blog posts', color: 'pink' },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, description: 'Manage newsletters and subscribers', color: 'indigo' },
    { href: '/admin/content', label: 'Site Content', icon: FileText, description: 'Manage site-wide content and messaging', color: 'amber' },
    { href: '/admin/team', label: 'Team', icon: Users, description: 'Manage team member profiles', color: 'teal' },
    { href: '/admin/media', label: 'Media Library', icon: Image, description: 'Upload and organize media files', color: 'cyan' },
    { href: '/admin/social-stats', label: 'Social Stats', icon: Share2, description: 'Monitor social media metrics', color: 'violet' },
    { href: '/admin/social', label: 'Social Posts', icon: Share2, description: 'Manage social media posts', color: 'fuchsia' },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, description: 'View website analytics', color: 'slate' },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600 hover:shadow-blue-500/20',
      red: 'from-red-500 to-red-600 hover:shadow-red-500/20',
      purple: 'from-purple-500 to-purple-600 hover:shadow-purple-500/20',
      green: 'from-green-500 to-green-600 hover:shadow-green-500/20',
      orange: 'from-orange-500 to-orange-600 hover:shadow-orange-500/20',
      pink: 'from-pink-500 to-pink-600 hover:shadow-pink-500/20',
      indigo: 'from-indigo-500 to-indigo-600 hover:shadow-indigo-500/20',
      amber: 'from-amber-500 to-amber-600 hover:shadow-amber-500/20',
      teal: 'from-teal-500 to-teal-600 hover:shadow-teal-500/20',
      cyan: 'from-cyan-500 to-cyan-600 hover:shadow-cyan-500/20',
      violet: 'from-violet-500 to-violet-600 hover:shadow-violet-500/20',
      fuchsia: 'from-fuchsia-500 to-fuchsia-600 hover:shadow-fuchsia-500/20',
      slate: 'from-slate-500 to-slate-600 hover:shadow-slate-500/20'
    }
    return colors[color] || colors.purple
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-down">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}. Here's what's happening.</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
            {/* Total Users */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Total Users</h3>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
              <p className="text-sm text-gray-500 mt-2">
                +{stats.users.newThisMonth} this month
              </p>
            </div>

            {/* Total Donations */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Total Raised</h3>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.donations.totalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {stats.donations.total} donations
              </p>
            </div>

            {/* Contact Inquiries */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Contact Inquiries</h3>
                <Mail className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.inquiries.contact}</p>
              <p className="text-sm text-gray-500 mt-2">
                {stats.inquiries.contactNew} new
              </p>
            </div>

            {/* Admission Inquiries */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Admissions</h3>
                <UserPlus className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.inquiries.admission}</p>
              <p className="text-sm text-gray-500 mt-2">
                {stats.inquiries.admissionPending} pending
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
              <p className="text-sm font-medium text-green-900">Recurring Donations</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{stats.donations.recurring}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
              <p className="text-sm font-medium text-blue-900">Blog Posts</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{stats.content.blogPosts}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
              <p className="text-sm font-medium text-purple-900">Newsletters</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">{stats.content.newsletters}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4">
              <p className="text-sm font-medium text-orange-900">Team Members</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">{stats.content.teamMembers}</p>
            </div>
          </div>
        )}

        {/* Admin Sections Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminSections.map(section => {
              const Icon = section.icon
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getColorClasses(section.color)} rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-purple group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{section.label}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
