import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center px-6 py-12 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-700 text-lg mb-2">
          You don't have permission to access this page.
        </p>
        
        <p className="text-gray-600 mb-8">
          If you believe this is an error, please contact an administrator.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-brand-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Return to Home
          </Link>
          
          <Link 
            href="/dashboard" 
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
