'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { id, type, message }
    
    setToasts(prev => [...prev, newToast])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5" />
      case 'error': return <XCircle className="w-5 h-5" />
      case 'warning': return <AlertCircle className="w-5 h-5" />
      case 'info': return <Info className="w-5 h-5" />
    }
  }

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-green-600 text-white'
      case 'error': return 'bg-red-600 text-white'
      case 'warning': return 'bg-yellow-600 text-white'
      case 'info': return 'bg-blue-600 text-white'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${getStyles(toast.type)} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in pointer-events-auto`}
          >
            {getIcon(toast.type)}
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
