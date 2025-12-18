'use client'

import Link from 'next/link'
import { Users, Calendar, BarChart3, Heart, ArrowLeft } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-6 border-b border-purple-700 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-purple-100">{subtitle}</p>}
          </div>
          <Link href="/admin" className="flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors border border-white/30">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link href="/admin" className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
            <Users className="w-4 h-4" />
            Users
          </Link>
          <Link href="/admin/meetings" className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
            <Calendar className="w-4 h-4" />
            Meetings
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
            <BarChart3 className="w-4 h-4" />
            Blog
          </Link>
          <Link href="/admin/team" className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
            <Users className="w-4 h-4" />
            Team
          </Link>
          <Link href="/admin/contact" className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
            <Calendar className="w-4 h-4" />
            Contact
          </Link>
          <Link href="/admin/donations" className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
            <Heart className="w-4 h-4" />
            Donations
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm ml-auto border border-white/30">
            <ArrowLeft className="w-4 h-4" />
            User Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}
