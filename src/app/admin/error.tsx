'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">An error occurred in the admin panel. Please try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
