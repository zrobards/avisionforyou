'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiBriefcase, 
  FiHeart, 
  FiUser, 
  FiTool,
  FiArrowRight,
  FiCheck,
  FiCalendar,
  FiFileText,
  FiDollarSign
} from 'react-icons/fi';
import PageShell from '@/components/PageShell';
import FloatingShapes from '@/components/shared/FloatingShapes';

interface ServiceCard {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  description: string;
  features: string[];
  pricingNote: string;
  href: string;
  featured?: boolean;
}

const services: ServiceCard[] = [
  {
    icon: <FiHeart className="w-8 h-8" />,
    emoji: '🏛️',
    title: 'Nonprofit Website & Platform',
    description: 'Complete digital infrastructure for nonprofits, support groups, and community organizations.',
    features: [
      'Donation systems',
      'Event scheduling & RSVPs',
      'Admin dashboards',
      'Email reminders',
      'Ongoing maintenance',
    ],
    pricingNote: 'Three tiers available • Starting at $6,000 build',
    href: '/start/nonprofit-tiers',
    featured: true,
  },
  {
    icon: <FiBriefcase className="w-8 h-8" />,
    emoji: '💼',
    title: 'Business Website',
    description: 'Modern, professional websites for small businesses and local teams.',
    features: [
      '5-10 pages',
      'Contact forms',
      'Service showcases',
      'Mobile responsive',
      'Basic SEO',
    ],
    pricingNote: 'Custom pricing • Share your budget range',
    href: '/start/contact?service=business',
  },
  {
    icon: <FiUser className="w-8 h-8" />,
    emoji: '👤',
    title: 'Personal Website',
    description: 'Portfolio, resume, or personal brand platform.',
    features: [
      'Clean, modern design',
      'About & contact pages',
      'Portfolio/work showcase',
      'Blog (optional)',
      'Simple admin tools',
    ],
    pricingNote: 'Custom pricing • Typically $1,500-$3,000',
    href: '/start/contact?service=personal',
  },
  {
    icon: <FiTool className="w-8 h-8" />,
    emoji: '🔧',
    title: 'Maintenance Plan',
    description: 'Ongoing support for your existing website.',
    features: [
      'Updates & bug fixes',
      'Security monitoring',
      'Content changes',
      'Performance optimization',
      'Priority support',
    ],
    pricingNote: '$79-$149/month • Nonprofit discounts available',
    href: '/start/contact?service=maintenance',
  },
];

export default function StartProjectPage() {
  return (
    <PageShell>
      <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0A0E27] to-[#1a0f2e]">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        
        {/* Hero Section */}
        <section className="relative z-10 pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                Start Your Project
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Choose the service that fits your organization. 
                We'll provide a custom quote within 24 hours.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <span>✓ Clear Pricing</span>
                <span>✓ No Hidden Fees</span>
                <span>✓ Built for Nonprofits</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Service Cards Grid */}
        <section className="relative z-10 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Featured Nonprofit Card - Full Width on Desktop */}
            <div className="mb-6 md:mb-8">
              {services
                .filter(s => s.featured)
                .map((service, index) => (
                  <motion.div
                    key={service.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Link href={service.href} className="block group">
                      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 border-2 border-red-500/50 rounded-2xl p-8 hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
                        {/* Most Popular Badge */}
                        <div className="absolute -top-3 -right-3 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-center">
                          <div>
                            {/* Icon */}
                            <div className="text-5xl mb-4">{service.emoji}</div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-white mb-3">
                              {service.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-300 mb-6 leading-relaxed">
                              {service.description}
                            </p>

                            {/* Feature List */}
                            <ul className="space-y-2 mb-6">
                              {service.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-400">
                                  <span className="text-green-400 mt-1">✓</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Pricing Note */}
                            <p className="text-sm text-gray-500 mb-6">
                              {service.pricingNote}
                            </p>

                            {/* Button */}
                            <button className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 group-hover:scale-105">
                              View Nonprofit Tiers →
                            </button>
                          </div>
                          <div className="hidden md:block">
                            <div className="text-8xl opacity-20 text-center">{service.emoji}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>

            {/* Other Service Cards - 3 Column Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {services
                .filter(s => !s.featured)
                .map((service, index) => (
                  <motion.div
                    key={service.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                  >
                    <Link href={service.href} className="block h-full group">
                      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 h-full hover:border-gray-700 hover:shadow-xl transition-all duration-300">
                        {/* Icon */}
                        <div className="text-5xl mb-4">{service.emoji}</div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {service.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          {service.description}
                        </p>

                        {/* Feature List */}
                        <ul className="space-y-2 mb-6">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-400">
                              <span className="text-green-400 mt-1">✓</span>
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Pricing Note */}
                        <p className="text-sm text-gray-500 mb-6">
                          {service.pricingNote}
                        </p>

                        {/* Button */}
                        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200">
                          Get Started →
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative z-10 py-16 px-6 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Choose Your Service',
                  description: 'Pick the option that fits your needs',
                  icon: <FiFileText className="w-8 h-8" />,
                },
                {
                  step: '2',
                  title: 'Tell Us About Your Project',
                  description: 'Quick form (2-3 minutes)',
                  icon: <FiCalendar className="w-8 h-8" />,
                },
                {
                  step: '3',
                  title: 'Get Your Custom Quote',
                  description: "We'll send pricing within 24 hours",
                  icon: <FiDollarSign className="w-8 h-8" />,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-full mb-4 text-red-400">
                    {item.icon}
                  </div>
                  <div className="text-4xl font-bold text-red-600 mb-2">{item.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Questions / Support Section */}
        <section className="relative z-10 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Not Sure Which Service Is Right?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                We're happy to help you figure it out. Book a free 15-minute consultation 
                and we'll guide you through the options.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  Book a Call
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  View Our Work
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
