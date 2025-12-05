'use client'

import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import { Chrome, Heart, ArrowRight } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('zacharyrobards@gmail.com')
  const [password, setPassword] = useState('demo')
  const [demoMode, setDemoMode] = useState(true)

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
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
  }

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
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
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your recovery journey</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setDemoMode(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                demoMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => setDemoMode(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                !demoMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              Google
            </button>
          </div>

          {demoMode ? (
            <>
              {/* Demo Form */}
              <form onSubmit={handleDemoSignIn} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 block mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Demo Credentials Info */}
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mt-4">
                <p className="text-xs text-amber-200">
                  <strong>Demo Credentials:</strong><br/>
                  Email: zacharyrobards@gmail.com<br/>
                  Password: demo
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white text-slate-900 font-bold py-4 px-6 rounded-lg hover:bg-slate-50 disabled:bg-slate-300 transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <Chrome className="w-5 h-5" />
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>

              {/* Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-6">
                <p className="text-xs text-slate-400 text-center">
                  We use Google to securely authenticate your account. Your data is stored safely in our system.
                </p>
              </div>
            </>
          )}

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
