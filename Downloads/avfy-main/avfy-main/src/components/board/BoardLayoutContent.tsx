'use client'

import { useBoardSidebar } from './BoardSidebarContext'
import { ReactNode } from 'react'

export default function BoardLayoutContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useBoardSidebar()

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
