'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useSidebar } from './SidebarContext'

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  
  // Don't show sidebar on dashboard/admin routes, auth pages, or login
  const isDashboardRoute = pathname?.startsWith('/client') || 
                           pathname?.startsWith('/admin') || 
                           pathname === '/login' ||
                           pathname === '/register' ||
                           pathname === '/forgot-password' ||
                           pathname === '/reset-password' ||
                           pathname?.startsWith('/onboarding') ||
                           pathname?.startsWith('/questionnaire')

  if (isDashboardRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Sidebar />
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
      >
        <main 
          id="main-content" 
          className="flex-grow"
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

