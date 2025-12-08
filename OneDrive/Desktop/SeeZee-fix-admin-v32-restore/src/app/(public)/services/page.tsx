'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import {
  FiCheck,
  FiArrowRight,
  FiZap,
  FiClock,
  FiDollarSign,
  FiMessageSquare,
  FiShield,
  FiTrendingUp,
  FiAward,
  FiCode,
  FiUsers,
  FiStar,
  FiHeart,
  FiCalendar,
  FiMail,
} from 'react-icons/fi'

export default function ServicesPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gray-900 py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-trinity-red/30 rounded-lg rotate-12"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-trinity-red/20 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-trinity-red/25 rounded-lg -rotate-12"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 border-2 border-trinity-red/20 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
              >
                <span className="gradient-text">Digital Infrastructure</span>{' '}
                <span className="text-white">for Nonprofits</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-white leading-relaxed mb-8"
              >
                Three clear tiers. Designed to fit where your nonprofit is right now.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Nonprofit Tiers Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Three Tiers. Built for Nonprofits.
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Choose the infrastructure that matches your nonprofit's stage and needs.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Tier 1: Essentials */}
            <ScrollAnimation delay={0.1}>
              <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-8 hover:border-gray-600 transition-all duration-300">
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  Tier 1: Essentials
                </h3>
                <div className="text-4xl font-bold text-trinity-red mb-4">
                  Starting at $3k
                </div>
                <p className="text-white/60 mb-6">Website + donations + basic events</p>
                <Link
                  href="/services/tier1"
                  className="inline-flex items-center gap-2 text-trinity-red hover:text-trinity-maroon font-semibold mb-6"
                >
                  View Details <FiArrowRight className="w-4 h-4" />
                </Link>
                <ul className="space-y-3">
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Modern website</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Donation system (Stripe)</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Event scheduling</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Basic admin dashboard</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Monthly maintenance</span>
                  </li>
                </ul>
              </div>
            </ScrollAnimation>

            {/* Tier 2: Digital Director */}
            <ScrollAnimation delay={0.2}>
              <div className="bg-gray-900 border-2 border-trinity-red rounded-xl p-8 relative overflow-hidden shadow-large shadow-trinity-red/20">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-trinity-red text-white text-sm font-semibold rounded-full">
                    <FiStar className="w-4 h-4" />
                    MOST POPULAR
                  </span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  Tier 2: Digital Director
                </h3>
                <div className="text-4xl font-bold text-trinity-red mb-4">
                  $3k–$7.5k
                </div>
                <p className="text-white/60 mb-6">Full platform + RSVPs + email automation</p>
                <Link
                  href="/services/tier2"
                  className="inline-flex items-center gap-2 text-trinity-red hover:text-trinity-maroon font-semibold mb-6"
                >
                  View Details <FiArrowRight className="w-4 h-4" />
                </Link>
                <ul className="space-y-3">
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Everything in Tier 1</strong></span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>RSVP system</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Email automation</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Attendance tracking</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Advanced dashboard</span>
                  </li>
                </ul>
              </div>
            </ScrollAnimation>

            {/* Tier 3: Digital COO */}
            <ScrollAnimation delay={0.3}>
              <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-8 hover:border-gray-600 transition-all duration-300">
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  Tier 3: Digital COO
                </h3>
                <div className="text-4xl font-bold text-trinity-red mb-4">
                  $7.5k–$15k+
                </div>
                <p className="text-white/60 mb-6">CRM + grant tracking + advanced automation</p>
                <Link
                  href="/services/tier3"
                  className="inline-flex items-center gap-2 text-trinity-red hover:text-trinity-maroon font-semibold mb-6"
                >
                  View Details <FiArrowRight className="w-4 h-4" />
                </Link>
                <ul className="space-y-3">
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Everything in Tier 2</strong></span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>CRM integration</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Grant reporting</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Advanced automation</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
              </div>
            </ScrollAnimation>
          </div>

          <div className="text-center">
            <p className="text-white mb-4">
              <span className="font-semibold">Also available:</span> Business & personal websites
            </p>
            <p className="text-gray-300">
              Need a business or personal site?{' '}
              <Link href="/start" className="text-trinity-red hover:text-trinity-maroon font-semibold underline">
                Start here →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Compare Nonprofit Tiers
            </h2>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-4 px-4 text-white/80 font-semibold">Feature</th>
                  <th className="py-4 px-4 text-center text-white font-semibold">Tier 1</th>
                  <th className="py-4 px-4 text-center text-trinity-red font-semibold">Tier 2</th>
                  <th className="py-4 px-4 text-center text-white font-semibold">Tier 3</th>
                </tr>
              </thead>
              <tbody className="text-white/70">
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">Modern website</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">Donation system</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">Event scheduling</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">RSVPs</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">Email automation</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">Admin dashboard</td>
                  <td className="py-4 px-4 text-center">Basic</td>
                  <td className="py-4 px-4 text-center">Advanced</td>
                  <td className="py-4 px-4 text-center">Full</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">CRM integration</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">Grant reporting</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-trinity-red mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-4 px-4">Maintenance hours/month</td>
                  <td className="py-4 px-4 text-center">2 hours</td>
                  <td className="py-4 px-4 text-center">4 hours</td>
                  <td className="py-4 px-4 text-center">8 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Nonprofits Choose SeeZee */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Why Nonprofits Choose SeeZee
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiHeart className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Specialized in Nonprofits</h4>
                <p className="text-white/70">We understand recovery groups, community orgs, and mission-driven teams</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiUsers className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Ongoing Partnership</h4>
                <p className="text-white/70">Not a one-time freelancer—we act as your digital director</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiCode className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Modern Stack</h4>
                <p className="text-white/70">Next.js, Stripe, real-time data—built to last and scale</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiDollarSign className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Nonprofit Pricing</h4>
                <p className="text-white/70">Transparent budgets designed for tight nonprofit finances</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Secondary Section: Business & Personal Sites */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-8 md:p-12">
                <h2 className="text-3xl font-heading font-bold text-white mb-4">
                  We Still Build Business & Personal Sites
                </h2>
                <p className="text-xl text-white/80 mb-6">
                  While we specialize in nonprofit infrastructure, we also build professional websites for small businesses, startups, and personal portfolios.
                </p>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Start a Business or Personal Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Common Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <ScrollAnimation delay={0.1}>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">How long does it take?</h4>
                <p className="text-white/70">Most nonprofit projects are completed in 2-3 weeks, depending on tier complexity.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">What if I don't know what tier we need?</h4>
                <p className="text-white/70">Book a free audit and we'll review your current systems and recommend the right tier for your nonprofit's stage.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">Do you only work with nonprofits?</h4>
                <p className="text-white/70">No! While we specialize in nonprofit infrastructure, we also build websites for small businesses and personal projects.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">What's included in maintenance?</h4>
                <p className="text-white/70">Hosting, security updates, backups, content updates (varies by tier), and access to your admin dashboard.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">Can we upgrade tiers later?</h4>
                <p className="text-white/70">Absolutely! Start with Tier 1 and upgrade as your nonprofit grows and needs more features.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">What if we need changes after launch?</h4>
                <p className="text-white/70">All tiers include monthly maintenance hours for updates and changes. Additional hours can be added if needed.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.7}>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">Do we own the platform?</h4>
                <p className="text-white/70">Yes! You own all content and data. We maintain the hosting and technical infrastructure.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.8}>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">What payment methods do you accept?</h4>
                <p className="text-white/70">We use Stripe for secure payments. Credit cards, debit cards, and ACH transfers accepted.</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Ready to Start Your Nonprofit Project?
              </h2>
              <p className="text-xl text-white/80 mb-4 leading-relaxed">
                Book a free audit to review your current systems and get a custom quote.
              </p>
              <p className="text-white/60 mb-8 text-lg">
                No commitment. We'll show you exactly what you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/audit"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Book Free Audit
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/case-studies/avfy"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-semibold text-lg border-2 border-white hover:border-trinity-red focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  See AVFY Case Study
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* AI Features Callout */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/10 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-trinity-red/20 border border-trinity-red/30 rounded-full mb-6">
                <span className="text-2xl">🤖</span>
                <span className="text-trinity-red font-semibold">AI-Powered Project Intelligence</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                The Only Web Agency with Built-In AI
              </h2>
              <p className="text-xl text-white/80 mb-8">
                SeeZee is the only web agency with built-in AI that analyzes your project and suggests improvements automatically.
              </p>
            </div>
          </ScrollAnimation>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto text-trinity-red text-xl font-bold">
                  1
                </div>
                <h4 className="text-white font-semibold mb-2">We Build & Deploy</h4>
                <p className="text-white/60 text-sm">Your site goes live with clean code</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto text-trinity-red text-xl font-bold">
                  2
                </div>
                <h4 className="text-white font-semibold mb-2">AI Monitors</h4>
                <p className="text-white/60 text-sm">Every update is analyzed automatically</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto text-trinity-red text-xl font-bold">
                  3
                </div>
                <h4 className="text-white font-semibold mb-2">Smart Recommendations</h4>
                <p className="text-white/60 text-sm">Get 1-3 actionable suggestions weekly</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto text-trinity-red text-xl font-bold">
                  4
                </div>
                <h4 className="text-white font-semibold mb-2">One-Click Requests</h4>
                <p className="text-white/60 text-sm">Accept suggestions with one click</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto text-trinity-red text-xl font-bold">
                  5
                </div>
                <h4 className="text-white font-semibold mb-2">Stay Ahead</h4>
                <p className="text-white/60 text-sm">Continuously improve without effort</p>
              </div>
            </ScrollAnimation>
          </div>

          <div className="text-center mt-12">
            <p className="text-white/60 text-sm">Available with Premium maintenance ($149/month)</p>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Every Project Includes
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <FiCode className="w-10 h-10 text-trinity-red mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Professional Design</h4>
                <p className="text-white/70 text-sm">Clean, modern websites that work perfectly on all devices</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <FiMessageSquare className="w-10 h-10 text-trinity-red mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Your Own Dashboard</h4>
                <p className="text-white/70 text-sm">Track progress, view invoices, request changes—all in one place</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <FiClock className="w-10 h-10 text-trinity-red mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Fast Delivery</h4>
                <p className="text-white/70 text-sm">Most projects completed in 2-3 weeks. Rush options available</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <FiTrendingUp className="w-10 h-10 text-trinity-red mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">SEO Basics</h4>
                <p className="text-white/70 text-sm">Set up for search engine success from day one</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <FiShield className="w-10 h-10 text-trinity-red mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Secure Hosting</h4>
                <p className="text-white/70 text-sm">Fast, reliable hosting included in your monthly maintenance</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <FiUsers className="w-10 h-10 text-trinity-red mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Ongoing Support</h4>
                <p className="text-white/70 text-sm">Monthly maintenance includes updates, backups, and support</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Add-Ons Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Optional Enhancements
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Customize your website with additional features and services
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScrollAnimation delay={0.1}>
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-2">E-commerce Integration</h4>
                <p className="text-trinity-red font-bold mb-3">+$400-800</p>
                <p className="text-white/70 text-sm">Full online store with Stripe or Square payment processing</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-2">Booking System</h4>
                <p className="text-trinity-red font-bold mb-3">+$300-600</p>
                <p className="text-white/70 text-sm">Appointment scheduling, calendar integration, automated reminders</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-2">Logo Design</h4>
                <p className="text-trinity-red font-bold mb-3">+$200-500</p>
                <p className="text-white/70 text-sm">Professional logo design to match your new website</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-2">Content Writing</h4>
                <p className="text-trinity-red font-bold mb-3">+$150-400</p>
                <p className="text-white/70 text-sm">Professional copywriting for your website pages</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-trinity-red transition-all duration-300 md:col-span-2">
                <h4 className="text-xl font-semibold text-white mb-2">Custom Features</h4>
                <p className="text-trinity-red font-bold mb-3">Custom Quote</p>
                <p className="text-white/70 text-sm">Need something specific? We build custom functionality to match your needs</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Why SeeZee Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Why Choose SeeZee Studio?
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiZap className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Fast & Reliable</h4>
                <p className="text-white/70">We deliver quality work quickly. Most projects done in 2-3 weeks.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiCode className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Modern Technology</h4>
                <p className="text-white/70">Built with Next.js, React, and cutting-edge tools for speed and security.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiDollarSign className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Transparent Process</h4>
                <p className="text-white/70">Track everything through your dashboard. No surprises, no hidden fees.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiUsers className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Real Support</h4>
                <p className="text-white/70">We're students who care about our work. You get direct access to developers.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiAward className="w-8 h-8 text-trinity-red" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Proven Track Record</h4>
                <p className="text-white/70">FBLA competitors with real client projects. Check our portfolio.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="text-center">
                <div className="w-16 h-16 bg-trinity-red/20 border border-trinity-red/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">🤖</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">AI-Powered Intelligence</h4>
                <p className="text-white/70">The only agency with built-in AI that suggests improvements automatically.</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Common Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <ScrollAnimation delay={0.1}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">How long does it take?</h4>
                <p className="text-white/70">Most projects are completed in 2-3 weeks. Rush delivery (1 week) available for an additional fee.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">What if I don't know exactly what I need?</h4>
                <p className="text-white/70">That's okay! The project brief helps us understand your needs and recommend the right solutions. We'll guide you through the process.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">Do you work with nonprofits?</h4>
                <p className="text-white/70">Yes! We offer 40% discounts for verified 501(c)(3) nonprofit organizations.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">What's included in monthly maintenance?</h4>
                <p className="text-white/70">Hosting, security updates, backups, minor content updates, and email support. Premium plans include AI-powered suggestions and priority support.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">Can you work with my budget?</h4>
                <p className="text-white/70">We create custom quotes based on your specific needs and budget. Let us know your constraints in the project brief and we'll work with you.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">What if I need changes after launch?</h4>
                <p className="text-white/70">Minor updates are included in your monthly maintenance. Larger changes can be quoted separately through your dashboard.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.7}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">Do I own the website?</h4>
                <p className="text-white/70">Yes! You own all content and design. We just maintain the hosting and technical infrastructure.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.8}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-3">What payment methods do you accept?</h4>
                <p className="text-white/70">We use Stripe for secure payment processing. Credit cards, debit cards, and ACH transfers accepted.</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-xl text-white/80 mb-4 leading-relaxed">
                Answer a few quick questions and get access to your project portal in minutes.
              </p>
              <p className="text-white/60 mb-8 text-lg">
                No commitment. No credit card required to get started.
              </p>
              <Link
                href="/start"
                className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Get Started
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
