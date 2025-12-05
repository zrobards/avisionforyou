'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, CheckCircle, AlertCircle, Download } from 'lucide-react'

export default function SeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status])

  const createTestData = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to seed data')
      }
    } catch (err) {
      setError('Error seeding database: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-500" />
                Database Seed Tool
              </h1>
              <p className="text-slate-400 mt-1">Create test data for development</p>
            </div>
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Create Test Data</h2>
            <p className="text-slate-300 mb-6">
              This will populate your database with realistic test data including:
            </p>
            <ul className="grid md:grid-cols-2 gap-3">
              {[
                '✓ 5 test user accounts',
                '✓ 12 program sessions/meetings',
                '✓ 20 donations (various amounts)',
                '✓ User assessments with program matches',
                '✓ RSVPs for meetings',
                '✓ 3 blog posts'
              ].map((item, i) => (
                <li key={i} className="text-slate-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={createTestData}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                Creating test data...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
                Create Test Data
              </span>
            )}
          </button>

          {error && (
            <div className="mt-8 bg-red-500/20 border border-red-500 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-300 mb-1">Error</h3>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8 bg-green-500/20 border border-green-500 rounded-lg p-6">
              <div className="flex gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-300 text-lg">Success!</h3>
                  <p className="text-green-200 text-sm mt-1">Test data has been created</p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 mt-4 text-sm">
                <h4 className="font-semibold text-green-300 mb-3">Test Accounts:</h4>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Admin:</span>
                    <span className="font-mono text-green-400">admin@avisionforyou.org</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Password:</span>
                    <span className="font-mono text-green-400">AdminPassword123!</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-slate-400 mb-2">Test Users:</p>
                    <div className="space-y-1 text-slate-400">
                      <p className="font-mono text-sm">john@example.com</p>
                      <p className="font-mono text-sm">sarah@example.com</p>
                      <p className="font-mono text-sm">michael@example.com</p>
                      <p className="font-mono text-sm">jessica@example.com</p>
                      <p className="font-mono text-sm">david@example.com</p>
                      <p className="text-slate-500 text-xs mt-2">Password for all: TestPassword123!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Users Created', value: result.usersCreated || 5 },
                  { label: 'Meetings Created', value: result.meetingsCreated || 12 },
                  { label: 'Donations Created', value: result.donationsCreated || 20 }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-green-400">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-700">
            <h3 className="font-semibold text-white mb-4">Next Steps:</h3>
            <ol className="space-y-2 text-slate-300 text-sm">
              <li><span className="font-semibold">1.</span> Log in with one of the test accounts above</li>
              <li><span className="font-semibold">2.</span> Visit /dashboard to see your meetings</li>
              <li><span className="font-semibold">3.</span> Take the assessment at /assessment</li>
              <li><span className="font-semibold">4.</span> Visit /admin to see user management</li>
              <li><span className="font-semibold">5.</span> Visit /admin/donations to see donation tracking</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
