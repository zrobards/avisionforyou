'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, FolderOpen, ArrowLeft } from 'lucide-react'

const boardMenuItems = [
  { href: '/board', label: 'Board Home', icon: Home },
  { href: '/board/updates', label: 'Updates', icon: FileText },
  { href: '/board/documents', label: 'Documents', icon: FolderOpen },
]

interface BoardSidebarProps {
  collapsed?: boolean
  mobileOpen?: boolean
  onToggleCollapse?: () => void
  onCloseMobile?: () => void
}

export default function BoardSidebar({ collapsed = false, mobileOpen = false }: BoardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={`${
      collapsed ? 'w-20' : 'w-64'
    } bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 text-white h-full shadow-lg overflow-y-auto transition-all duration-300`}>
      <div className="px-4 py-6 h-full flex flex-col">
        {!collapsed && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Board Portal</h2>
            <p className="text-indigo-200 text-sm mt-1">AVFY Board Members</p>
          </div>
        )}
        
        <nav className="space-y-1 flex-1">
          {boardMenuItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && item.label}
              </Link>
            )
          })}
        </nav>

        {/* Back to Main Site */}
        {!collapsed && (
          <div className="pt-4 border-t border-white/20">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-indigo-100 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Main Site
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
