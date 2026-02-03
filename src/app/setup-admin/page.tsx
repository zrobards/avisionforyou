'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function SetupAdmin() {
  const [email, setEmail] = useState('admin@avisionforyou.org')
  const [password, setPassword] = useState('AdminPassword123!')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleCreateAdmin = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/seed/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Admin user created successfully! You can now log in.' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create admin user' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-brand-purple mb-2">Admin Setup</h1>
        <p className="text-gray-600 mb-6">Create or reset the admin account</p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              placeholder="admin@avisionforyou.org"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              placeholder="Enter strong password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password should be at least 12 characters with numbers and special characters
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateAdmin}
          disabled={loading || !email || !password}
          className="w-full px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-green text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Admin User'
          )}
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            After creating admin user, go to{' '}
            <a href="/login" className="text-brand-purple font-semibold hover:text-purple-700">
              Login Page
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
