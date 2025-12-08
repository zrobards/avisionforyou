'use client'

import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import { Chrome, Heart, ArrowRight, Lock } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl)
    }
  }, [status, session, router, callbackUrl])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl })
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result?.error) {
        setError('Invalid credentials. Please try again.')
        setLoading(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }   {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-white">A Vision For You</span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-slate-400 text-sm">New to our community?</p>
            <Link 
              href="/" 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
            >
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-16">
        {/* Card */}
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your recovery journey</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Lock className="w-5 h-5" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-6">
            <p className="text-xs text-slate-400 text-center">
              🔐 Your data is encrypted and secure. For demo: use any email/password.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-blue-400 text-center mt-2">
                💡 Tip: Use <code className="bg-slate-800 px-1 py-0.5 rounded">zacharyrobards@gmail.com</code> for admin access
              </p>
            )}
          </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Contact us
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">100%</div>
            <p className="text-xs text-slate-400 mt-1">Secure</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">Free</div>
            <p className="text-xs text-slate-400 mt-1">To Join</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">24/7</div>
            <p className="text-xs text-slate-400 mt-1">Support</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-400"></div></div>}>
      <LoginContent />
    </Suspense>
  )
}
