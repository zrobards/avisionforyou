'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Users, Heart, Award, CheckCircle, Download, Target, Clock, Home, Briefcase } from 'lucide-react'

interface ImpactMetrics {
  totalMeetings: number
  totalRSVPs: number
  totalDonations: number
  livesImpacted: number
}

export default function ImpactPage() {
  const [metrics, setMetrics] = useState<ImpactMetrics>({
    totalMeetings: 0,
    totalRSVPs: 0,
    totalDonations: 0,
    livesImpacted: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/public/impact')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  const programOutcomes = [
    {
      program: 'Surrender Program',
      completion: 87,
      retention: 95,
      description: '6-9 month residential program with comprehensive support',
      outcomes: [
        'Housing stability maintained by 89% of graduates',
        'Employment secured within 90 days for 76% of graduates',
        'Average sobriety length: 14 months post-graduation'
      ]
    },
    {
      program: 'MindBodySoul IOP',
      completion: 82,
      retention: 88,
      description: 'Intensive outpatient clinical program',
      outcomes: [
        '83% complete full treatment plan',
        '72% maintain employment throughout program',
        '91% report improved mental health outcomes'
      ]
    },
    {
      program: 'Moving Mountains Ministry',
      completion: 79,
      retention: 85,
      description: 'Faith-based recovery support',
      outcomes: [
        '94% report increased spiritual connection',
        '68% transition to long-term housing',
        'Average program engagement: 8.5 months'
      ]
    }
  ]

  const testimonials = [
    {
      name: 'Josh J.',
      program: 'Surrender Program',
      outcome: 'Sober for 2+ years, Employed full-time',
      quote: 'A Vision For You gave me structure when I had none. The Surrender program saved my life. I came in hopeless, and left with a job, a support system, and real tools for staying sober.',
      stats: { beforeProgram: 'Homeless, Unemployed', afterProgram: 'Housed, Employed, 24+ months sober' }
    },
    {
      name: 'Laura F.',
      program: 'MindBodySoul IOP',
      outcome: 'Managing mental health, 18 months sober',
      quote: 'The clinical team at MindBodySoul helped me address my depression alongside my addiction. I finally understand the connection and have tools to manage both.',
      stats: { beforeProgram: 'Daily substance use, No mental health treatment', afterProgram: 'Stable housing, Ongoing therapy, 18 months sober' }
    },
    {
      name: 'Marcus T.',
      program: 'Moving Mountains',
      outcome: 'Faith-centered recovery, 14 months sober',
      quote: 'The spiritual foundation I found through Moving Mountains gave me purpose beyond just staying sober. I\'m part of a community that holds me accountable with love.',
      stats: { beforeProgram: 'Lost family connections', afterProgram: 'Reunited with children, Active community member' }
    }
  ]

  const keyMetrics = [
    {
      icon: CheckCircle,
      label: 'Overall Success Rate',
      value: '83%',
      description: 'Of participants complete their chosen program',
      color: 'from-brand-green to-green-600'
    },
    {
      icon: Clock,
      label: 'Average Retention',
      value: '89%',
      description: 'Participants remain engaged throughout program',
      color: 'from-brand-purple to-purple-600'
    },
    {
      icon: Home,
      label: 'Housing Stability',
      value: '78%',
      description: 'Graduates maintain stable housing at 1 year',
      color: 'from-brand-green to-green-600'
    },
    {
      icon: Briefcase,
      label: 'Employment Rate',
      value: '72%',
      description: 'Program graduates employed within 90 days',
      color: 'from-brand-purple to-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-full mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Our Impact</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Measuring what matters: Real outcomes, real lives transformed through evidence-based recovery programs
            </p>
          </div>
        </div>
      </section>

      {/* Live Metrics Dashboard */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Real-Time Community Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Community Members', value: metrics.livesImpacted, icon: Users },
              { label: 'Support Meetings', value: metrics.totalMeetings, icon: Heart },
              { label: 'Member Connections', value: metrics.totalRSVPs, icon: CheckCircle },
              { label: 'Community Support Raised', value: `$${metrics.totalDonations.toLocaleString()}`, icon: Award }
            ].map((metric, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-green-50 rounded-xl p-6 text-center shadow-lg border-2 border-brand-purple">
                <metric.icon className="w-12 h-12 mx-auto mb-4 text-brand-purple" />
                <div className="text-4xl font-bold text-brand-purple mb-2">
                  {loading ? '...' : metric.value}
                </div>
                <p className="text-gray-700 font-semibold">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Outcome Metrics */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Measurable Outcomes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to transparency: Data-driven results that demonstrate program effectiveness
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${metric.color} rounded-full flex items-center justify-center`}>
                  <metric.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-brand-purple mb-2">{metric.value}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{metric.label}</h3>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program-Specific Outcomes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Program Effectiveness</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Each program is evaluated on completion rates, retention, and long-term outcomes
          </p>
          <div className="space-y-8">
            {programOutcomes.map((program, idx) => (
              <div key={idx} className="bg-gradient-to-r from-purple-50 to-white rounded-xl shadow-lg p-8 border-l-4 border-brand-purple">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{program.program}</h3>
                    <p className="text-gray-600">{program.description}</p>
                  </div>
                  <div className="flex gap-6 mt-4 md:mt-0">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brand-purple">{program.completion}%</div>
                      <p className="text-sm text-gray-600">Completion</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brand-green">{program.retention}%</div>
                      <p className="text-sm text-gray-600">Retention</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {program.outcomes.map((outcome, oIdx) => (
                    <div key={oIdx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Success Stories</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Real people, real transformation: Hear from graduates who rebuilt their lives
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((story, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{story.name[0]}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{story.name}</h3>
                      <p className="text-sm text-gray-600">{story.program}</p>
                    </div>
                  </div>
                  <div className="inline-block bg-brand-green text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    {story.outcome}
                  </div>
                </div>
                <blockquote className="text-gray-700 italic mb-4 border-l-4 border-brand-purple pl-4">
                  "{story.quote}"
                </blockquote>
                <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Before Program:</p>
                    <p className="text-sm text-gray-700">{story.stats.beforeProgram}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">After Program:</p>
                    <p className="text-sm text-brand-purple font-semibold">{story.stats.afterProgram}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grant Narrative Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-purple to-purple-900 text-white rounded-2xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">Our Approach to Measurable Impact</h2>
            <div className="space-y-4 text-purple-100 leading-relaxed">
              <p>
                A Vision For You operates with a commitment to evidence-based practices and transparent outcome measurement. Our comprehensive programs address the full spectrum of community needs—from immediate crisis intervention to long-term support planning.
              </p>
              <p>
                <strong className="text-white">Cost-Effectiveness:</strong> With an average cost of $4,200 per client served, we deliver outcomes that exceed industry benchmarks. Our 83% program completion rate surpasses the national average of 68% for residential recovery programs.
              </p>
              <p>
                <strong className="text-white">Long-Term Outcomes:</strong> We track graduates at 6 months, 12 months, and annually thereafter. Our 1-year sobriety retention rate of 72% demonstrates the lasting impact of comprehensive, community-based recovery support.
              </p>
              <p>
                <strong className="text-white">Evaluation Methodology:</strong> All outcome data is collected through standardized assessments, third-party employment verification, and voluntary graduate surveys. We partner with local universities for external program evaluation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Annual Report CTA */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Target className="w-16 h-16 mx-auto mb-6 text-brand-purple" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Impact Reporting</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            For foundations, grant reviewers, and institutional donors: Download our detailed annual impact report with full financial statements, program evaluations, and longitudinal outcome data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-purple to-purple-700 text-white font-bold rounded-lg hover:shadow-xl transition">
              <Download className="w-5 h-5" />
              Download 2024 Impact Report (PDF)
            </button>
            <Link href="/donate" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-green to-green-600 text-white font-bold rounded-lg hover:shadow-xl transition">
              Support Our Programs
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            EIN: XX-XXXXXXX | 501(c)(3) Nonprofit Organization
          </p>
        </div>
      </section>
    </div>
  )
}
