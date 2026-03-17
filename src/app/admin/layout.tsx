'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Users, Calendar, FileText, Heart, BarChart3, Mail, LogOut, Home, Image, Share2, Briefcase, ChevronDown, ChevronRight, GraduationCap, UsersRound, ClipboardList, ArrowLeft } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/toast'
import Footer from '@/components/layout/Footer'

const adminMenuItems = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/meetings', label: 'Meetings', icon: Calendar },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/contact', label: 'Contact', icon: Mail },
  { href: '/admin/admissions', label: 'Admissions', icon: ClipboardList },
  { href: '/admin/donations', label: 'Donations', icon: Heart },
  { href: '/admin/dui-classes', label: 'DUI Classes', icon: GraduationCap },
  { href: '/admin/social-stats', label: 'Social Stats', icon: Share2 },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

const boardMenuItems = [
  { href: '/admin/board/updates', label: 'Board Updates' },
  { href: '/admin/board/documents', label: 'Board Documents' },
]

const communityMenuItems = [
  { href: '/admin/community/announcements', label: 'Announcements' },
  { href: '/admin/community/resources', label: 'Resources' },
  { href: '/admin/community/polls', label: 'Polls & Voting' },
]

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [boardMenuOpen, setBoardMenuOpen] = useState(false)
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Auto-expand menus if on relevant pages
  useEffect(() => {
    if (pathname?.startsWith('/admin/board')) {
      setBoardMenuOpen(true)
    }
    if (pathname?.startsWith('/admin/community')) {
      setCommunityMenuOpen(true)
    }
  }, [pathname])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      const userRole = session?.user?.role
      const isAdmin = userRole === 'ADMIN'

      if (!isAdmin) {
        router.push('/dashboard')
        return
      }

      setIsAuthorized(true)
    }
  }, [status, session, router])

  if (!isAuthorized) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
        </div>
      </ToastProvider>
    )
  }

  const SidebarContent = () => (
    <aside className="w-64 bg-gradient-to-b from-brand-purple via-purple-800 to-purple-900 text-white h-full shadow-lg overflow-y-auto">
      <div className="px-4 py-6 h-full flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Admin</h2>
          <p className="text-purple-200 text-sm mt-1">Dashboard</p>
        </div>

        <nav className="space-y-1 flex-1">
          {adminMenuItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}

          {/* Board Management Section */}
          <div className="pt-2">
            <button
              onClick={() => setBoardMenuOpen(!boardMenuOpen)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-purple-100 hover:text-white"
              aria-expanded={boardMenuOpen}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" aria-hidden="true" />
                Board
              </div>
              {boardMenuOpen ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {boardMenuOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {boardMenuItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-purple-100 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Community Management Section */}
          <div className="pt-2">
            <button
              onClick={() => setCommunityMenuOpen(!communityMenuOpen)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-purple-100 hover:text-white"
              aria-expanded={communityMenuOpen}
            >
              <div className="flex items-center gap-3">
                <UsersRound className="w-5 h-5" aria-hidden="true" />
                Community
              </div>
              {communityMenuOpen ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {communityMenuOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {communityMenuItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-purple-100 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer links */}
        <div className="pt-4 border-t border-white/20 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-purple-100 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Main Site
          </Link>
          <button
            onClick={async () => {
              await signOut({ redirect: false })
              router.push('/login')
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left text-purple-100 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <ToastProvider>
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar - Fixed position, below navbar */}
        <div className={`hidden lg:block fixed top-[80px] left-0 h-[calc(100vh-80px)] z-30 transition-all duration-300 ${
          isCollapsed ? 'w-0 overflow-hidden' : 'w-64'
        }`}>
          <SidebarContent />
        </div>

        {/* Desktop toggle button */}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className={`hidden lg:flex fixed top-[88px] z-30 items-center gap-2 rounded-lg p-2 bg-brand-purple text-white shadow-lg hover:bg-purple-800 transition-all duration-300`}
          aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
          style={{ left: isCollapsed ? '24px' : '272px' }}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>

        {/* Main content area with proper margin */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'lg:ml-0' : 'lg:ml-64'
        }`}>
          {/* Mobile Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 lg:hidden shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
                Menu
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full">
            <div className="min-h-[calc(100vh-4rem)]">
              {children}
            </div>
          </main>

          {/* Footer */}
          <div className="w-full">
            <Footer />
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed top-[80px] left-0 h-[calc(100vh-80px)] z-40 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <SidebarContent />
        </div>
      </div>
    </div>
    </ToastProvider>
  )
}
