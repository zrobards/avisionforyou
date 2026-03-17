'use client'

import { useState } from 'react'
import CommunitySidebar from './CommunitySidebar'
import Footer from '@/components/layout/Footer'
import { Menu, X } from 'lucide-react'

export default function CommunityShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar - Fixed position, below navbar */}
        <div className={`hidden lg:block fixed top-[80px] left-0 h-[calc(100vh-80px)] z-30 transition-all duration-300 ${
          isCollapsed ? 'w-0 overflow-hidden' : 'w-64'
        }`}>
          <CommunitySidebar />
        </div>

        {/* Desktop toggle button */}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className={`hidden lg:flex fixed top-[88px] z-30 items-center gap-2 rounded-lg p-2 bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all duration-300`}
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
              <h1 className="text-lg font-semibold text-gray-900">Community Portal</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full pt-16 lg:pt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
          <CommunitySidebar />
        </div>
      </div>
    </div>
  )
}
