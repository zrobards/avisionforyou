'use client'

import { useState } from 'react'
import CommunitySidebar from './CommunitySidebar'
import Footer from '@/components/layout/Footer'
import { Menu, X } from 'lucide-react'

export default function CommunityShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar - Fixed position */}
        <div className={`hidden lg:block fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}>
          <CommunitySidebar />
        </div>

        {/* Desktop toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:block fixed top-4 z-50 p-2 rounded-lg bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all duration-300"
          aria-label="Toggle sidebar"
          style={{ left: sidebarOpen ? '16px' : '16px' }}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Main content area with proper margin */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-green-600 text-white shadow-lg"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Community Portal</h1>
            </div>
          </header>

          <main className="flex-1 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <div className="w-full">
            <Footer />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed top-0 left-0 h-screen z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <CommunitySidebar />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
