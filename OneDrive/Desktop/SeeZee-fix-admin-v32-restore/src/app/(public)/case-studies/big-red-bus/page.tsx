'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { 
  FiArrowRight, 
  FiCheck, 
  FiHeart, 
  FiUsers, 
  FiCalendar, 
  FiShield, 
  FiZap,
  FiMapPin,
  FiBell,
  FiNavigation,
  FiEye,
  FiExternalLink
} from 'react-icons/fi'
import { FaTiktok, FaInstagram } from 'react-icons/fa'

export default function BigRedBusCaseStudyPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gray-900 py-24 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-sm font-semibold mb-6">
                  <FiHeart className="w-4 h-4" />
                  <span>CASE STUDY</span>
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
              >
                Big Red Bus
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl text-gray-300 leading-relaxed mb-4"
              >
                Digital Platform Supporting Mental Health & Recovery Organizations
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-gray-400 leading-relaxed mb-8"
              >
                Big Red Bus is a Louisville nonprofit bringing mental health and recovery 
                resources to the community through a physical bus and grassroots outreach. 
                We built a digital platform to extend their reach and help similar 
                organizations connect with those they serve.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="my-6"
              >
                <div className="text-lg text-cyan-400 font-mono bg-gray-800/60 border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
                  Built for the 2025–2026 FBLA Coding & Programming competition, 
                  inspired by a real Louisville nonprofit doing critical community work.
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-semibold">
                  FBLA Competition Project • Nonprofit Initiative
                </div>
              </motion.div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Bus Image & Social Media Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation>
              <div className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                  Follow the Big Red Bus Initiative
                </h2>
                <p className="text-lg text-gray-300">
                  The real nonprofit that inspired our platform — see the bus in action
                </p>
              </div>
            </ScrollAnimation>
            
            {/* Instagram Profile */}
            <ScrollAnimation delay={0.1}>
              <div className="mb-12">
                <div className="rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl bg-gray-900">
                  {/* Instagram Header */}
                  <div className="p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                        <FaInstagram className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">@brb.bigredbus</h3>
                        <a
                          href="https://www.instagram.com/brb.bigredbus/?hl=en"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/90 hover:text-white flex items-center gap-2 text-sm mt-1 transition-colors"
                        >
                          View Full Profile on Instagram
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Instagram Content */}
                  <div className="p-6">
                    <p className="text-gray-300 mb-6 text-center">
                      Follow along with the Big Red Bus journey on Instagram
                    </p>
                    
                    {/* Instagram Feed Preview */}
                    <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-6">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <a
                          key={item}
                          href="https://www.instagram.com/brb.bigredbus/?hl=en"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-red-500 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800 group-hover:scale-105 transition-transform">
                            <FaInstagram className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
                          </div>
                        </a>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <div className="text-center">
                      <a
                        href="https://www.instagram.com/brb.bigredbus/?hl=en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-1 shadow-lg"
                      >
                        <FaInstagram className="w-5 h-5" />
                        <span>Follow on Instagram</span>
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            {/* Social Media Links */}
            <ScrollAnimation delay={0.2}>
              <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                <a
                  href="https://www.tiktok.com/@brb.bigredbus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-700 border-2 border-gray-700 hover:border-red-500 rounded-lg text-white font-semibold transition-all duration-200 transform hover:-translate-y-1"
                >
                  <FaTiktok className="w-5 h-5 text-red-400" />
                  <span>Follow on TikTok</span>
                  <FiExternalLink className="w-4 h-4 opacity-70" />
                </a>
                <a
                  href="https://www.instagram.com/brb.bigredbus/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-700 border-2 border-gray-700 hover:border-red-500 rounded-lg text-white font-semibold transition-all duration-200 transform hover:-translate-y-1"
                >
                  <FaInstagram className="w-5 h-5 text-red-400" />
                  <span>Follow on Instagram</span>
                  <FiExternalLink className="w-4 h-4 opacity-70" />
                </a>
              </div>
            </ScrollAnimation>

            {/* TikTok Videos */}
            <ScrollAnimation delay={0.3}>
              <div className="mb-8">
                <h3 className="text-2xl font-heading font-semibold text-white mb-6 text-center">
                  Tour of the Bus
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TikTok Video 1 */}
                  <div className="relative w-full flex justify-center">
                    <div className="relative w-full max-w-[325px] mx-auto">
                      <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '177.78%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full scale-100"
                          src="https://www.tiktok.com/embed/v2/7527025204862733623"
                          allow="encrypted-media; autoplay; clipboard-write;"
                          allowFullScreen
                          title="Big Red Bus TikTok Video 1"
                          loading="lazy"
                          style={{ 
                            border: 'none', 
                            margin: 0, 
                            padding: 0,
                            display: 'block',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* TikTok Video 2 - Tour of the Bus */}
                  <div className="relative w-full flex justify-center">
                    <div className="relative w-full max-w-[325px] mx-auto">
                      <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '177.78%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full scale-100"
                          src="https://www.tiktok.com/embed/v2/7434804615335431466"
                          allow="encrypted-media; autoplay; clipboard-write;"
                          allowFullScreen
                          title="Big Red Bus Tour - TikTok Video"
                          loading="lazy"
                          style={{ 
                            border: 'none', 
                            margin: 0, 
                            padding: 0,
                            display: 'block',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            {/* Alternative Links if Embeds Don't Work */}
            <ScrollAnimation delay={0.4}>
              <div className="text-center">
                <p className="text-gray-400 mb-4">Can't view the videos? Watch them directly:</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="https://www.tiktok.com/@brb.bigredbus/video/7527025204862733623"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline flex items-center gap-2"
                  >
                    Watch Video 1 on TikTok
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-gray-600">•</span>
                  <a
                    href="https://www.tiktok.com/@brb.bigredbus/video/7434804615335431466"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline flex items-center gap-2"
                  >
                    Watch Bus Tour on TikTok
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-8 text-center">
                The Challenge
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  Community organizations doing mental health and recovery work face several challenges:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                    <span>Limited digital presence to reach those who need help</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                    <span>Difficulty connecting people to the right resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                    <span>No centralized platform for events and support groups</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                    <span>Manual processes for community engagement</span>
                  </li>
                </ul>
                <p className="text-xl text-white font-semibold pt-4">
                  Big Red Bus operates a physical bus bringing resources directly to communities. 
                  Our FBLA project creates a digital companion to extend that reach.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-8 text-center">
                Our Solution
              </h2>
              <p className="text-2xl text-white font-semibold mb-4 text-center">
                Built for FBLA Competition & Real Community Impact
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
                We created a comprehensive platform where organizations like Big Red Bus 
                can connect with their communities, share resources, promote events, and 
                build engagement — all through an accessible, easy-to-use digital interface.
              </p>
            </ScrollAnimation>

            {/* Design Principles */}
            <ScrollAnimation delay={0.1}>
              <div className="mb-12">
                <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                  Design Principles
                </h3>
                <p className="text-base text-gray-400 mb-6">
                  Built with cognitive accessibility and community needs in mind
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Accessible navigation (cognitive-friendly design)',
                    'Organization directory (nonprofits + community businesses)',
                    'Event discovery (meetings, support groups, workshops)',
                    'Review system (authentic community feedback)',
                    'Bot verification (quality control)',
                    'Deal features (community support incentives)',
                    'Responsive design (works on all devices)',
                  ].map((principle, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <FiCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{principle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            {/* Key Features */}
            <ScrollAnimation delay={0.2}>
              <div className="mb-12">
                <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                  Platform Features
                </h3>
                <p className="text-base text-gray-400 italic mb-8">
                  Built to meet FBLA competition requirements while solving real 
                  community needs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <FiMapPin className="w-8 h-8" />,
                      title: 'Directory',
                      description: 'Find support groups, resources, therapists, community orgs',
                    },
                    {
                      icon: <FiCalendar className="w-8 h-8" />,
                      title: 'Events',
                      description: 'See meetings, support groups, workshops with clear details',
                    },
                    {
                      icon: <FiBell className="w-8 h-8" />,
                      title: 'Reminders',
                      description: 'Optional email/text reminders (reduce no-shows)',
                    },
                    {
                      icon: <FiNavigation className="w-8 h-8" />,
                      title: 'Simple Navigation',
                      description: 'Large buttons, clear labels, no jargon',
                    },
                    {
                      icon: <FiShield className="w-8 h-8" />,
                      title: 'Safe & Private',
                      description: 'Designed with privacy-first principles, no tracking or data selling',
                    },
                    {
                      icon: <FiEye className="w-8 h-8" />,
                      title: 'Accessible Design',
                      description: 'WCAG AA+ compliant, cognitive accessibility standards',
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 glass-effect"
                    >
                      <div className="text-trinity-red mb-4">{feature.icon}</div>
                      <h4 className="text-xl font-heading font-semibold text-white mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            {/* Technology */}
            <ScrollAnimation delay={0.3}>
              <div>
                <p className="text-sm text-cyan-400 font-mono mb-4">
                  Competition-Grade Implementation
                </p>
                <h3 className="text-2xl font-heading font-semibold text-white mb-6">
                  Technology & Implementation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'React + TypeScript (modern, maintainable)',
                    'Vite (fast build tooling)',
                    'Accessible design standards',
                    'Bot verification system',
                    'Mobile-first responsive design',
                    'Deployed on Vercel',
                  ].map((tech, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <FiZap className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-gray-300">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>


      {/* Screenshots Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-12 text-center">
                Platform Screenshots
              </h2>
            </ScrollAnimation>
            
            {/* Main Screenshot */}
            <ScrollAnimation delay={0.1}>
              <div className="mb-8">
                <div className="rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                  <ImageLightbox 
                    src="/big-red-bus-1.png" 
                    alt="Big Red Bus - Home Page"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    caption="Homepage - Discover and support community organizations"
                  />
                </div>
                <p className="text-center text-gray-400 mt-4 text-sm">
                  Homepage - Discover and support community organizations
                </p>
              </div>
            </ScrollAnimation>

            {/* Secondary Screenshots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScrollAnimation delay={0.2}>
                <div className="rounded-xl overflow-hidden border-2 border-gray-700 hover:border-cyan-500 transition-all duration-300 shadow-xl">
                  <ImageLightbox 
                    src="/big-red-bus-2.png" 
                    alt="Organization Directory"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    caption="Directory - Search and filter organizations by category and location"
                  />
                </div>
                <p className="text-center text-gray-400 mt-2 text-sm">
                  Directory - Search and filter organizations by category and location
                </p>
              </ScrollAnimation>

              <ScrollAnimation delay={0.3}>
                <div className="rounded-xl overflow-hidden border-2 border-gray-700 hover:border-cyan-500 transition-all duration-300 shadow-xl">
                  <ImageLightbox 
                    src="/big-red-bus-3.png" 
                    alt="About FBLA Page"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    caption="About FBLA - Competition context and project goals"
                  />
                </div>
                <p className="text-center text-gray-400 mt-2 text-sm">
                  About FBLA - Competition context and project goals
                </p>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* What This Project Demonstrates Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-12 text-center">
                What This Project Demonstrates
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p className="text-xl text-white font-semibold">
                  Big Red Bus shows how SeeZee approaches nonprofit technology:
                </p>
                <ul className="space-y-4 ml-6">
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                    <div>
                      <span className="text-white font-semibold">Start with a real community need</span>
                      <p className="text-gray-400 mt-1">
                        Inspired by an actual Louisville nonprofit doing mental health outreach
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                    <div>
                      <span className="text-white font-semibold">Build accessible, human-centered platforms</span>
                      <p className="text-gray-400 mt-1">
                        Cognitive-friendly design that reduces barriers to access
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                    <div>
                      <span className="text-white font-semibold">Combine technical excellence with mission focus</span>
                      <p className="text-gray-400 mt-1">
                        Competition-grade implementation solving real problems
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3 flex-shrink-0 mt-1 text-lg">•</span>
                    <div>
                      <span className="text-white font-semibold">Create tools that extend an organization's reach</span>
                      <p className="text-gray-400 mt-1">
                        Digital platforms that amplify grassroots impact
                      </p>
                    </div>
                  </li>
                </ul>
                <p className="text-base text-white font-semibold pt-6 border-t border-gray-700">
                  This competition project became a real demonstration of how digital platforms 
                  can amplify the impact of grassroots nonprofit work.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-5xl mx-auto">
              {/* Main Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Left Column */}
                <div className="text-center md:text-left p-8 bg-gray-800/50 rounded-xl border border-gray-700">
                  <h3 className="text-2xl font-heading font-bold text-white mb-3">
                    Explore the Platform
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    See the live FBLA competition project and explore how organizations 
                    can connect with their communities.
                  </p>
                  <a
                    href="https://fbla-coding-and-programming-web.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg transform hover:-translate-y-1"
                  >
                    <FiExternalLink className="w-5 h-5" />
                    View Live Platform
                  </a>
                </div>

                {/* Right Column */}
                <div className="text-center md:text-left p-8 bg-gray-800/50 rounded-xl border border-gray-700">
                  <h3 className="text-2xl font-heading font-bold text-white mb-3">
                    View the Code
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Check out the implementation, architecture, and technical 
                    approach on GitHub.
                  </p>
                  <a
                    href="https://github.com/SeanSpon/FBLA-Coding-And-Programming"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg transform hover:-translate-y-1"
                  >
                    <FiExternalLink className="w-5 h-5" />
                    GitHub Repository
                  </a>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="text-center p-8 bg-gradient-to-r from-cyan-900/20 to-gray-800/20 rounded-xl border border-cyan-500/30">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                  Building something for your community?
                </h2>
                <p className="text-lg text-gray-300 mb-6 leading-relaxed max-w-2xl mx-auto">
                  We specialize in accessible, compassionate digital platforms for nonprofits 
                  and support organizations.
                </p>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-lg transform hover:-translate-y-1"
                >
                  Start Your Project
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

