'use client'

import { useCommunitySidebar } from './CommunitySidebarContext'
import { ReactNode } from 'react'

export default function CommunityLayoutContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useCommunitySidebar()

  return (
    <main 
      className={`flex-1 p-8 transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}
    >
      {children}
    </main>
  )
}
