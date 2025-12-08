'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import ProjectMockup from '@/components/shared/ProjectMockup'
import { FiArrowRight, FiClock, FiUser, FiZap } from 'react-icons/fi'

export default function ProjectsPage() {
  const projects = [
    {
      id: 'big-red-prints',
      title: 'Red Head Printing',
      client: 'Tina',
      status: 'Work in Progress',
      goal: 'Launch an online store to sell custom printing services and products 24/7',
      whatWeBuilt: 'A full e-commerce platform with product catalog, shopping cart, custom file uploads for print designs, Stripe payments, and order management',
      problemSolved: 'Tina needed a way to take orders online without manually processing each request. Customers can now upload their designs, select products, and check out instantly.',
      result: 'Professional e-commerce store launching in 3 weeks',
      packageType: 'E-Commerce Store',
      features: [
        'Next.js frontend with SSR/SSG',
        'Express backend API',
        'Product catalog & shopping cart',
        'File upload system for custom designs',
        'Stripe payment integration',
        'Order management system',
        'Admin dashboard',
        'User authentication',
        'MongoDB database',
      ],
      mockupType: 'big-red-prints' as const,
    },
    {
      id: 'big-red-bus',
      title: 'Big Red Bus',
      client: 'Partner Nonprofit',
      status: 'Work in Progress',
      goal: 'Create a professional nonprofit directory to connect families with mental health and autism support organizations',
      whatWeBuilt: 'A searchable directory platform with filtering, organization profiles, mission pages, and donation functionality',
      problemSolved: 'Small nonprofits often look unprofessional online. We proved they can have modern, clean websites without big-agency budgets.',
      result: 'A shared brand for community work and FBLA competition',
      packageType: 'Internal + Partner Nonprofit',
      features: [
        'Nonprofit directory with filtering',
        'Search and category filters',
        'Organization detail pages',
        'Mission, Partners, Programs pages',
        'Stories and events sections',
        'Donation functionality',
        'React + TypeScript + Vite',
        'Responsive design',
      ],
      mockupType: 'big-red-bus' as const,
    },
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gray-900 py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        {/* Project-themed decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-32 left-1/4 w-36 h-36 border-2 border-trinity-red/30 transform rotate-45"></div>
          <div className="absolute top-20 right-1/4 w-28 h-28 border-2 border-trinity-red/25 transform -rotate-45"></div>
          <div className="absolute bottom-32 left-1/3 w-32 h-32 border-2 border-trinity-red/20 transform rotate-12"></div>
          <div className="absolute bottom-20 right-1/3 w-24 h-24 border-2 border-trinity-red/25 transform -rotate-12"></div>
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
                <span className="gradient-text">Active Projects</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-white leading-relaxed mb-4"
              >
                Show, don't tell. Here's real work we're building for real businesses.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-trinity-red font-semibold"
              >
                Your project could be next.
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Active Projects Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 max-w-6xl mx-auto">
            {projects.map((project, index) => (
              <ScrollAnimation key={project.id} delay={index * 0.2}>
                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
                          {project.title}
                        </h2>
                        <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold">
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-6 text-gray-200">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          <span className="text-sm">Client: {project.client}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiZap className="w-4 h-4" />
                          <span className="text-sm">{project.packageType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Story */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-trinity-red mb-2">Goal</h3>
                        <p className="text-white leading-relaxed">{project.goal}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-trinity-red mb-2">What We Built</h3>
                        <p className="text-white leading-relaxed">{project.whatWeBuilt}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-trinity-red mb-2">Problem We Solved</h3>
                        <p className="text-white leading-relaxed">{project.problemSolved}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-trinity-red mb-2">Result</h3>
                        <p className="text-white leading-relaxed font-semibold">{project.result}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Technical Features:</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {project.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-gray-300">
                            <span className="text-trinity-red mr-2">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Mockup */}
                  <div className="flex-1 w-full max-w-md">
                    <ProjectMockup projectName={project.title} type={project.mockupType} />
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                SeeZee by the Numbers
              </h2>
              <p className="text-lg text-white">
                We're just getting started, but we're building fast and delivering quality.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
              {[
                { value: '2', label: 'Active Projects', icon: <FiZap className="w-8 h-8" /> },
                { value: '48h', label: 'Build Time', icon: <FiClock className="w-8 h-8" /> },
                { value: '100%', label: 'Client Focus', icon: <FiUser className="w-8 h-8" /> },
                { value: '24/7', label: 'Support Ready', icon: <FiClock className="w-8 h-8" /> },
              ].map((stat, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-6 bg-gray-900 rounded-xl shadow-soft hover:shadow-medium transition-all border-2 border-gray-700"
                  >
                    <div className="text-trinity-red mb-3 flex justify-center">
                      {stat.icon}
                    </div>
                    <div className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-white text-lg">{stat.label}</div>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Your project could be next.
              </h2>
              <p className="text-xl text-white mb-8 leading-relaxed">
                Join our growing list of clients. Professional websites delivered in 2-3 weeks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white rounded-lg hover:bg-gray-900 transition-all duration-200 font-semibold text-lg border-2 border-white hover:border-trinity-red focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  See Our Packages
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
