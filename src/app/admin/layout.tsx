'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Users, Calendar, FileText, Heart, BarChart3, Mail, LogOut, Home, Image } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/toast'

const adminMenuItems = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/meetings', label: 'Meetings', icon: Calendar },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/contact', label: 'Contact', icon: Mail },
  { href: '/admin/donations', label: 'Donations', icon: Heart },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <ToastProvider>
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-56' : 'w-0'
        } bg-gradient-to-b from-brand-purple via-purple-800 to-purple-900 text-white transition-all duration-300 overflow-hidden fixed h-screen z-40 shadow-lg`}
      >
        <div className="px-4 py-4 h-full flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Admin</h2>
            <p className="text-purple-200 text-xs mt-0.5">Dashboard</p>
          </div>
          <nav className="space-y-0.5 flex-1">
            {adminMenuItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/20 transition-colors text-xs font-medium text-white/90 hover:text-white"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="pt-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/20 transition-colors text-xs w-full text-left font-medium text-white/90 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-56' : 'ml-0'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30 h-16 flex items-center">
          <div className="flex items-center justify-between px-6 w-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
    </ToastProvider>
  )
}

