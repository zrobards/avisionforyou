'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import StickyCTA from '@/components/shared/StickyCTA'
import ImageLightbox from '@/components/shared/ImageLightbox'
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
      <section className="bg-[#0a1128] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1128] via-[#0a1128] to-[#1a1a40] opacity-90"></div>
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 text-white leading-tight"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
              >
                Hi, I'm Sean. This is Zach.{' '}
                <span className="text-[#ef4444]">We build technology that doesn't overwhelm you.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed"
              >
                Most organizations come to us because their tech feels too complicated, broken, or impossible to manage. We fix that — and stick around to make sure it keeps working as you grow.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-lg text-gray-300 mb-10 leading-relaxed"
              >
                We specialize in websites and systems for nonprofits, mental health organizations, and community groups who need technology to feel simple, trustworthy, and human.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
              >
                <Link
                  href="/case-studies/big-red-bus"
                  className="px-8 py-4 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-[#ef4444]/50 transform hover:scale-105"
                >
                  View Our Work
                  <FiArrowRight className="inline-block ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/philosophy"
                  className="px-8 py-4 border-2 border-white/20 text-gray-300 rounded-lg hover:border-[#ef4444] hover:text-white transition-all duration-300 font-semibold text-lg hover:shadow-lg"
                >
                  Our Philosophy
                </Link>
              </motion.div>
            </div>
            
            {/* Right side - Big Red Bus Logo */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 border border-gray-800">
                  <ImageLightbox
                    src="/logos/Stylized Red Bus Logo with Integrated Text.png"
                    alt="Big Red Bus - Mental Health Community Platform"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    priority
                    caption="Big Red Bus — Mental Health Community Platform"
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

      {/* Built by Sean & Zach Section */}
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
              {/* Photo */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-full max-w-2xl">
                  <div className="rounded-2xl overflow-hidden border-2 border-[#ef4444]/30 shadow-2xl hover:shadow-[#ef4444]/40 transition-all duration-300">
                    <ImageLightbox
                      src="/sean-zach-photo.png"
                      alt="Sean, Zach & Gabe"
                      width={700}
                      height={500}
                      className="w-full h-auto object-cover"
                      caption="Zach (left), Sean (middle), Gabe (right)"
                    />
                  </div>
                  <p className="text-center text-gray-400 text-sm mt-3 italic">
                    Zach (left), Sean (middle), Gabe (right)
                  </p>
                </div>
              </div>

              {/* Text */}
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  We're Sean and Zach — two developers from Louisville who build calm, trustworthy tech for organizations that don't have a tech team.
                </p>
                <p>
                  Sean's been building systems since middle school. One early mistake (accidentally crashing a school network in 7th grade) taught him fast how powerful technology can be — and pushed him toward building responsibly, not just experimenting. Since then, he's built Raspberry Pi systems, financial tools, and platforms for real organizations.
                </p>
                <p>
                  Zach came in with a strong finance and business mindset and quickly became a real builder too — not just planning, but coding and problem-solving alongside Sean.
                </p>
                <p>
                  We started with Big Red Bus and learned how to build accessible technology that feels simple and human. When you work with SeeZee, you get a real team: we both code, we both stay involved, and we build with you from first draft to long-term support.
                </p>
                <p className="text-sm text-gray-400 italic">
                  Gabe (the guy on the right) brings the muscle to the fight — handling the heavy lifting when projects need extra hands.
                </p>
                <p className="text-white font-semibold">
                  We don't just pitch ideas — we show up with drafts, designs, and a clear plan.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: '📊', title: '10+ Projects', subtitle: 'Delivered on time' },
                { icon: '⚡', title: '<24 Hour', subtitle: 'Average response time' },
                { icon: '🎓', title: 'FBLA Certified', subtitle: 'Real competition experience' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="p-6 rounded-xl bg-[#0a1128] border-2 border-white/10 hover:border-[#ef4444]/50 transition-all duration-300 text-center shadow-lg hover:shadow-xl"
                >
                  <div className="text-5xl mb-3">{stat.icon}</div>
                  <h3 className="text-xl font-heading font-bold text-white mb-2">{stat.title}</h3>
                  <p className="text-gray-400 text-sm">{stat.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-6 text-white">
                Who We Build For
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                We work with organizations that need technology to feel calm, clear, and dependable.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <FiHeart className="w-12 h-12" />,
                title: 'Mental Health Organizations',
                description: 'Support groups, recovery programs, therapy centers',
                color: 'text-blue-400',
                bgColor: 'bg-blue-400/10'
              },
              {
                icon: <FiUsers className="w-12 h-12" />,
                title: 'Neuro-Inclusive Communities',
                description: 'ADHD, autism, cognitive accessibility advocacy',
                color: 'text-purple-400',
                bgColor: 'bg-purple-400/10'
              },
              {
                icon: <FiHeart className="w-12 h-12" />,
                title: 'Senior & Community Groups',
                description: 'Organizations serving older adults who need simple tech',
                color: 'text-green-400',
                bgColor: 'bg-green-400/10'
              },
              {
                icon: <FiShield className="w-12 h-12" />,
                title: 'Nonprofits & Small Teams',
                description: '501(c)(3) orgs with limited budgets and big missions',
                color: 'text-orange-400',
                bgColor: 'bg-orange-400/10'
              },
            ].map((group, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-8 rounded-xl border border-white/10 bg-[#1a2332]/50 backdrop-blur hover:border-[#ef4444]/50 transition-all duration-300 hover:shadow-xl"
                >
                  <div className={`${group.color} ${group.bgColor} w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110`}>
                    {group.icon}
                  </div>
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
      <section className="py-20 bg-[#1a2332]">
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
                icon: <FiEye className="w-14 h-14" />,
                title: 'Accessible Websites',
                description: 'Clear navigation, large fonts, and clean design. Built so anyone — even non-technical users — can feel confident using your site. No training videos required.',
                color: 'text-blue-400',
                borderColor: 'border-t-blue-400'
              },
              {
                icon: <FiCalendar className="w-14 h-14" />,
                title: 'Donation & Event Systems',
                description: 'Secure donation processing, event scheduling, and support group management that actually works the way you need it to. Simple for your team, reliable for your community.',
                color: 'text-green-400',
                borderColor: 'border-t-green-400'
              },
              {
                icon: <FiTool className="w-14 h-14" />,
                title: 'Admin Dashboards',
                description: 'Simple admin tools that don\'t require a tech degree. Update your site, manage events, track donations — all in one place that makes sense.',
                color: 'text-purple-400',
                borderColor: 'border-t-purple-400'
              },
            ].map((item, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className={`p-8 rounded-xl border border-white/10 border-t-4 ${item.borderColor} bg-[#0a1128]/50 backdrop-blur hover:shadow-2xl transition-all duration-300`}
                >
                  <div className={`${item.color} mb-6 flex justify-center`}>{item.icon}</div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-4 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-center">
                    {item.description}
                  </p>
                </motion.div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project - Big Red Bus */}
      <section className="py-20 bg-[#0a1128] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1128] to-[#1a1a40]/50 opacity-50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
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
                    Big Red Bus needed a platform that wouldn't overwhelm users dealing with mental health and brain health challenges. We designed everything for clarity first — not complexity.
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    A mental health and neuro-inclusive community platform connecting people with brain health challenges to resources, support groups, and community events.
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
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-[#ef4444]/50 transform hover:scale-105"
                  >
                    Read the Full Story
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="rounded-2xl p-8 bg-[#1a2332]/50 border border-white/10 shadow-2xl hover:shadow-[#ef4444]/20 transition-all duration-300 transform hover:-rotate-1">
                  <div className="aspect-video bg-gradient-to-br from-[#ef4444]/20 to-[#dc2626]/20 rounded-xl flex items-center justify-center border border-[#ef4444]/30 p-6">
                    <ImageLightbox
                      src="/logos/Stylized Red Bus Logo with Integrated Text.png"
                      alt="Big Red Bus Platform"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                      priority
                      caption="Big Red Bus — Mental Health Community Platform"
                    />
                  </div>
                  <p className="text-center text-gray-400 text-sm mt-4 font-semibold">
                    Big Red Bus — Mental Health Community Platform
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Featured Project 2: A Vision For You */}
      <section className="py-20 bg-[#1a2332] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] to-[#2d1b69]/30 opacity-50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollAnimation>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Screenshots First */}
                <div className="order-2 lg:order-1">
                  <div className="space-y-4">
                    {/* Main Screenshot */}
                    <div className="rounded-2xl overflow-hidden border-2 border-[#7f3d8b]/50 shadow-2xl hover:shadow-[#7f3d8b]/40 transition-all duration-300">
                      <ImageLightbox 
                        src="/avfy-home.png" 
                        alt="A Vision For You Recovery Platform"
                        width={800}
                        height={600}
                        className="w-full h-auto"
                        caption="A Vision For You Recovery Platform - Homepage"
                      />
                    </div>
                    {/* Mini Gallery */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg overflow-hidden border border-[#7f3d8b]/30">
                        <ImageLightbox src="/avfy-programs.png" alt="Programs" width={300} height={200} className="w-full h-auto" caption="Recovery Programs Directory" />
                      </div>
                      <div className="rounded-lg overflow-hidden border border-[#7f3d8b]/30">
                        <ImageLightbox src="/avfy-donate.png" alt="Donation System" width={300} height={200} className="w-full h-auto" caption="Stripe Donation System" />
                      </div>
                      <div className="rounded-lg overflow-hidden border border-[#7f3d8b]/30">
                        <ImageLightbox src="/avfy-contact.png" alt="Contact" width={300} height={200} className="w-full h-auto" caption="Contact & Support" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-semibold mb-6">
                    <FiHeart className="w-4 h-4" />
                    <span>Launching December 20, 2024</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-4">
                    A Vision For You Recovery
                  </h2>
                  <p className="text-xl text-[#b6e41f] font-mono mb-4">
                    Louisville, Kentucky 501(c)(3)
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    A comprehensive recovery center management platform serving 500+ individuals annually. We built a full-stack system with Stripe donations, program matching, meeting RSVPs, and automated email workflows.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Stripe payment system with impact visualization',
                      'Four recovery programs with detailed pathways',
                      'Department-routed contact system',
                      'Meeting management & automated reminders',
                      'Real-time donation impact calculator',
                      'Admin dashboard for staff operations'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <FiCheck className="w-5 h-5 text-[#b6e41f] flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#7f3d8b] text-white rounded-lg hover:bg-[#6a3374] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-[#7f3d8b]/50 transform hover:scale-105"
                  >
                    View Full Project Details
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-[#0a1128]">
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
                description: 'Built for cognitive clarity, not complexity. Clear navigation, large fonts, minimal distractions — the same principles we used when building Big Red Bus and every project since.',
                bgColor: 'bg-blue-400/10',
                titleColor: 'text-blue-300'
              },
              {
                emoji: '❤️',
                title: 'Community First',
                description: 'We work with both well-funded partners and small nonprofits scraping by. We genuinely believe in making technology affordable for organizations doing important work — because impact matters more than budget size.',
                bgColor: 'bg-pink-400/10',
                titleColor: 'text-pink-300'
              },
              {
                emoji: '🛠️',
                title: 'Long-Term Support',
                description: 'We don\'t disappear after launch. When something breaks, changes, or stops fitting your needs, we\'re here to fix it or rebuild it better. Your success matters to us beyond the initial project.',
                bgColor: 'bg-gray-400/10',
                titleColor: 'text-gray-300'
              },
            ].map((principle, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="p-8 rounded-xl border border-white/10 bg-[#0a1128]/50 backdrop-blur hover:border-[#ef4444]/50 transition-all duration-300 hover:shadow-2xl text-center"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`text-7xl mb-6 inline-block w-24 h-24 flex items-center justify-center rounded-full ${principle.bgColor} transition-all duration-300`}
                  >
                    {principle.emoji}
                  </motion.div>
                  <h3 className={`text-xl font-heading font-semibold ${principle.titleColor} mb-3`}>
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
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-6 text-white">
                Your mission shouldn't be held back by confusing technology.
              </h2>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed mb-10">
                <p>
                  Most nonprofits and community organizations are juggling outdated websites, broken donation tools, and software that nobody knows how to use.
                </p>
                <p>
                  We step in, simplify everything, and take the technical stress off your plate — so you can focus on your mission, not your systems.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-[#ef4444] via-[#dc2626] to-[#b91c1c] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-white">
                Ready to build something meaningful?
              </h2>
              <p className="text-xl md:text-2xl text-white/95 mb-12 leading-relaxed">
                Tell us what you're trying to build. We'll show you what's possible — no pressure, no tech jargon, no BS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/start"
                    className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-[#ef4444] rounded-lg hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-white/30"
                  >
                    Start Your Project
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/start/nonprofit-tiers"
                    className="inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-white text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-semibold text-lg backdrop-blur"
                  >
                    View Nonprofit Packages
                  </Link>
                </motion.div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
