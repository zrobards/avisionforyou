'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import StickyCTA from '@/components/shared/StickyCTA'
import { 
  FiArrowRight, 
  FiCheck, 
  FiBook, 
  FiHeart, 
  FiUsers, 
  FiShield,
  FiEye,
  FiTool,
  FiCalendar,
  FiMapPin
} from 'react-icons/fi'

export default function HomePage() {
  return (
    <div className="w-full">
      <StickyCTA />
      
      {/* Hero Section */}
      <section className="bg-[#0A0E27] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-3"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-[56px] font-heading font-bold mb-6 text-white leading-tight"
              >
                Digital Infrastructure for{' '}
                <span className="text-[#DC143C]">Nonprofits & Communities.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed"
              >
                We build donation systems, event platforms, and accessible websites for organizations that serve mental health, recovery, and neuro-inclusive communities.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
              >
                <Link
                  href="/case-studies/big-red-bus"
                  className="px-8 py-4 bg-[#DC143C] text-white rounded-xl hover:bg-[#b91c1c] transition-all duration-200 font-semibold text-lg shadow-lg transform hover:-translate-y-1"
                >
                  View Our Work
                  <FiArrowRight className="inline-block ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/philosophy"
                  className="px-8 py-4 border-2 border-gray-700 text-gray-300 rounded-xl hover:border-[#DC143C] hover:text-white transition-all duration-200 font-semibold text-lg"
                >
                  Our Philosophy
                </Link>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-sm text-gray-400"
              >
                Built by two Louisville developers who believe technology should include everyone.
              </motion.p>
            </div>
            
            {/* Right side - Big Red Bus Logo/Visual */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 border border-gray-800">
                  <Image
                    src="/logos/Stylized Red Bus Logo with Integrated Text.png"
                    alt="Big Red Bus - Mental Health Community Platform"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    priority
                  />
                  <p className="text-center text-gray-400 text-sm mt-4">
                    Big Red Bus — Mental Health Community Platform
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-6 text-white">
                Who We Build For
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                We specialize in organizations that need accessible, compassionate digital tools.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <FiHeart className="w-8 h-8" />,
                title: 'Mental Health Organizations',
                description: 'Support groups, recovery programs, therapy centers',
                color: 'text-blue-400'
              },
              {
                icon: <FiUsers className="w-8 h-8" />,
                title: 'Neuro-Inclusive Communities',
                description: 'ADHD, autism, cognitive accessibility advocacy',
                color: 'text-purple-400'
              },
              {
                icon: <FiHeart className="w-8 h-8" />,
                title: 'Senior & Community Groups',
                description: 'Organizations serving older adults who need simple tech',
                color: 'text-pink-400'
              },
              {
                icon: <FiShield className="w-8 h-8" />,
                title: 'Nonprofits & Small Teams',
                description: '501(c)(3) orgs with limited budgets and big missions',
                color: 'text-green-400'
              },
            ].map((group, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-8 rounded-2xl border-2 border-gray-800 bg-gray-900/50 backdrop-blur hover:border-[#DC143C]/50 transition-all duration-300"
                >
                  <div className={`${group.color} mb-4`}>{group.icon}</div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    {group.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {group.description}
                  </p>
                </motion.div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* What We Build Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-6 text-white">
                What We Build
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Complete digital platforms designed for accessibility and ease of use.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <FiEye className="w-8 h-8" />,
                title: 'Accessible Websites',
                description: 'Clear navigation, large fonts, high contrast. Built for cognitive clarity, not complexity.',
                color: 'text-blue-400'
              },
              {
                icon: <FiCalendar className="w-8 h-8" />,
                title: 'Donation & Event Systems',
                description: 'Secure donation processing, event scheduling, and support group management.',
                color: 'text-green-400'
              },
              {
                icon: <FiTool className="w-8 h-8" />,
                title: 'Admin Dashboards',
                description: 'Simple admin tools that require minimal tech knowledge. No coding required.',
                color: 'text-purple-400'
              },
            ].map((item, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-8 rounded-2xl border-2 border-gray-700 bg-gray-900/50 backdrop-blur hover:border-[#DC143C]/50 transition-all duration-300"
                >
                  <div className={`${item.color} mb-4`}>{item.icon}</div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project - Big Red Bus */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-sm font-semibold mb-6">
                    <FiHeart className="w-4 h-4" />
                    <span>Featured Project</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-6">
                    Big Red Bus
                  </h2>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    A mental health and neuro-inclusive community platform built with cognitive accessibility first. Connecting people with brain health challenges to resources, support groups, and community events.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Cognitive accessibility design (WCAG AA+)',
                      'Support group directory & scheduling',
                      'Event calendar with reminders',
                      'Resource library for mental health',
                      'Simple navigation, large fonts, minimal distractions'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <FiCheck className="w-5 h-5 text-[#DC143C] flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/case-studies/big-red-bus"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#DC143C] text-white rounded-xl hover:bg-[#b91c1c] transition-all duration-200 font-semibold text-lg shadow-lg"
                  >
                    View Full Case Study
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="bg-gray-800 rounded-2xl p-8 border-2 border-gray-700 shadow-xl">
                  <div className="aspect-video bg-gradient-to-br from-[#DC143C]/20 to-[#b91c1c]/20 rounded-xl flex items-center justify-center border border-[#DC143C]/30">
                    <Image
                      src="/logos/Stylized Red Bus Logo with Integrated Text.png"
                      alt="Big Red Bus Platform"
                      width={400}
                      height={300}
                      className="w-full h-auto max-w-md"
                    />
                  </div>
                  <p className="text-center text-gray-400 text-sm mt-4">
                    Mental Health Community Platform
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-6 text-white">
                Our Approach
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Three principles that guide everything we build.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                emoji: '🧠',
                title: 'Accessible by Design',
                description: 'Built for cognitive clarity, not complexity. Clear navigation, large fonts, minimal distractions.',
                color: 'border-blue-500/30'
              },
              {
                emoji: '❤️',
                title: 'Community First',
                description: 'Discounts for nonprofits, support groups, & mental health orgs. We believe in your mission.',
                color: 'border-pink-500/30'
              },
              {
                emoji: '🛠️',
                title: 'Maintained for Life',
                description: 'We don\'t disappear after launch. Ongoing support, updates, and adaptations as your needs grow.',
                color: 'border-green-500/30'
              },
            ].map((principle, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`p-8 rounded-2xl border-2 ${principle.color} bg-gray-900/50 backdrop-blur hover:border-[#DC143C]/50 transition-all duration-300 text-center`}
                >
                  <div className="text-6xl mb-6">{principle.emoji}</div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {principle.description}
                  </p>
                </motion.div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Supporting Your Community Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-6 text-white">
                Supporting Your Community Shouldn't Require a Tech Team.
              </h2>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed mb-10">
                <p>
                  Most nonprofits and support organizations are stuck with outdated websites, broken donation pages, and zero support.
                </p>
                <p className="text-xl text-white font-semibold">
                  We fix that.
                </p>
                <p>
                  We build accessible platforms with donation systems, event scheduling, and simple admin tools — so you can focus on your mission, not your website.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#DC143C] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-6 text-white">
                Ready to build something meaningful?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
                Whether you're a nonprofit, support group, or community organization, we're here to help you create an accessible, compassionate digital presence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#DC143C] rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold text-lg shadow-lg transform hover:-translate-y-1"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/start/nonprofit-tiers"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:border-white hover:bg-white/10 transition-all duration-200 font-semibold text-lg"
                >
                  View Nonprofit Packages
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
