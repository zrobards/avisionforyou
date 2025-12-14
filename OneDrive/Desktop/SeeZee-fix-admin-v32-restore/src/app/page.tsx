'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
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
  const [photoSrc, setPhotoSrc] = useState('/sean-zach-photo.png')
  
  const handleMuscleClick = () => {
    // Play the sound effect
    const audio = new Audio('/grrr-sound.mp3')
    audio.play().catch(err => console.log('Audio play failed:', err))
    
    // Swap to fortnitr1 photo
    setPhotoSrc('/fortnitr1.png')
  }
  return (
    <div className="w-full">
      <StickyCTA />
      
      {/* Hero Section - Centered & Bold */}
      <section className="bg-[#0a0a0a] py-32 lg:py-40 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a1128] to-[#1a1a40]"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{ backgroundSize: '200% 200%' }}
        />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.03]"></div>
        
        {/* Floating Elements */}
        {/* Big Red Bus Logo - Top Right */}
        <motion.div
          className="absolute top-20 right-[10%] hidden lg:block opacity-25"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/logos/Stylized Red Bus Logo with Integrated Text.png"
            alt=""
            width={300}
            height={200}
            className="select-none"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </motion.div>

        {/* AVFY Purple Circle - Bottom Left */}
        <motion.div
          className="absolute bottom-32 left-[8%] w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl hidden lg:block"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Red Glow - Top Left */}
        <motion.div
          className="absolute top-20 left-[5%] w-96 h-96 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl hidden lg:block"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Floating UI Screenshot - Left */}
        <motion.div
          className="absolute left-[5%] top-1/2 -translate-y-1/2 opacity-20 hidden xl:block"
          animate={{
            y: [-20, 20, -20],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-64 h-48 bg-gray-800/70 rounded-lg border border-white/30 p-4">
            <div className="w-full h-3 bg-white/50 rounded mb-2"></div>
            <div className="w-3/4 h-3 bg-white/50 rounded mb-4"></div>
            <div className="w-full h-20 bg-white/30 rounded"></div>
          </div>
        </motion.div>

        {/* Floating Code Snippet - Right */}
        <motion.div
          className="absolute right-[5%] top-1/3 opacity-25 hidden xl:block"
          animate={{
            y: [20, -20, 20],
            rotate: [2, -2, 2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <div className="w-72 h-40 bg-gray-900/70 rounded-lg border border-cyan-500/40 p-4 font-mono text-xs text-cyan-300">
            <div className="mb-1">{'<section className="...">'}</div>
            <div className="ml-4 mb-1">{'<h1>Build Tech</h1>'}</div>
            <div className="ml-4 mb-1">{'<p>That Works</p>'}</div>
            <div className="mb-1">{'</section>'}</div>
          </div>
        </motion.div>

        {/* Floating Math Formulas & Code Symbols */}
        {/* Math Formula 1 - Top Center */}
        <motion.div
          className="absolute top-32 left-[20%] opacity-15 hidden lg:block font-serif text-white/40 text-2xl"
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ∫ f(x)dx = F(x) + C
        </motion.div>

        {/* Math Formula 2 - Right Side */}
        <motion.div
          className="absolute top-[45%] right-[15%] opacity-12 hidden lg:block font-serif text-purple-300/30 text-xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            opacity: [0.12, 0.2, 0.12],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        >
          lim<sub>x→∞</sub> (1 + 1/x)<sup>x</sup> = e
        </motion.div>

        {/* Math Formula 3 - Bottom Right */}
        <motion.div
          className="absolute bottom-[25%] right-[8%] opacity-10 hidden xl:block font-serif text-cyan-300/40 text-lg"
          animate={{
            y: [0, 25, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        >
          ∇²φ = ∂²φ/∂x² + ∂²φ/∂y²
        </motion.div>

        {/* Math Formula 4 - Left Side */}
        <motion.div
          className="absolute top-[60%] left-[12%] opacity-12 hidden lg:block font-serif text-red-300/30 text-xl"
          animate={{
            x: [-10, 10, -10],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          E = mc² = γm₀c²
        </motion.div>

        {/* Code Symbol 1 - Top Left */}
        <motion.div
          className="absolute top-[35%] left-[8%] opacity-15 hidden xl:block font-mono text-green-300/40 text-sm"
          animate={{
            y: [0, -25, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        >
          const build = (idea) =&gt; reality;
        </motion.div>

        {/* Math Symbol 5 - Bottom Left */}
        <motion.div
          className="absolute bottom-[35%] left-[18%] opacity-10 hidden lg:block font-serif text-orange-300/30 text-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          Σ
        </motion.div>

        {/* Math Formula 6 - Center Right */}
        <motion.div
          className="absolute top-[25%] right-[25%] opacity-12 hidden xl:block font-serif text-blue-300/35 text-lg"
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
        >
          ∂u/∂t = α∇²u
        </motion.div>

        {/* Code Symbol 2 - Middle Right */}
        <motion.div
          className="absolute top-[55%] right-[20%] opacity-15 hidden lg:block font-mono text-pink-300/40 text-xs"
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 7,
          }}
        >
          {'{ accessible: true, beautiful: true }'}
        </motion.div>

        {/* Math Symbol 7 - Top Right Corner */}
        <motion.div
          className="absolute top-[15%] right-[30%] opacity-10 hidden lg:block font-serif text-yellow-300/30 text-2xl"
          animate={{
            rotate: [0, -10, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          π ≈ 3.14159
        </motion.div>

        {/* Math Formula 8 - Lower Left */}
        <motion.div
          className="absolute bottom-[45%] left-[25%] opacity-12 hidden xl:block font-serif text-indigo-300/35 text-base"
          animate={{
            x: [0, 15, 0],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8,
          }}
        >
          √(a² + b²) = c
        </motion.div>

        {/* Code Symbol 3 - Bottom Center */}
        <motion.div
          className="absolute bottom-[30%] left-[40%] opacity-10 hidden lg:block font-mono text-teal-300/40 text-sm"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 9,
          }}
        >
          npm install empathy
        </motion.div>

        {/* Math Symbol 9 - Far Right */}
        <motion.div
          className="absolute top-[70%] right-[10%] opacity-15 hidden xl:block font-serif text-purple-300/40 text-4xl"
          animate={{
            rotate: [0, 5, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
        >
          ∞
        </motion.div>

        {/* Main Content - Centered */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
          <div className="text-center">
            
            {/* Location Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-cyan-500/10 border border-cyan-500/20 rounded-full backdrop-blur-sm"
            >
              <FiMapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-mono text-sm tracking-wide">Louisville, Kentucky</span>
            </motion.div>

            {/* Main Headline - Bold & Dramatic */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black mb-8 leading-[1.1]"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
            >
              <span className="text-white">Technology That </span>
              <span className="text-white block mt-2">Actually Works.</span>
              <span className="text-white block mt-4">For Organizations</span>
              <span className="block mt-2">
                <span className="text-white">That Actually </span>
                <motion.span 
                  className="text-[#ef4444] inline-block"
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(239, 68, 68, 0.3)',
                      '0 0 40px rgba(239, 68, 68, 0.5)',
                      '0 0 20px rgba(239, 68, 68, 0.3)',
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Matter
                </motion.span>
                <span className="text-white">.</span>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Sean & Zach build accessible platforms for mental health organizations, 
              recovery centers, and nonprofits that need technology to feel{' '}
              <span className="text-white font-semibold">simple, trustworthy, and human</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-10 py-5 bg-[#ef4444] text-white rounded-lg font-bold text-lg shadow-2xl hover:shadow-[#ef4444]/50 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10">Start Your Project</span>
                  <FiArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#ef4444] to-[#dc2626]"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-10 py-5 border-2 border-white/20 text-white rounded-lg hover:border-white hover:bg-white/5 transition-all duration-300 font-semibold text-lg backdrop-blur-sm"
                >
                  See Our Work
                </Link>
              </motion.div>
            </motion.div>

            {/* Proof Points - Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap gap-4 justify-center max-w-3xl mx-auto"
            >
              {[
                { icon: <FiCheck className="w-4 h-4" />, text: 'FBLA Competitors' },
                { icon: <FiEye className="w-4 h-4" />, text: 'Accessibility-First' },
                { icon: <FiUsers className="w-4 h-4" />, text: '2 Active Projects' },
                { icon: <FiHeart className="w-4 h-4" />, text: 'Nonprofit Specialists' },
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:border-white/30 transition-all duration-300"
                >
                  <span className="text-cyan-400">{badge.icon}</span>
                  <span className="text-gray-300 text-sm font-medium">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mt-20"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex flex-col items-center gap-2 text-gray-500"
              >
                <span className="text-xs uppercase tracking-wider font-mono">Scroll to explore</span>
                <div className="w-6 h-10 border-2 border-gray-700 rounded-full p-1">
                  <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 h-3 bg-cyan-500 rounded-full mx-auto"
                  />
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a2332] to-transparent"></div>
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
                      src={photoSrc}
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
                  Gabe (the guy on the right) brings the{' '}
                  <span 
                    onClick={handleMuscleClick}
                    className="cursor-pointer hover:text-[#ef4444] transition-colors duration-200 font-bold"
                  >
                    muscle
                  </span>
                  {' '}to the fight — handling the heavy lifting when projects need extra hands.
                </p>
                <p className="text-white font-semibold">
                  We don't just pitch ideas — we show up with drafts, designs, and a clear plan.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: '🚀', title: '2 Active Projects', subtitle: 'Serving 500+ people annually' },
                { icon: '⚡', title: '<24 Hour', subtitle: 'Average response time' },
                { icon: '✅', title: 'Open For Business', subtitle: 'Accepting new clients now' }
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
