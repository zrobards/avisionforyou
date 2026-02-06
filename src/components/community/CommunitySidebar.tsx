'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, CheckCircle, Bell, BookOpen, ArrowLeft, Vote } from 'lucide-react'

const communityMenuItems = [
  { href: '/community', label: 'Dashboard', icon: Home },
  { href: '/community/meetings', label: 'Meetings & Groups', icon: Calendar },
  { href: '/community/my-rsvps', label: 'My RSVPs', icon: CheckCircle },
  { href: '/community/polls', label: 'Polls & Voting', icon: Vote },
  { href: '/community/announcements', label: 'Announcements', icon: Bell },
  { href: '/community/resources', label: 'Resources', icon: BookOpen },
]

export default function CommunitySidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white h-screen shadow-lg overflow-y-auto">
      <div className="px-4 py-6 h-full flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Community Portal</h2>
          <p className="text-green-200 text-sm mt-1">AVFY Alumni & Members</p>
        </div>
        
        <nav className="space-y-1 flex-1">
          {communityMenuItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-green-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Back to Main Site */}
        <div className="pt-4 border-t border-white/20">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-green-100 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Main Site
          </Link>
        </div>
      </div>
    </aside>
  )
}
