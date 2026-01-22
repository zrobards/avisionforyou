'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, CheckCircle, Bell, BookOpen, ArrowLeft, Vote, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCommunitySidebar } from './CommunitySidebarContext'

const communityMenuItems = [
  { href: '/community', label: 'Dashboard', icon: Home },
  { href: '/community/meetings', label: 'Meetings', icon: Calendar },
  { href: '/community/my-rsvps', label: 'My RSVPs', icon: CheckCircle },
  { href: '/community/polls', label: 'Polls & Voting', icon: Vote },
  { href: '/community/announcements', label: 'Announcements', icon: Bell },
  { href: '/community/resources', label: 'Resources', icon: BookOpen },
]

export default function CommunitySidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useCommunitySidebar()
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-collapse on mobile
      if (mobile && !isCollapsed) {
        setIsCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('communitySidebarCollapsed')
    if (saved !== null && !isMobile) {
      setIsCollapsed(saved === 'true')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  // Save preference to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('communitySidebarCollapsed', String(newState))
  }

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white min-h-screen fixed left-0 top-0 shadow-lg transition-all duration-300 ease-in-out z-50`}
    >
      <div className="px-4 py-6 h-full flex flex-col">
        {/* Header with Toggle Button */}
        <div className="mb-8 relative">
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-0 bg-green-700 hover:bg-green-600 rounded-full p-1.5 shadow-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
          
          {!isCollapsed && (
            <>
              <h2 className="text-2xl font-bold text-white">Community Portal</h2>
              <p className="text-green-200 text-sm mt-1">AVFY Alumni & Members</p>
            </>
          )}
        </div>
        
        <nav className="space-y-1 flex-1">
          {communityMenuItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
                } py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-green-100 hover:bg-white/10 hover:text-white'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Back to Main Site */}
        <div className="pt-4 border-t border-white/20">
          <Link
            href="/"
            className={`flex items-center ${
              isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
            } py-3 rounded-lg hover:bg-white/10 transition-colors text-green-100 hover:text-white`}
            title={isCollapsed ? 'Back to Main Site' : undefined}
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Back to Main Site</span>}
          </Link>
        </div>
      </div>
    </aside>
  )
}
