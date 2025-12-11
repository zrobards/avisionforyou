'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage('Thank you! Check your inbox to confirm your subscription.')
        setEmail('')
        
        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 5000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Stay Connected</h3>
          <p className="text-blue-100 text-sm">Get recovery resources and community updates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed' : 'Subscribe'}
          </button>
        </div>

        {message && (
          <p className={`text-sm ${status === 'error' ? 'text-red-200' : 'text-green-200'}`}>
            {message}
          </p>
        )}
      </form>

      <p className="text-xs text-blue-100 mt-3">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </div>
  )
}
