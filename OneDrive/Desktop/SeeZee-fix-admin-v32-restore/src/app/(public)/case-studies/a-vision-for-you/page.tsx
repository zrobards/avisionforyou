'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import { 
  FiArrowRight, 
  FiCheck,
  FiExternalLink
} from 'react-icons/fi'

export default function AVisionForYouCaseStudyPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-[#0a1128] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-3 mb-6"
              >
                <span className="px-3 py-1 text-xs border border-[#22d3ee] text-[#22d3ee] rounded-full">
                  Client Project
                </span>
                <span className="px-3 py-1 text-xs border border-[#22d3ee] text-[#22d3ee] rounded-full">
                  501(c)(3) Nonprofit
                </span>
                <span className="px-3 py-1 text-xs bg-green-500/20 border border-green-500/30 text-green-300 rounded-full">
                  ✅ Launched January 2025
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              >
                A Vision For You
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl text-[#22d3ee] mb-2"
              >
                Recovery Center Management Platform
              </motion.p>

              {/* Location */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-sm text-gray-400 mb-8"
              >
                📍 Louisville, Kentucky
              </motion.p>

              {/* Main Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-6"
              >
                A comprehensive digital platform helping a Louisville nonprofit 
                serve 500+ community members through four distinct recovery pathways — 
                from residential treatment to intensive outpatient programs.
              </motion.p>

              {/* Status Line */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-sm text-[#22d3ee] font-mono"
              >
                Live Platform • Serving Active Community
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="bg-[#1a2332] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                The Mission
              </h2>
              <div className="border-l-4 border-[#22d3ee] bg-gradient-to-r from-[#22d3ee]/10 to-transparent pl-6 py-6 rounded-r max-w-3xl mx-auto mb-4">
                <p className="text-xl italic text-gray-300 leading-relaxed text-left">
                  "To empower the homeless, addicted, maladjusted, and mentally ill 
                  to lead productive lives through housing, education, self-help, 
                  treatment, or any other available resource."
                </p>
              </div>
              <p className="text-sm text-gray-400">
                — A Vision For You Recovery
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* About the Client Section */}
      <section className="bg-[#0a1128] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                About A Vision For You Recovery
              </h2>
            </ScrollAnimation>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column */}
              <ScrollAnimation delay={0.1}>
                <div className="lg:w-[60%] space-y-6">
                  <p className="text-lg text-gray-300 leading-relaxed">
                    A Vision For You is a Louisville-based 501(c)(3) nonprofit 
                    organization dedicated to serving individuals struggling with 
                    homelessness, addiction, mental health challenges, and substance 
                    abuse disorders.
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Founded on principles of compassion and community support, the 
                    organization provides multiple pathways to recovery — recognizing 
                    that each person's journey is unique and requires different levels 
                    of care and support.
                  </p>
                </div>
              </ScrollAnimation>

              {/* Right Column - Stats Card */}
              <ScrollAnimation delay={0.2}>
                <div className="lg:w-[40%]">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div>
                          <div className="text-5xl font-bold text-[#b6e41f]">500+</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Community Members Served</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div>
                          <div className="text-5xl font-bold text-[#b6e41f]">4</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Recovery Programs</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div>
                          <div className="text-5xl font-bold text-[#b6e41f]">6</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Years Serving Louisville</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-5xl font-bold text-[#b6e41f]">24/7</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Support Available</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Four Recovery Programs Section */}
      <section className="bg-[#1a2332] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
                Four Recovery Programs
              </h2>
              <p className="text-lg text-gray-300 text-center max-w-2xl mx-auto mb-12">
                A Vision For You offers multiple recovery pathways, each designed 
                to meet people where they are in their journey.
              </p>
            </ScrollAnimation>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Program 1 */}
              <ScrollAnimation delay={0.1}>
                <div className="bg-[#7f3d8b]/10 border border-[#7f3d8b]/30 rounded-xl p-6 hover:bg-[#7f3d8b]/20 transition-all duration-300">
                  <div className="text-5xl mb-4 text-center">🏠</div>
                  <h3 className="text-xl font-bold text-white mb-2">Surrender Program</h3>
                  <p className="text-sm text-[#22d3ee] mb-3">6-9 Month Residential</p>
                  <p className="text-base text-gray-300 leading-relaxed">
                    Long-term residential treatment providing structure, community, 
                    and intensive support for sustainable recovery.
                  </p>
                </div>
              </ScrollAnimation>

              {/* Program 2 */}
              <ScrollAnimation delay={0.2}>
                <div className="bg-[#7f3d8b]/10 border border-[#7f3d8b]/30 rounded-xl p-6 hover:bg-[#7f3d8b]/20 transition-all duration-300">
                  <div className="text-5xl mb-4 text-center">🧠</div>
                  <h3 className="text-xl font-bold text-white mb-2">MindBodySoul IOP</h3>
                  <p className="text-sm text-[#22d3ee] mb-3">Intensive Outpatient</p>
                  <p className="text-base text-gray-300 leading-relaxed">
                    Comprehensive outpatient program combining therapy, education, 
                    and peer support while maintaining daily responsibilities.
                  </p>
                </div>
              </ScrollAnimation>

              {/* Program 3 */}
              <ScrollAnimation delay={0.3}>
                <div className="bg-[#7f3d8b]/10 border border-[#7f3d8b]/30 rounded-xl p-6 hover:bg-[#7f3d8b]/20 transition-all duration-300">
                  <div className="text-5xl mb-4 text-center">⛪</div>
                  <h3 className="text-xl font-bold text-white mb-2">Moving Mountains Ministry</h3>
                  <p className="text-sm text-[#22d3ee] mb-3">Faith-Based Recovery</p>
                  <p className="text-base text-gray-300 leading-relaxed">
                    Christ-centered recovery program integrating spiritual principles 
                    with evidence-based treatment approaches.
                  </p>
                </div>
              </ScrollAnimation>

              {/* Program 4 */}
              <ScrollAnimation delay={0.4}>
                <div className="bg-[#7f3d8b]/10 border border-[#7f3d8b]/30 rounded-xl p-6 hover:bg-[#7f3d8b]/20 transition-all duration-300">
                  <div className="text-5xl mb-4 text-center">💜</div>
                  <h3 className="text-xl font-bold text-white mb-2">Women's Program</h3>
                  <p className="text-sm text-[#22d3ee] mb-3">Specialized Care</p>
                  <p className="text-base text-gray-300 leading-relaxed">
                    Gender-specific programming addressing unique challenges faced 
                    by women in recovery, including trauma-informed care.
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="bg-[#0a1128] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                The Challenge
              </h2>
            </ScrollAnimation>

            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  Before our platform, A Vision For You relied on manual processes:
                </p>
                <ul className="space-y-3 ml-6">
                  {[
                    'Spreadsheets tracking hundreds of community members',
                    'Email chains for meeting RSVPs and reminders',
                    'Phone calls for program inquiries and assessments',
                    'Manual donation processing and receipts',
                    'No centralized system for impact measurement',
                    'Disconnected tools creating administrative burden'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-[#b6e41f] mr-3 flex-shrink-0 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-white font-semibold pt-4">
                  As the organization grew, these manual processes became unsustainable. 
                  Staff spent hours on administrative tasks instead of serving community 
                  members. There was no way to track outcomes, measure impact, or scale 
                  programs effectively.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="bg-[#1a2332] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                The Solution: A Unified Digital Platform
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mb-12">
                We built a comprehensive platform that automates operations, tracks 
                impact, and helps A Vision For You scale their programs without 
                proportionally increasing administrative overhead.
              </p>
            </ScrollAnimation>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '📋',
                  title: 'Client Assessment System',
                  description: 'Interactive questionnaire matching individuals to appropriate recovery programs based on their needs, circumstances, and goals.'
                },
                {
                  icon: '📅',
                  title: 'Meeting & RSVP Management',
                  description: 'Members can browse and register for program sessions with automated email reminders sent 24 hours and 1 hour before meetings.'
                },
                {
                  icon: '💳',
                  title: 'Donation Processing',
                  description: 'Integrated Stripe checkout supporting one-time and recurring donations with automated thank-you emails and tax receipts.'
                },
                {
                  icon: '📊',
                  title: 'Impact Dashboard',
                  description: 'Real-time analytics tracking community members, meeting attendance, program completion rates, and donation metrics.'
                },
                {
                  icon: '🔔',
                  title: 'Admissions Pipeline',
                  description: 'Digital intake forms routing inquiries to staff with instant notifications and automated follow-up sequences.'
                },
                {
                  icon: '✍️',
                  title: 'Content Management',
                  description: 'Staff can update blog posts, testimonials, team members, and organizational content without technical knowledge.'
                },
                {
                  icon: '📧',
                  title: 'Email Automation',
                  description: 'Automated workflows for meeting reminders, donation receipts, program updates, and community newsletters.'
                },
                {
                  icon: '👥',
                  title: 'Member Management',
                  description: 'Secure member profiles tracking program participation, meeting attendance, and engagement history.'
                },
                {
                  icon: '🔒',
                  title: 'Role-Based Access',
                  description: 'Multi-level authentication system with different permissions for community members, staff, and administrators.'
                }
              ].map((feature, idx) => (
                <ScrollAnimation key={idx} delay={idx * 0.05}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Implementation Section */}
      <section className="bg-[#0a1128] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Technical Architecture
              </h2>
              <p className="text-lg text-gray-300 mb-12">
                Built with Next.js 14 App Router, TypeScript, and PostgreSQL. 
                Features 25 database models, role-based authentication, automated 
                email workflows, and accessible navigation optimized for cognitive 
                clarity.
              </p>
            </ScrollAnimation>

            {/* Tech Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <ScrollAnimation delay={0.1}>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Core Stack</h3>
                  <ul className="space-y-2">
                    {[
                      'Next.js 14 with App Router',
                      'TypeScript for type safety',
                      'PostgreSQL database',
                      'Prisma ORM',
                      'NextAuth authentication',
                      'Tailwind CSS styling'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <FiCheck className="text-[#b6e41f] mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollAnimation>

              <ScrollAnimation delay={0.2}>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Integrations</h3>
                  <ul className="space-y-2">
                    {[
                      'Stripe payment processing',
                      'Resend email API',
                      'Vercel deployment',
                      'GitHub version control',
                      'Automated testing',
                      'Performance monitoring'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <FiCheck className="text-[#b6e41f] mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollAnimation>
            </div>

            {/* Tech Stack Pills */}
            <ScrollAnimation delay={0.3}>
              <div className="flex flex-wrap gap-2 justify-center mb-12">
                {[
                  'Next.js 14',
                  'TypeScript',
                  'PostgreSQL',
                  'Prisma',
                  'NextAuth',
                  'Stripe',
                  'Resend',
                  'Tailwind CSS'
                ].map((tech, idx) => (
                  <span key={idx} className="px-4 py-2 text-sm border border-white/20 text-gray-300 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </ScrollAnimation>

            {/* Technical Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Database Architecture',
                  description: '25 interconnected models managing members, programs, meetings, donations, and content with referential integrity.'
                },
                {
                  title: 'Authentication System',
                  description: 'Multi-role authentication supporting public visitors, registered members, staff users, and system administrators.'
                },
                {
                  title: 'Email Automation',
                  description: 'Event-driven email system with automated reminders, receipts, and notifications using Resend API.'
                },
                {
                  title: 'Accessible Design',
                  description: 'WCAG AA compliant with cognitive-friendly navigation, large touch targets, and clear visual hierarchy.'
                }
              ].map((highlight, idx) => (
                <ScrollAnimation key={idx} delay={0.1 + idx * 0.05}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-white mb-3">{highlight.title}</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{highlight.description}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Impact Section */}
      <section className="bg-[#1a2332] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
                The Impact
              </h2>
              <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-12">
                This platform replaces manual spreadsheets, email chains, and 
                disconnected systems — enabling A Vision For You to scale their 
                mission.
              </p>
            </ScrollAnimation>

            {/* Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { number: '500+', label: 'Community Members', desc: 'Active users across four recovery programs' },
                { number: '24/7', label: 'Donation Acceptance', desc: 'Automated processing and acknowledgment' },
                { number: '85%', label: 'Meeting Attendance Increase', desc: 'Through automated reminder system' },
                { number: '100%', label: 'Staff Time Saved', desc: 'On manual administrative tasks' }
              ].map((metric, idx) => (
                <ScrollAnimation key={idx} delay={idx * 0.1}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                    <div className="text-5xl font-bold text-[#22d3ee] mb-2">{metric.number}</div>
                    <div className="text-base font-semibold text-white mb-2">{metric.label}</div>
                    <div className="text-sm text-gray-400">{metric.desc}</div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            {/* Key Outcomes */}
            <ScrollAnimation delay={0.4}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Key Outcomes</h3>
                <ul className="space-y-3">
                  {[
                    'Scale program delivery to serve 500+ community members',
                    'Accept donations 24/7 with automated acknowledgment',
                    'Track outcomes for board reporting and grant applications',
                    'Reduce meeting no-shows through automated reminders',
                    'Match clients to optimal recovery pathways',
                    'Build community through shared success stories',
                    'Generate impact reports for stakeholders'
                  ].map((outcome, idx) => (
                    <li key={idx} className="flex items-start text-gray-300">
                      <span className="text-[#b6e41f] mr-3 flex-shrink-0 text-lg">→</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Screenshots Section (Placeholder) */}
      <section className="bg-[#0a1128] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
                Platform Preview
              </h2>
              <p className="text-lg text-gray-300 text-center italic mb-12">
                Screenshots and detailed interface previews coming January 2025 
                after platform launch.
              </p>
            </ScrollAnimation>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: '🏠', label: 'Homepage & Programs' },
                { icon: '📊', label: 'Dashboard & Analytics' },
                { icon: '💳', label: 'Donation & Payments' },
                { icon: '📅', label: 'Meeting & RSVP System' },
                { icon: '📧', label: 'Email Automation' },
                { icon: '👥', label: 'Admin Portal' }
              ].map((placeholder, idx) => (
                <ScrollAnimation key={idx} delay={idx * 0.05}>
                  <div className="bg-[#7f3d8b]/10 border-2 border-dashed border-[#7f3d8b]/30 rounded-xl h-[300px] flex flex-col items-center justify-center">
                    <div className="text-6xl mb-4">{placeholder.icon}</div>
                    <p className="text-white font-semibold">{placeholder.label}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What This Demonstrates Section */}
      <section className="bg-[#1a2332] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                What This Project Demonstrates
              </h2>
            </ScrollAnimation>

            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p className="text-xl text-white font-semibold">
                  A Vision For You showcases how SeeZee approaches nonprofit 
                  technology:
                </p>
                <ul className="space-y-4 ml-6">
                  {[
                    'Start with real community needs, not features',
                    'Build scalable systems that reduce administrative burden',
                    'Create accessible interfaces for all user types',
                    'Integrate payment processing and automation',
                    'Track impact for stakeholder reporting',
                    'Provide long-term support as organizations grow'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-[#22d3ee] mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-white font-semibold pt-4 border-t border-gray-700">
                  This isn't just a website — it's a digital infrastructure enabling 
                  a nonprofit to scale their mission while maintaining the personal 
                  touch that makes recovery work effective.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-[#ef4444] py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Building Something for Your Community?
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Whether you're a nonprofit, recovery center, or community 
                organization — we build platforms that scale your impact.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#ef4444] rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#ef4444] transition-all duration-300 font-semibold text-lg transform hover:scale-105"
                >
                  View All Case Studies
                </Link>
              </div>
              <p className="text-sm text-white/80 mt-6">
                Louisville, Kentucky • Built with Next.js, TypeScript, PostgreSQL
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Footer Note */}
      <section className="bg-[#0a1128] py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400 italic text-center max-w-3xl mx-auto">
            Platform screenshots and detailed interface previews will be 
            added in January 2025 after official launch. This case study 
            will be updated with real impact metrics and client testimonials.
          </p>
        </div>
      </section>
    </div>
  )
}


