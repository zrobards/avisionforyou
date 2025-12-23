'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import { FiArrowRight, FiCheck, FiHeart, FiUsers, FiCalendar, FiShield, FiZap, FiTrendingUp } from 'react-icons/fi'
import PageShell from '@/components/PageShell'
import FloatingShapes from '@/components/shared/FloatingShapes'

interface Tier {
  name: string
  buildPrice: string
  monthlyPrice: string
  yearlyPrice?: string
  perfectFor: string
  description: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
  href: string
}

const tiers: Tier[] = [
  {
    name: 'Nonprofit Essentials',
    buildPrice: '$6,000',
    monthlyPrice: '$500/month',
    perfectFor: 'Small sites that just need stability and fixes',
    description: 'We keep your site safe, fast, and running.',
    features: [
      'Managed hosting + SSL',
      'Security, CMS, and plugin updates',
      'Daily automated backups',
      'Performance monitoring',
      'Email support',
      'Up to 8 hours of support work',
      'Bug fixes',
      'Small content edits',
      'Minor design tweaks',
    ],
    icon: <FiHeart className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-500',
    href: '/start/contact?service=nonprofit&tier=essentials',
  },
  {
    name: 'Digital Director Platform',
    buildPrice: '$7,500',
    monthlyPrice: '$750/month',
    yearlyPrice: '$8,000/year',
    perfectFor: 'Orgs that update content often and want real momentum',
    description: 'We actively manage and improve your digital presence.',
    features: [
      'Everything in Essentials',
      'Priority support',
      'Extended content updates',
      'Design improvements',
      'Performance + SEO improvements',
      'Monthly analytics report',
      'Up to 16 hours of support work',
    ],
    popular: true,
    icon: <FiUsers className="w-8 h-8" />,
    color: 'from-purple-500 to-indigo-500',
    href: '/start/contact?service=nonprofit&tier=director',
  },
  {
    name: 'Digital COO System',
    buildPrice: '$12,500',
    monthlyPrice: '$2,000/month',
    perfectFor: 'Serious organizations that want you as their tech lead',
    description: 'Your outsourced digital leadership.',
    features: [
      'Everything in Director',
      'Unlimited support requests',
      '24/7 emergency support',
      'Strategy + planning calls',
      'Dedicated support workflow',
      'Ongoing feature development',
      'Unlimited requests (fair-use)',
    ],
    icon: <FiShield className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    href: '/start/contact?service=nonprofit&tier=coo',
  },
]

const comparisonFeatures = [
  { name: 'Modern Website', tier1: true, tier2: true, tier3: true },
  { name: 'Donation System', tier1: true, tier2: true, tier3: true },
  { name: 'Event Scheduling', tier1: false, tier2: true, tier3: true },
  { name: 'RSVP System', tier1: false, tier2: true, tier3: true },
  { name: 'Admin Dashboard', tier1: 'Basic', tier2: 'Full', tier3: 'Full' },
  { name: 'Support Hours/Month', tier1: '8', tier2: '16', tier3: 'Unlimited*' },
  { name: 'CRM Integration', tier1: false, tier2: false, tier3: true },
  { name: 'Grant Reporting', tier1: false, tier2: false, tier3: true },
]

export default function NonprofitTiersPage() {
  return (
    <PageShell>
      <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0A0E27] to-[#1a0f2e]">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>

        {/* Hero Section */}
        <section className="relative z-10 py-24 lg:py-40 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <ScrollAnimation>
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
                    Choose Your Nonprofit Tier
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed mb-8">
                    Select the package that fits your organization's needs. 
                    All tiers include ongoing maintenance and support.
                  </p>
                </motion.div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Tiers Section */}
        <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier, index) => (
                <ScrollAnimation key={tier.name} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 rounded-2xl border-2 ${
                      tier.popular
                        ? 'border-red-500/50 shadow-2xl shadow-red-500/20'
                        : 'border-gray-800'
                    } p-8 hover:border-red-500 transition-all duration-300 overflow-hidden`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 -right-3 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                        {tier.icon}
                      </div>

                      {/* Name */}
                      <h3 className="text-2xl font-heading font-bold text-white mb-4">
                        {tier.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-4xl font-bold text-white mb-1">
                          {tier.buildPrice}
                        </div>
                        <div className="text-gray-400 text-sm mb-1">
                          build + {tier.monthlyPrice}
                        </div>
                        {tier.yearlyPrice && (
                          <div className="text-gray-500 text-xs">
                            OR {tier.yearlyPrice}
                          </div>
                        )}
                      </div>

                      {/* Perfect For */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-400 mb-2">Perfect for:</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {tier.perfectFor}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-400 mb-3">Includes:</p>
                        <ul className="space-y-2">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <FiCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <Link
                        href={tier.href}
                        className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          tier.popular
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                      >
                        Select {tier.name.split(' ')[0]} →
                        <FiArrowRight className="inline-block ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
          <div className="container mx-auto max-w-6xl">
            <ScrollAnimation>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                  Feature Comparison
                </h2>
                <p className="text-gray-400">
                  Compare what's included in each tier
                </p>
              </motion.div>
            </ScrollAnimation>

            <div className="overflow-x-auto">
              <table className="w-full bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="text-left px-6 py-4 text-white font-semibold">Feature</th>
                    <th className="text-center px-6 py-4 text-white font-semibold">Tier 1</th>
                    <th className="text-center px-6 py-4 text-white font-semibold">Tier 2</th>
                    <th className="text-center px-6 py-4 text-white font-semibold">Tier 3</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.name} className={index % 2 === 0 ? 'bg-gray-900/30' : 'bg-gray-900/50'}>
                      <td className="px-6 py-4 text-gray-300 font-medium">{feature.name}</td>
                      <td className="px-6 py-4 text-center">
                        {feature.tier1 === true ? (
                          <FiCheck className="w-5 h-5 text-green-400 mx-auto" />
                        ) : feature.tier1 === false ? (
                          <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-gray-300">{feature.tier1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.tier2 === true ? (
                          <FiCheck className="w-5 h-5 text-green-400 mx-auto" />
                        ) : feature.tier2 === false ? (
                          <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-gray-300">{feature.tier2}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.tier3 === true ? (
                          <FiCheck className="w-5 h-5 text-green-400 mx-auto" />
                        ) : feature.tier3 === false ? (
                          <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-gray-300">{feature.tier3}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-300 font-semibold mb-2">* Fair-use definition:</p>
              <p className="text-sm text-gray-400">
                Unlimited requests, worked on continuously. Large rebuilds, migrations, or major new systems scoped separately.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <ScrollAnimation>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                  Still not sure which tier fits?
                </h2>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Book a free 15-minute call and we'll help you choose.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all duration-200 font-semibold text-lg shadow-lg transform hover:-translate-y-1"
                >
                  Book a Call
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
