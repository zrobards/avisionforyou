'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
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
      <section className="bg-[#0f172a] py-20 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-[56px] font-heading font-bold text-white mb-6 leading-tight"
              >
                Digital Infrastructure for Nonprofits
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-[#cbd5e1] leading-relaxed mb-8"
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
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#dc2626] text-white rounded-lg hover:bg-[#b91c1c] transition-all duration-200 font-semibold text-lg shadow-lg"
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
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-4">
              Three Tiers. Built for Nonprofits.
            </h2>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-[1.7]">
              Choose the infrastructure that matches your nonprofit's stage and needs.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Tier 1: Essentials */}
            <ScrollAnimation delay={0.1}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#22d3ee] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-[#22d3ee] mb-2">
                  Tier 1: Essentials
                </h3>
                <div className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Starting at $3k
                </div>
                <p className="text-white/70 mb-6 text-lg">Website + donations + basic events</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Modern website</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Donation system (Stripe)</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Event scheduling</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Basic admin dashboard</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Monthly maintenance</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-transparent border-2 border-white/20 text-white rounded-lg hover:border-[#dc2626] hover:bg-[#dc2626] transition-all duration-200 font-semibold"
                >
                  Choose Plan
                </Link>
              </div>
            </ScrollAnimation>

            {/* Tier 2: Digital Director */}
            <ScrollAnimation delay={0.2}>
              <div className="bg-white/5 border-2 border-[#dc2626] rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-[#dc2626]/20 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#dc2626] text-white text-sm font-bold rounded-full uppercase shadow-lg">
                    <FiStar className="w-4 h-4" />
                    MOST POPULAR
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-[#22d3ee] mb-2">
                  Tier 2: Digital Director
                </h3>
                <div className="text-4xl md:text-5xl font-bold text-white mb-4">
                  $3k–$7.5k
                </div>
                <p className="text-white/70 mb-6 text-lg">Full platform + RSVPs + email automation</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]"><strong className="text-white">Everything in Tier 1</strong></span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">RSVP system</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Email automation</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Attendance tracking</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Advanced dashboard</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#dc2626] text-white rounded-lg hover:bg-[#b91c1c] hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                >
                  Choose Plan
                </Link>
              </div>
            </ScrollAnimation>

            {/* Tier 3: Digital COO */}
            <ScrollAnimation delay={0.3}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#22d3ee] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-[#22d3ee] mb-2">
                  Tier 3: Digital COO
                </h3>
                <div className="text-4xl md:text-5xl font-bold text-white mb-4">
                  $7.5k–$15k+
                </div>
                <p className="text-white/70 mb-6 text-lg">CRM + grant tracking + advanced automation</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]"><strong className="text-white">Everything in Tier 2</strong></span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">CRM integration</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Grant reporting</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Advanced automation</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-base leading-[1.7]">Custom integrations</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-transparent border-2 border-white/20 text-white rounded-lg hover:border-[#dc2626] hover:bg-[#dc2626] transition-all duration-200 font-semibold"
                >
                  Choose Plan
                </Link>
              </div>
            </ScrollAnimation>
          </div>

          <div className="text-center">
            <p className="text-white/70 mb-4 text-lg">
              <span className="font-semibold text-white">Also available:</span> Business & personal websites
            </p>
            <p className="text-white/70 text-lg">
              Need a business or personal site?{' '}
              <Link href="/start" className="text-[#22d3ee] hover:text-[#dc2626] font-semibold underline">
                Start here →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Donation System Showcase */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
              {/* Screenshot - Takes up 3 columns */}
              <ScrollAnimation delay={0.1} className="lg:col-span-3">
                <div className="rounded-2xl overflow-hidden border-2 border-[#22d3ee]/30 shadow-2xl hover:shadow-[#22d3ee]/40 transition-all duration-300">
                  <Image 
                    src="/avfy-donate-new.png" 
                    alt="Stripe-Integrated Donation System"
                    width={1200}
                    height={900}
                    className="w-full h-auto"
                  />
                </div>
              </ScrollAnimation>

              {/* Content - Takes up 2 columns */}
              <ScrollAnimation delay={0.2} className="lg:col-span-2">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm font-semibold mb-4">
                    <FiDollarSign className="w-4 h-4" />
                    <span>Real System in Production</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                    Donation Systems That Actually Work
                  </h2>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    This is the live donation page for A Vision For You Recovery. 
                    It processes real transactions, calculates donor impact in real-time, 
                    and handles both one-time and recurring donations.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Stripe integration for secure payment processing',
                      'Impact tiers ($25-$500 with clear outcomes)',
                      'Real-time impact calculator',
                      'One-time and monthly recurring donations',
                      'Custom donation amounts',
                      'Automated thank-you emails via Resend API'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <FiCheck className="w-5 h-5 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-base text-gray-400 italic">
                    "Every donation directly transforms lives in our community" — 
                    This system made that promise tangible with real-time impact visualization.
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-4">
              Compare Nonprofit Tiers
            </h2>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white/5 rounded-xl border border-white/10">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-4 px-4 text-white/70 font-semibold">Feature</th>
                  <th className="py-4 px-4 text-center text-[#22d3ee] font-semibold">Tier 1</th>
                  <th className="py-4 px-4 text-center text-[#dc2626] font-semibold">Tier 2</th>
                  <th className="py-4 px-4 text-center text-[#22d3ee] font-semibold">Tier 3</th>
                </tr>
              </thead>
              <tbody className="text-white/70">
                <tr className="border-b border-white/10 bg-white/0">
                  <td className="py-4 px-4 text-white">Modern website</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                  <td className="py-4 px-4 text-center bg-white/5"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/10 bg-white/5">
                  <td className="py-4 px-4 text-white">Donation system</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                  <td className="py-4 px-4 text-center bg-white/5"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/10 bg-white/0">
                  <td className="py-4 px-4 text-white">Event scheduling</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                  <td className="py-4 px-4 text-center bg-white/5"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/10 bg-white/5">
                  <td className="py-4 px-4 text-white">RSVPs</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center bg-white/5"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/10 bg-white/0">
                  <td className="py-4 px-4 text-white">Email automation</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center bg-white/5"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/10 bg-white/5">
                  <td className="py-4 px-4 text-white">Admin dashboard</td>
                  <td className="py-4 px-4 text-center text-white/70">Basic</td>
                  <td className="py-4 px-4 text-center bg-white/5 text-white/70">Advanced</td>
                  <td className="py-4 px-4 text-center text-white/70">Full</td>
                </tr>
                <tr className="border-b border-white/10 bg-white/0">
                  <td className="py-4 px-4 text-white">CRM integration</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center bg-white/5 text-white/40">—</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/10 bg-white/5">
                  <td className="py-4 px-4 text-white">Grant reporting</td>
                  <td className="py-4 px-4 text-center text-white/40">—</td>
                  <td className="py-4 px-4 text-center bg-white/5 text-white/40">—</td>
                  <td className="py-4 px-4 text-center"><FiCheck className="w-5 h-5 text-[#22d3ee] mx-auto" /></td>
                </tr>
                <tr className="border-b border-white/10 bg-white/0">
                  <td className="py-4 px-4 text-white">Maintenance hours/month</td>
                  <td className="py-4 px-4 text-center text-white/70">2 hours</td>
                  <td className="py-4 px-4 text-center bg-white/5 text-white/70">4 hours</td>
                  <td className="py-4 px-4 text-center text-white/70">8 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Nonprofits Choose SeeZee */}
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Why Nonprofits Choose SeeZee
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiHeart className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Specialized in Nonprofits</h4>
                <p className="text-white/70">We understand recovery groups, community orgs, and mission-driven teams</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiUsers className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Ongoing Partnership</h4>
                <p className="text-white/70">Not a one-time freelancer—we act as your digital director</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiCode className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Modern Stack</h4>
                <p className="text-white/70">Next.js, Stripe, real-time data—built to last and scale</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiDollarSign className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Nonprofit Pricing</h4>
                <p className="text-white/70">Transparent budgets designed for tight nonprofit finances</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Secondary Section: Business & Personal Sites */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 md:p-12 hover:border-[#22d3ee] transition-all duration-300">
                <h2 className="text-3xl font-heading font-bold text-white mb-4">
                  We Still Build Business & Personal Sites
                </h2>
                <p className="text-xl text-white/80 mb-6">
                  While we specialize in nonprofit infrastructure, we also build professional websites for small businesses, startups, and personal portfolios.
                </p>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#dc2626] text-white rounded-lg hover:bg-[#b91c1c] hover:scale-105 transition-all duration-200 font-semibold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-[#0a1128]"
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
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Common Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <ScrollAnimation delay={0.1}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">How long does it take?</h4>
                <p className="text-white/70">Most nonprofit projects are completed in 2-3 weeks, depending on tier complexity.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What if I don't know what tier we need?</h4>
                <p className="text-white/70">Book a free audit and we'll review your current systems and recommend the right tier for your nonprofit's stage.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Do you only work with nonprofits?</h4>
                <p className="text-white/70">No! While we specialize in nonprofit infrastructure, we also build websites for small businesses and personal projects.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What's included in maintenance?</h4>
                <p className="text-white/70">Hosting, security updates, backups, content updates (varies by tier), and access to your admin dashboard.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Can we upgrade tiers later?</h4>
                <p className="text-white/70">Absolutely! Start with Tier 1 and upgrade as your nonprofit grows and needs more features.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What if we need changes after launch?</h4>
                <p className="text-white/70">All tiers include monthly maintenance hours for updates and changes. Additional hours can be added if needed.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.7}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Do we own the platform?</h4>
                <p className="text-white/70">Yes! You own all content and data. We maintain the hosting and technical infrastructure.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.8}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What payment methods do you accept?</h4>
                <p className="text-white/70">We use Stripe for secure payments. Credit cards, debit cards, and ACH transfers accepted.</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#dc2626] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Ready to Start Your Nonprofit Project?
              </h2>
              <p className="text-xl text-white mb-4 leading-relaxed">
                Answer a few quick questions and we'll create your custom project portal.
              </p>
              <p className="text-white/80 mb-8 text-lg">
                Get started in minutes. No commitment required.
              </p>
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#dc2626] rounded-lg hover:bg-white/90 hover:scale-105 transition-all duration-200 font-bold text-lg shadow-lg min-h-[48px]"
              >
                Start Your Project
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Every Project Includes
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#dc2626] transition-all duration-300">
                <FiCode className="w-10 h-10 text-[#dc2626] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Professional Design</h4>
                <p className="text-white/70 text-sm">Clean, modern websites that work perfectly on all devices</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#dc2626] transition-all duration-300">
                <FiMessageSquare className="w-10 h-10 text-[#dc2626] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Your Own Dashboard</h4>
                <p className="text-white/70 text-sm">Track progress, view invoices, request changes—all in one place</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#dc2626] transition-all duration-300">
                <FiClock className="w-10 h-10 text-[#dc2626] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Fast Delivery</h4>
                <p className="text-white/70 text-sm">Most projects completed in 2-3 weeks. Rush options available</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#dc2626] transition-all duration-300">
                <FiTrendingUp className="w-10 h-10 text-[#dc2626] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">SEO Basics</h4>
                <p className="text-white/70 text-sm">Set up for search engine success from day one</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#dc2626] transition-all duration-300">
                <FiShield className="w-10 h-10 text-[#dc2626] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Secure Hosting</h4>
                <p className="text-white/70 text-sm">Fast, reliable hosting included in your monthly maintenance</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#dc2626] transition-all duration-300">
                <FiUsers className="w-10 h-10 text-[#dc2626] mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Ongoing Support</h4>
                <p className="text-white/70 text-sm">Monthly maintenance includes updates, backups, and support</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Why SeeZee Section */}
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Why Choose SeeZee Studio?
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiZap className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Fast & Reliable</h4>
                <p className="text-white/70">We deliver quality work quickly. Most projects done in 2-3 weeks.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiCode className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Modern Technology</h4>
                <p className="text-white/70">Built with Next.js, React, and cutting-edge tools for speed and security.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiDollarSign className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Transparent Process</h4>
                <p className="text-white/70">Track everything through your dashboard. No surprises, no hidden fees.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiUsers className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Real Support</h4>
                <p className="text-white/70">We're students who care about our work. You get direct access to developers.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#22d3ee] transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiAward className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Proven Track Record</h4>
                <p className="text-white/70">FBLA competitors with real client projects. Check our portfolio.</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Common Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <ScrollAnimation delay={0.1}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">How long does it take?</h4>
                <p className="text-white/70">Most projects are completed in 2-3 weeks. Rush delivery (1 week) available for an additional fee.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What if I don't know exactly what I need?</h4>
                <p className="text-white/70">That's okay! The project brief helps us understand your needs and recommend the right solutions. We'll guide you through the process.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Do you work with nonprofits?</h4>
                <p className="text-white/70">Yes! We offer 40% discounts for verified 501(c)(3) nonprofit organizations.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What's included in monthly maintenance?</h4>
                <p className="text-white/70">Hosting, security updates, backups, minor content updates, and email support. Premium plans include priority support.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Can you work with my budget?</h4>
                <p className="text-white/70">We create custom quotes based on your specific needs and budget. Let us know your constraints in the project brief and we'll work with you.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What if I need changes after launch?</h4>
                <p className="text-white/70">Minor updates are included in your monthly maintenance. Larger changes can be quoted separately through your dashboard.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.7}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Do I own the website?</h4>
                <p className="text-white/70">Yes! You own all content and design. We just maintain the hosting and technical infrastructure.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.8}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What payment methods do you accept?</h4>
                <p className="text-white/70">We use Stripe for secure payment processing. Credit cards, debit cards, and ACH transfers accepted.</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#dc2626] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-xl text-white mb-4 leading-relaxed">
                Answer a few quick questions and get access to your project portal in minutes.
              </p>
              <p className="text-white/80 mb-8 text-lg">
                No commitment. No credit card required to get started.
              </p>
              <Link
                href="/start"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#dc2626] rounded-lg hover:bg-white/90 hover:scale-105 transition-all duration-200 font-bold text-lg shadow-lg min-h-[48px]"
              >
                Start Your Project
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
