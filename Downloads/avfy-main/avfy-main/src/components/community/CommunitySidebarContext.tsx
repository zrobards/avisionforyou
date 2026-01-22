'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CommunitySidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const CommunitySidebarContext = createContext<CommunitySidebarContextType | undefined>(undefined)

export function CommunitySidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <CommunitySidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </CommunitySidebarContext.Provider>
  )
}

export function useCommunitySidebar() {
  const context = useContext(CommunitySidebarContext)
  if (context === undefined) {
    throw new Error('useCommunitySidebar must be used within a CommunitySidebarProvider')
  }
  return context
}
