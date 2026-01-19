'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, FileText, Heart, BarChart3, Mail, Image, Share2, ArrowRight, GraduationCap } from 'lucide-react'

export default function AdminOverview() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const adminSections = [
    { href: '/admin/users', label: 'Users', icon: Users, description: 'Manage user accounts and permissions' },
    { href: '/admin/meetings', label: 'Meetings', icon: Calendar, description: 'Schedule and manage meetings' },
    { href: '/admin/media', label: 'Media Library', icon: Image, description: 'Upload and organize media files' },
    { href: '/admin/blog', label: 'Blog', icon: FileText, description: 'Create and edit blog posts' },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, description: 'Manage newsletters and subscribers' },
    { href: '/admin/team', label: 'Team', icon: Users, description: 'Manage team member profiles' },
    { href: '/admin/contact', label: 'Contact', icon: Mail, description: 'View contact form submissions' },
    { href: '/admin/donations', label: 'Donations', icon: Heart, description: 'Track donations and campaigns' },
    { href: '/admin/dui-classes', label: 'DUI Classes', icon: GraduationCap, description: 'Manage DUI education classes and registrations' },
    { href: '/admin/social-stats', label: 'Social Stats', icon: Share2, description: 'Monitor social media metrics' },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, description: 'View website analytics' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session?.user?.name}. Manage your organization here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map(section => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-brand-purple transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-purple group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{section.label}</h3>
              <p className="text-sm text-gray-600">{section.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
