'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { FiCheck } from 'react-icons/fi'

export default function ProjectsPage() {
  return (
    <div className="w-full bg-[#0a1128]">
      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="bg-[#0a1128] py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                What We're Building
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              >
                We're just getting started. Here's real work we're actively developing and what we've already shipped.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-sm text-[#22d3ee] font-mono mt-4"
              >
                Updated December 2024
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ========================================
          PROJECT CARDS CONTAINER
          ======================================== */}
      <section className="bg-[#1a2332] py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          {/* ========================================
              AVFY PROJECT CARD
              ======================================== */}
          <ScrollAnimation>
            <div className="bg-white/[0.03] border border-white/10 rounded-[24px] overflow-hidden">
              
              {/* SECTION 1: HEADER */}
              <div className="bg-gradient-to-br from-[#7f3d8b] to-[#5c2c66] p-8 rounded-t-[24px]">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 text-xs border border-white/30 text-white/90 rounded-full bg-white/10">
                    Client Project
                  </span>
                  <span className="px-3 py-1.5 text-xs border border-white/30 text-white/90 rounded-full bg-white/10">
                    501(c)(3) Nonprofit
                  </span>
                </div>
                
                {/* Status Badge */}
                <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-full text-sm font-medium mt-2 mb-6">
                  🚀 Launching December 20, 2024
                </div>
                
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                  A Vision For You
                </h2>
                
                {/* Subtitle */}
                <p className="text-xl text-[#b6e41f] mb-2">
                  Recovery Center Management Platform
                </p>
                
                {/* Location */}
                <p className="text-sm text-white/60">
                  📍 Louisville, Kentucky
                </p>
              </div>

              {/* SECTION 2: MISSION */}
              <div className="bg-black/30 border-l-4 border-[#b6e41f] p-8">
                <p className="text-lg text-white/90 italic leading-relaxed">
                  "To empower the homeless, addicted, maladjusted, and mentally ill to lead productive lives through housing, education, self-help, treatment, or any other available resource."
                </p>
                <p className="text-sm text-white/60 mt-2">
                  — A Vision For You Recovery
                </p>
              </div>

              {/* SECTION 3: MAIN CONTENT (Two Columns) */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* LEFT COLUMN */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      About the Project
                    </h3>
                    <p className="text-base text-gray-300 leading-relaxed mb-6">
                      A comprehensive recovery center management system serving 500+ individuals annually. Built for A Vision For You, a Louisville-based nonprofit providing four distinct recovery pathways with housing, treatment, and community support.
                    </p>
                    
                    <h4 className="text-lg font-bold text-white mb-4">
                      Four Recovery Programs
                    </h4>
                    
                    {/* Programs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: '🏠', name: 'Surrender Program', duration: '6-9 Month Residential' },
                        { icon: '🧠', name: 'MindBodySoul IOP', duration: 'Intensive Outpatient' },
                        { icon: '⛪', name: 'Moving Mountains', duration: 'Faith-Based Recovery' },
                        { icon: '💜', name: "Women's Program", duration: 'Specialized Care' }
                      ].map((program, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{program.icon}</span>
                            <span className="text-sm font-medium text-white">{program.name}</span>
                          </div>
                          <p className="text-xs text-gray-400">{program.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      What We Built
                    </h3>
                    
                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {[
                        'Client Assessment System',
                        'Meeting & RSVP Management',
                        'Donation Processing (Stripe)',
                        'Impact Dashboard',
                        'Admissions Pipeline',
                        'Content Management',
                        'Email Automation',
                        'Member Management',
                        'Role-Based Access'
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-300">
                          <FiCheck className="text-[#b6e41f] flex-shrink-0 w-4 h-4" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Tech Stack */}
                    <h4 className="text-base font-semibold text-white mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Next.js 14',
                        'TypeScript',
                        'PostgreSQL',
                        'Prisma',
                        'NextAuth',
                        'Stripe'
                      ].map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 text-xs border border-white/20 text-gray-300 rounded-full bg-white/5">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: IMPACT STATS */}
              <div className="bg-gradient-to-br from-[#0a1128] to-[#7f3d8b]/20 p-8">
                <h3 className="text-xl font-bold text-white text-center mb-6">
                  Designed To:
                </h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { number: '500+', label: 'Community Members', sublabel: 'Served annually' },
                    { number: '24/7', label: 'Donation Processing', sublabel: 'Automated acknowledgment' },
                    { number: '4', label: 'Recovery Programs', sublabel: 'Distinct pathways' },
                    { number: '25', label: 'Database Models', sublabel: 'Full platform architecture' }
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-4xl font-bold text-[#b6e41f] mb-2">
                        {stat.number}
                      </div>
                      <div className="text-sm font-medium text-white mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        {stat.sublabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: SCREENSHOTS PREVIEW */}
              <div className="bg-black/30 p-8">
                <h3 className="text-xl font-bold text-white text-center mb-6">
                  Platform Preview
                </h3>
                
                {/* Screenshot Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { src: '/avfy-home.png', label: '🏠 Homepage', alt: 'Homepage' },
                    { src: '/avfy-programs.png', label: '📊 Programs', alt: 'Programs Dashboard' },
                    { src: '/avfy-donate.png', label: '💳 Donations', alt: 'Donation System' }
                  ].map((screenshot, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border-2 border-[#b6e41f]/30 hover:border-[#b6e41f]/60 transition-colors duration-300">
                      <div className="relative aspect-video bg-gradient-to-br from-[#7f3d8b]/20 to-[#b6e41f]/10">
                        <ImageLightbox
                          src={screenshot.src}
                          alt={screenshot.alt}
                          width={600}
                          height={400}
                          className="w-full h-full object-cover"
                          caption={screenshot.label}
                        />
                      </div>
                      <div className="p-3 bg-white/5 text-center">
                        <span className="text-sm text-gray-300">{screenshot.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-white/60 text-center italic mt-4">
                  Full screenshots and case study coming after December 20 launch
                </p>
              </div>

              {/* SECTION 6: BUTTON */}
              <div className="p-8 text-center">
                <button
                  disabled
                  className="px-8 py-3 border border-gray-500 text-gray-500 rounded-lg cursor-not-allowed text-base font-medium"
                >
                  Full Case Study Coming Soon
                </button>
              </div>
            </div>
          </ScrollAnimation>

          {/* ========================================
              BIG RED BUS PROJECT CARD
              ======================================== */}
          <ScrollAnimation>
            <div className="bg-white/[0.03] border border-white/10 rounded-[24px] overflow-hidden">
              
              {/* SECTION 1: HEADER */}
              <div className="bg-gradient-to-br from-[#0a1128] to-[#ef4444]/30 p-8 rounded-t-[24px]">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 text-xs border border-white/30 text-white/90 rounded-full bg-white/10">
                    FBLA Competition
                  </span>
                  <span className="px-3 py-1.5 text-xs border border-white/30 text-white/90 rounded-full bg-white/10">
                    Nonprofit Initiative
                  </span>
                </div>
                
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                  Big Red Bus
                </h2>
                
                {/* Subtitle */}
                <p className="text-xl text-[#22d3ee]">
                  Community Platform for Mental Health & Recovery Organizations
                </p>
              </div>

              {/* SECTION 2: ABOUT */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
                  
                  {/* LEFT - Description */}
                  <div>
                    <p className="text-base text-gray-300 leading-relaxed mb-4">
                      Big Red Bus is a Louisville-based nonprofit initiative using a physical bus to bring mental health resources, recovery support, and community connection directly to those who need it.
                    </p>
                    <p className="text-base text-gray-300 leading-relaxed">
                      For our FBLA Coding & Programming project, we built a digital platform to help organizations like Big Red Bus connect with their communities.
                    </p>
                  </div>

                  {/* RIGHT - Follow Info */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Follow the Initiative
                    </h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>
                        <span className="text-gray-400">Instagram:</span> @brb.bigredbus
                      </div>
                      <div>
                        <span className="text-gray-400">TikTok:</span> @bigredbus
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 italic">
                      Real nonprofit inspiring our FBLA project
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: WHAT WE BUILT */}
              <div className="bg-black/20 p-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  What We Built
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    'Organization directory and search',
                    'Event discovery and community resources',
                    'Support group information',
                    'Review and engagement system',
                    'Deal and promotion features',
                    'Bot verification for quality',
                    'Accessible, cognitive-friendly design',
                    'Mobile-first responsive layout'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-300">
                      <FiCheck className="text-[#22d3ee] flex-shrink-0 w-4 h-4" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Tech Stack */}
                <div className="mt-6">
                  <h4 className="text-base font-semibold text-white mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'React',
                      'TypeScript',
                      'Vite',
                      'Accessible UI'
                    ].map((tech, idx) => (
                      <span key={idx} className="px-3 py-1 text-xs border border-white/20 text-gray-300 rounded-full bg-white/5">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: SCREENSHOTS */}
              <div className="bg-white/[0.03] p-8">
                <h3 className="text-xl font-bold text-white text-center mb-6">
                  Platform Interface
                </h3>
                
                {/* Screenshot Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { src: '/big-red-bus-1.png', label: 'Homepage', alt: 'Homepage' },
                    { src: '/big-red-bus-2.png', label: 'Directory', alt: 'Organization Directory' },
                    { src: '/big-red-bus-3.png', label: 'About', alt: 'About Page' }
                  ].map((screenshot, idx) => (
                    <div 
                      key={idx} 
                      className="rounded-xl overflow-hidden border-2 border-[#ef4444]/30 hover:border-[#ef4444]/60 transition-colors duration-300"
                    >
                      <ImageLightbox
                        src={screenshot.src}
                        alt={screenshot.alt}
                        width={600}
                        height={400}
                        className="w-full h-auto"
                        caption={`Big Red Bus - ${screenshot.label}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: BUTTONS */}
              <div className="p-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://fbla-coding-and-programming-web.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-[#22d3ee] text-[#22d3ee] rounded-lg hover:bg-[#22d3ee] hover:text-[#0a1128] transition-all duration-300 font-medium text-base w-full sm:w-auto text-center"
                >
                  View Live Platform
                </a>
                <Link
                  href="/case-studies/big-red-bus"
                  className="px-6 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all duration-300 font-medium text-base w-full sm:w-auto text-center"
                >
                  Read Full Case Study
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ========================================
          WHY THIS MATTERS SECTION
          ======================================== */}
      <section className="bg-[#0a1128] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold text-white mb-6">
              Why This Matters
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              We don't list fake projects or inflate results. Every project here represents real work, real learning, and real responsibility.
              <br /><br />
              We're early-stage, but we take the work seriously.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* ========================================
          FINAL CTA SECTION
          ======================================== */}
      <section className="bg-[#ef4444] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollAnimation>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Project Could Be Next
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Whether you're a nonprofit, community organization, or small business — let's create something meaningful together.
            </p>
            <Link
              href="/start"
              className="inline-block px-8 py-4 bg-white text-[#ef4444] rounded-lg hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-lg"
            >
              Start Your Project
            </Link>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
