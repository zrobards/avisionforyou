'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import { FiArrowRight, FiExternalLink } from 'react-icons/fi'

interface CaseStudy {
  id: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  tech: string[]
  status: 'live' | 'launching-soon' | 'coming-soon'
  slug: string
  launchDate?: string
  thumbnail: {
    type: 'gradient' | 'image'
    gradient?: string
    icon?: string
    image?: string
  }
}

const caseStudies: CaseStudy[] = [
  {
    id: 'big-red-bus',
    title: 'Big Red Bus',
    subtitle: 'Community Platform for Mental Health & Recovery',
    description: 'A digital platform supporting Louisville\'s mental health community through organization discovery, event scheduling, and accessible resources. Built for FBLA competition and real community impact.',
    tags: ['FBLA Competition', 'Nonprofit Initiative'],
    tech: ['React', 'TypeScript', 'Vite', 'Accessible UI'],
    status: 'live',
    slug: 'big-red-bus',
    thumbnail: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #0a1128 0%, #5c1a1a 100%)',
      icon: '🚌'
    }
  },
  {
    id: 'a-vision-for-you',
    title: 'A Vision For You',
    subtitle: 'Recovery Center Management Platform',
    description: 'Comprehensive platform helping a Louisville nonprofit serve 500+ community members through program management, donation processing, and impact tracking.',
    tags: ['Client Project', '501(c)(3) Nonprofit'],
    tech: ['Next.js 14', 'TypeScript', 'PostgreSQL', 'Prisma', 'Stripe'],
    status: 'live',
    slug: 'a-vision-for-you',
    thumbnail: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #7f3d8b 0%, #5c1a5c 100%)',
      icon: '💜'
    }
  }
]

export default function CaseStudiesPage() {
  return (
    <div className="w-full bg-[#0a1128]">
      {/* Hero Section */}
      <section className="bg-[#0a1128] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Case Studies
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              >
                Real projects. Real impact. Real results.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mt-4"
              >
                See how we build accessible, mission-focused platforms for 
                nonprofits and community organizations.
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="bg-[#1a2332] py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {caseStudies.map((study, index) => (
                <ScrollAnimation key={study.id} delay={index * 0.1}>
                  <motion.div
                    whileHover={study.status === 'live' ? { y: -8 } : {}}
                    className={`bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 ${
                      study.status === 'live' 
                        ? 'hover:shadow-2xl hover:border-white/20' 
                        : 'opacity-90'
                    }`}
                  >
                    {/* Thumbnail Area */}
                    <div 
                      className="h-[300px] flex items-center justify-center relative"
                      style={{
                        background: study.thumbnail.gradient
                      }}
                    >
                      {study.thumbnail.type === 'gradient' && study.thumbnail.icon && (
                        <div className="text-8xl">{study.thumbnail.icon}</div>
                      )}
                      {study.thumbnail.type === 'image' && study.thumbnail.image && (
                        <Image 
                          src={study.thumbnail.image}
                          alt={study.title}
                          width={600}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Status Badge Overlay */}
                      {study.status === 'live' && study.id === 'a-vision-for-you' && (
                        <div className="absolute top-4 right-4">
                          <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full text-sm font-semibold backdrop-blur-sm">
                            ✅ Live
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {study.tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 text-xs border border-[#22d3ee] text-[#22d3ee] rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>


                      {/* Title */}
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {study.title}
                      </h2>

                      {/* Subtitle */}
                      <p className="text-lg text-[#22d3ee] mb-4">
                        {study.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-base text-gray-300 leading-relaxed mb-6">
                        {study.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {study.tech.map((tech, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 text-sm border border-white/20 text-gray-300 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* CTA Button */}
                      {study.status === 'live' && (
                        <Link
                          href={`/case-studies/${study.slug}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg transition-all duration-300 font-semibold w-full justify-center transform hover:scale-105"
                        >
                          Read Case Study
                          <FiArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </ScrollAnimation>
              ))}

              {/* Placeholder Card - Coming Soon */}
              <ScrollAnimation delay={0.3}>
                <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-[20px] overflow-hidden opacity-50 h-full flex items-center justify-center p-12 min-h-[500px]">
                  <div className="text-center">
                    <div className="text-6xl mb-6">⏳</div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      More Case Studies Coming Soon
                    </h3>
                    <p className="text-gray-400 leading-relaxed max-w-md">
                      We're actively building for clients and will share new case 
                      studies as projects complete.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-[#0a1128] py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Build Something Real?
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Whether you're a nonprofit, community organization, or small 
                business — let's create something meaningful together.
              </p>
              <Link
                href="/start"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
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


