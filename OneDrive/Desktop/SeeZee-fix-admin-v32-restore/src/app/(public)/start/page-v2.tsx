'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiBriefcase, 
  FiHeart, 
  FiUser, 
  FiTool,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';
import PageShell from '@/components/PageShell';
import FloatingShapes from '@/components/shared/FloatingShapes';
import { ServiceCategory } from '@prisma/client';
import {
  getServiceCategoryDisplayName,
  getServiceCategoryDescription,
  getServiceCategoryStartingPrice,
} from '@/lib/service-mapping';

interface ServiceOption {
  category: ServiceCategory;
  icon: React.ReactNode;
  features: string[];
  color: string;
  href: string;
}

const services: ServiceOption[] = [
  {
    category: ServiceCategory.BUSINESS_WEBSITE,
    icon: <FiBriefcase className="w-8 h-8" />,
    features: [
      'Custom professional design',
      'Mobile responsive',
      'SEO optimized',
      'Contact forms & integrations',
      'Content management system',
    ],
    color: 'from-blue-500 to-cyan-500',
    href: '/start/contact?service=business',
  },
  {
    category: ServiceCategory.NONPROFIT_WEBSITE,
    icon: <FiHeart className="w-8 h-8" />,
    features: [
      'Mission-focused design',
      'Donation integration',
      'Event calendar',
      'Volunteer management',
      '40% nonprofit discount',
    ],
    color: 'from-pink-500 to-rose-500',
    href: '/start/contact?service=nonprofit',
  },
  {
    category: ServiceCategory.PERSONAL_WEBSITE,
    icon: <FiUser className="w-8 h-8" />,
    features: [
      'Personal portfolio',
      'Blog integration',
      'Photo galleries',
      'Social media links',
      'Fast & lightweight',
    ],
    color: 'from-purple-500 to-indigo-500',
    href: '/start/contact?service=personal',
  },
  {
    category: ServiceCategory.MAINTENANCE_PLAN,
    icon: <FiTool className="w-8 h-8" />,
    features: [
      'Monthly updates & backups',
      'Security monitoring',
      'Performance optimization',
      'Content updates',
      'Priority support',
    ],
    color: 'from-green-500 to-emerald-500',
    href: '/start/contact?service=maintenance',
  },
];

export default function StartProjectPage() {
  return (
    <PageShell>
      <div className="relative overflow-hidden animated-gradient min-h-screen">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        
        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Start Your Project
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the service that fits your needs. We'll guide you through a simple intake
              process and connect you with our team.
            </p>
          </motion.div>

          {/* Service Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  href={service.href}
                  className="block h-full group"
                >
                  <div className="glass-container rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/10">
                    {/* Icon & Title */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${service.color} text-white`}>
                        {service.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Starting at</div>
                        <div className="text-2xl font-bold text-white">
                          {getServiceCategoryStartingPrice(service.category)}
                        </div>
                      </div>
                    </div>

                    {/* Service Name */}
                    <h3 className="text-2xl font-heading font-bold text-white mb-3 group-hover:text-trinity-red transition-colors">
                      {getServiceCategoryDisplayName(service.category)}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 mb-6">
                      {getServiceCategoryDescription(service.category)}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <FiCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="flex items-center justify-between text-white group-hover:text-trinity-red transition-colors">
                      <span className="font-semibold">Get Started</span>
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-gray-400 mb-4">
              Not sure which option is right for you?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-trinity-red hover:text-trinity-red/80 font-semibold transition-colors"
            >
              Contact us for a consultation
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </section>
      </div>
    </PageShell>
  );
}
