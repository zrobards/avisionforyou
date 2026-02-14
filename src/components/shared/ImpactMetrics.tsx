'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, DollarSign, Heart } from 'lucide-react'

interface MetricsData {
  totalMeetings: number
  totalRSVPs: number
  totalDonations: number
  livesImpacted: number
}

export default function ImpactMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalMeetings: 0,
    totalRSVPs: 0,
    totalDonations: 0,
    livesImpacted: 0
  })
  const [loading, setLoading] = useState(true)
  const [displayMetrics, setDisplayMetrics] = useState<MetricsData>({
    totalMeetings: 0,
    totalRSVPs: 0,
    totalDonations: 0,
    livesImpacted: 0
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/public/impact')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Failed to load metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  // Animate counters (skip animation if user prefers reduced motion)
  useEffect(() => {
    if (loading) return

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDisplayMetrics(metrics)
      return
    }

    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setDisplayMetrics({
        totalMeetings: Math.floor(metrics.totalMeetings * progress),
        totalRSVPs: Math.floor(metrics.totalRSVPs * progress),
        totalDonations: Math.floor(metrics.totalDonations * progress),
        livesImpacted: Math.floor(metrics.livesImpacted * progress)
      })

      if (currentStep >= steps) {
        setDisplayMetrics(metrics)
        clearInterval(interval)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [metrics, loading])

  const impactCards = [
    {
      icon: Calendar,
      label: 'Meetings Hosted',
      value: displayMetrics.totalMeetings.toLocaleString(),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Users,
      label: 'Community Members',
      value: displayMetrics.totalRSVPs.toLocaleString(),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: DollarSign,
      label: 'Total Donations',
      value: `$${displayMetrics.totalDonations.toLocaleString()}`,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Heart,
      label: 'Lives Impacted',
      value: displayMetrics.livesImpacted.toLocaleString() + '+',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Impact in Numbers</h2>
          <p className="text-xl text-gray-600">Building a community of recovery and hope</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {impactCards.map(({ icon: Icon, label, value, color, bgColor }) => (
            <div
              key={label}
              className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
            >
              <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${color} rounded-full flex items-center justify-center shadow-md`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
                {value}
              </p>
              <p className="text-sm font-semibold text-gray-600 text-center">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Every donation, every meeting attendance, every shared story creates lasting change
          </p>
          <a
            href="/donate"
            className="inline-block px-8 py-4 bg-gradient-to-r from-brand-purple to-brand-green text-white font-bold rounded-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Join Our Mission
          </a>
        </div>
      </div>
    </section>
  )
}
