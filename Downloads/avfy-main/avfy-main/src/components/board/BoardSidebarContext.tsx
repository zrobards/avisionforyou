'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BoardSidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const BoardSidebarContext = createContext<BoardSidebarContextType | undefined>(undefined)

export function BoardSidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <BoardSidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </BoardSidebarContext.Provider>
  )
}

export function useBoardSidebar() {
  const context = useContext(BoardSidebarContext)
  if (context === undefined) {
    throw new Error('useBoardSidebar must be used within a BoardSidebarProvider')
  }
  return context
}
