'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { Heart, Phone, ArrowRight, Shield, Users, Home, Utensils, Briefcase, Brain, HandHeart, ChevronLeft, ChevronRight, ExternalLink, Star, CheckCircle, TrendingUp, Award, Clock } from 'lucide-react'
import AnimateOnScroll from '@/components/shared/AnimateOnScroll'
import CountUpNumber from '@/components/shared/CountUpNumber'

const HERO_VIDEO_SRC = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/videos/cloud-background.mp4"

const TESTIMONIALS = [
  {
    name: "Josh J.",
    role: "Client / Intern",
    quote: "A Vision for You is the best treatment center I have ever been to. It is the longest amount of sobriety in my life. I struggle with mental illness, and I am allowed to take my medication, and the staff is very accommodating.",
    initials: "JJ",
  },
  {
    name: "Laura F.",
    role: "Alumni / Staff",
    quote: "I moved here from Georgia seeking help with my addiction. After trying many facilities, AVFY has succeeded in showing me a new way to live. They've given me hope and I'm now employed and a full-time student.",
    initials: "LF",
  },
  {
    name: "Johnny M.",
    role: "Alumni / Staff",
    quote: "14 months ago, I was hopeless, jobless, and homeless. AVFY took me in with open arms. I now work there helping others. AVFY has given me my life back, and I am eternally grateful.",
    initials: "JM",
  },
  {
    name: "Marcus T.",
    role: "Surrender Program Graduate",
    quote: "The Surrender Program saved my life. Having housing, meals, and a supportive community while I got back on my feet made all the difference. I now have my own apartment and a steady job.",
    initials: "MT",
  },
  {
    name: "Sarah K.",
    role: "Family Member",
    quote: "Watching my brother transform through AVFY's programs has been incredible. The staff truly cares and the holistic approach to recovery is unlike anything we'd found before.",
    initials: "SK",
  },
]

const PROGRAMS = [
  { title: "Surrender Program", description: "Voluntary, self-help, social model recovery grounded in 12-step principles", icon: HandHeart, href: "/programs/surrender-program", badge: "100% FREE", badgeColor: "bg-green-500" },
  { title: "MindBodySoul IOP", description: "Intensive Outpatient combining therapy, psychiatry, and evidence-based practices", icon: Brain, href: "/programs/mindbodysoul-iop", badge: "Insurance Accepted", badgeColor: "bg-blue-500" },
  { title: "Housing & Shelter", description: "Safe, supportive residential recovery spaces with community living", icon: Home, href: "/programs/housing", badge: "7 Residences", badgeColor: "bg-purple-500" },
  { title: "Meetings & Groups", description: "Peer-driven recovery meetings, support groups, and community building", icon: Users, href: "/programs/self-help", badge: "Open to All", badgeColor: "bg-amber-500" },
  { title: "Food & Nutrition", description: "Nutritious meals and dietary support as part of holistic recovery", icon: Utensils, href: "/programs/food", badge: "Daily Meals", badgeColor: "bg-orange-500" },
  { title: "Career Reentry", description: "Job training, placement assistance, and employment support", icon: Briefcase, href: "/programs/career", badge: "Job Placement", badgeColor: "bg-teal-500" },
]

const SOCIAL_IMAGES = [
  { src: "/programs/surrender-gathering-1.png", alt: "Recovery community gathering" },
  { src: "/programs/mindbodysoul-group-1.png", alt: "MindBodySoul IOP group session" },
  { src: "/programs/surrender-facility.png", alt: "Surrender program facility" },
  { src: "/programs/mindbodysoul-education.png", alt: "Education session" },
  { src: "/programs/surrender-gathering-2.png", alt: "Peer support meeting" },
  { src: "/programs/mindbodysoul-teaching.png", alt: "Recovery teaching session" },
]

const SOCIAL_CHANNELS = [
  { name: "Facebook", followers: "869", url: "https://www.facebook.com/avisionforyourecovery", color: "from-blue-600 to-blue-700", hoverColor: "hover:from-blue-700 hover:to-blue-800" },
  { name: "Instagram", followers: "112", url: "https://www.instagram.com/avision_foryourecovery/", color: "from-pink-500 to-purple-600", hoverColor: "hover:from-pink-600 hover:to-purple-700" },
  { name: "TikTok", followers: "41", url: "https://www.tiktok.com/@avisionforyourecovery", color: "from-gray-900 to-gray-800", hoverColor: "hover:from-gray-800 hover:to-gray-700" },
  { name: "LinkedIn", followers: "23", url: "https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/", color: "from-blue-700 to-blue-800", hoverColor: "hover:from-blue-800 hover:to-blue-900" },
]

export default function HomeClient() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
  }, [])

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }, [])

  // Auto-rotate testimonials (disabled if user prefers reduced motion)
  useEffect(() => {
    if (prefersReducedMotion) return
    const interval = setInterval(nextTestimonial, 6000)
    return () => clearInterval(interval)
  }, [nextTestimonial, prefersReducedMotion])

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/AVFY%20LOGO.jpg"
          className="absolute top-0 left-0 h-full w-full object-cover"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-brand-green" />
              <span className="text-sm font-medium">501(c)(3) Nonprofit Organization</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Everyone Deserves a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">
                Second Chance
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Empowering the homeless, addicted, and mentally ill to lead productive lives through housing, treatment, education, and community support.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                href="/donate"
                className="group px-8 py-4 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-green/25 hover:shadow-xl hover:shadow-brand-green/40 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Donate Now
              </Link>
              <Link
                href="/programs"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Our Programs
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:+15027496344"
                className="px-8 py-4 bg-red-600/90 backdrop-blur-sm border border-red-400/30 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Get Help Now
              </a>
            </div>
          </div>

          {/* Animated Impact Ticker */}
          <div className="absolute bottom-0 left-0 right-0 bg-brand-dark backdrop-blur-sm border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-green">
                  <CountUpNumber end={500} suffix="+" />
                </div>
                <p className="text-xs sm:text-sm text-white/70">Lives Transformed</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-green">
                  <CountUpNumber end={7} />
                </div>
                <p className="text-xs sm:text-sm text-white/70">Recovery Residences</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-green">
                  <CountUpNumber end={6} />
                </div>
                <p className="text-xs sm:text-sm text-white/70">Comprehensive Programs</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-green">100%</div>
                <p className="text-xs sm:text-sm text-white/70">Tax-Deductible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== IMPACT SECTION ==================== */}
      <section className="py-16 sm:py-24 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Real Impact. Real Lives. <span className="text-brand-green">Real Change.</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Since our founding, we've built a comprehensive recovery ecosystem that transforms lives every single day.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {[
              { number: 500, suffix: "+", label: "Individuals Served", desc: "People who've found hope through our programs", icon: Users, color: "from-purple-500 to-brand-purple" },
              { number: 7, suffix: "", label: "Recovery Residences", desc: "Safe housing facilities across Louisville", icon: Home, color: "from-blue-500 to-blue-600" },
              { number: 85, suffix: "%", label: "Program Completion", desc: "Of participants complete their program", icon: TrendingUp, color: "from-green-500 to-emerald-600" },
              { number: 6, suffix: "", label: "Comprehensive Programs", desc: "Covering every aspect of recovery", icon: Award, color: "from-amber-500 to-orange-500" },
              { number: 0, suffix: "", label: "$0 Cost Surrender Program", desc: "No insurance, no cost, zero barriers", icon: Heart, color: "from-red-500 to-pink-500" },
              { number: 24, suffix: "/7", label: "Support Available", desc: "Someone is always here when you need help", icon: Clock, color: "from-teal-500 to-cyan-500" },
            ].map((item, idx) => (
              <AnimateOnScroll key={idx} delay={idx * 0.1} variant="scaleUp">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                    {item.number > 0 ? (
                      <CountUpNumber end={item.number} suffix={item.suffix} />
                    ) : (
                      <>{item.label.split(' ')[0]}</>
                    )}
                  </div>
                  {item.number > 0 && <p className="text-brand-green font-semibold text-sm mb-1">{item.label}</p>}
                  {item.number === 0 && <p className="text-brand-green font-semibold text-sm mb-1">Free to All</p>}
                  <p className="text-white/50 text-xs sm:text-sm">{item.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/impact" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                <TrendingUp className="w-5 h-5" />
                View Full Impact Report
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/70 rounded-xl font-semibold hover:bg-white/10 hover:text-white transition-all">
                View Our Financials
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ==================== PROGRAMS SECTION ==================== */}
      <section className="py-16 sm:py-24 bg-brand-dark-lighter">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                6 Programs. <span className="text-brand-green">One Mission.</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                A comprehensive recovery ecosystem that addresses every aspect of rebuilding a life.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {PROGRAMS.map((program, idx) => (
              <AnimateOnScroll key={idx} delay={idx * 0.08} variant="fadeUp">
                <Link href={program.href} className="group block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-brand-green/30 transition-all duration-300 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-purple to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <program.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className={`${program.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {program.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-green transition-colors">{program.title}</h3>
                  <p className="text-white/60 text-sm mb-4 leading-relaxed">{program.description}</p>
                  <span className="text-brand-green font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll delay={0.3}>
            <div className="text-center mt-12">
              <Link href="/assessment" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300">
                Start Your Recovery Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ==================== TESTIMONIALS / SOCIAL PROOF ==================== */}
      <section className="py-16 sm:py-24 bg-brand-dark-lighter">
        <div className="max-w-5xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Stories of <span className="text-brand-green">Transformation</span>
              </h2>
              <p className="text-lg text-white/60">Real people. Real recovery. Real hope.</p>
            </div>
          </AnimateOnScroll>

          {/* Testimonial Carousel */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-10 min-h-[280px] flex flex-col justify-center">
              <div className="text-brand-green text-5xl sm:text-6xl font-serif leading-none mb-4">&ldquo;</div>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed mb-8 italic">
                {TESTIMONIALS[currentTestimonial].quote}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-purple to-brand-green flex items-center justify-center text-white font-bold text-lg">
                  {TESTIMONIALS[currentTestimonial].initials}
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{TESTIMONIALS[currentTestimonial].name}</p>
                  <p className="text-white/50">{TESTIMONIALS[currentTestimonial].role}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prevTestimonial}
                className="p-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition text-white"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentTestimonial ? 'w-8 bg-brand-green' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition text-white"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <AnimateOnScroll delay={0.2}>
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "501(c)(3) Verified", sub: "Tax-Exempt Nonprofit" },
                { label: "State Licensed", sub: "Commonwealth of Kentucky" },
                { label: "Evidence-Based", sub: "Clinical Best Practices" },
                { label: "Peer Accredited", sub: "Recovery Community" },
              ].map((badge, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-brand-green mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">{badge.label}</p>
                  <p className="text-white/40 text-xs">{badge.sub}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ==================== SOCIAL MEDIA FEED ==================== */}
      <section className="py-16 sm:py-24 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                See Recovery <span className="text-brand-green">in Action</span>
              </h2>
              <p className="text-lg text-white/60">Follow our journey and share our mission</p>
            </div>
          </AnimateOnScroll>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-12">
            {SOCIAL_IMAGES.map((img, idx) => (
              <AnimateOnScroll key={idx} delay={idx * 0.08} variant="scaleUp">
                <div className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-medium">{img.alt}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Social Channel Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {SOCIAL_CHANNELS.map((channel, idx) => (
              <AnimateOnScroll key={idx} delay={idx * 0.1} variant="fadeUp">
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block bg-gradient-to-br ${channel.color} ${channel.hoverColor} rounded-2xl p-5 text-white text-center hover:scale-105 transition-all duration-300 shadow-lg`}
                >
                  <p className="text-3xl font-bold mb-1">{channel.followers}</p>
                  <p className="text-white/80 text-sm font-medium mb-3">followers</p>
                  <p className="font-bold">{channel.name}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-white/70 mt-2">
                    Follow <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll>
            <p className="text-center text-white/40 text-sm">
              Share our mission — every follow helps us reach someone in need
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ==================== DONATION APPEAL ==================== */}
      <section className="py-16 sm:py-24 bg-brand-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(127,61,139,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(182,228,31,0.08),transparent_50%)]" />

        <div className="relative max-w-5xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Your Donation <span className="text-brand-green">Changes Everything</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Every dollar goes directly to providing housing, meals, treatment, and hope to people rebuilding their lives.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Impact Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { amount: "$25", impact: "Provides 10 nutritious meals for someone in recovery", icon: Utensils, color: "from-amber-500 to-orange-500" },
              { amount: "$100", impact: "Covers one week of safe housing and support services", icon: Home, color: "from-blue-500 to-blue-600" },
              { amount: "$500", impact: "Sponsors one full month of comprehensive treatment", icon: Heart, color: "from-brand-purple to-purple-600" },
            ].map((tier, idx) => (
              <AnimateOnScroll key={idx} delay={idx * 0.15} variant="fadeUp">
                <Link href={`/donate?amount=${tier.amount.replace('$', '')}`} className="group block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 hover:border-brand-green/30 transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <tier.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-3">{tier.amount}</p>
                  <p className="text-white/70 leading-relaxed">{tier.impact}</p>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll>
            <div className="text-center space-y-4">
              <Link
                href="/donate"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-green to-emerald-500 text-white rounded-2xl font-bold text-xl shadow-xl shadow-brand-green/20 hover:shadow-2xl hover:shadow-brand-green/30 hover:scale-105 transition-all duration-300"
              >
                <Heart className="w-6 h-6" />
                Donate Now
              </Link>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <p className="text-white/40 text-sm">
                  A Vision For You is a 501(c)(3). Your donation is 100% tax-deductible.
                </p>
              </div>

              <Link
                href="/donate?frequency=monthly"
                className="inline-flex items-center gap-2 text-brand-green hover:text-emerald-400 font-semibold transition-colors"
              >
                <Star className="w-4 h-4" />
                Give Monthly — Become a Recovery Champion
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ==================== WHY FUND US ==================== */}
      <section className="py-16 sm:py-24 bg-brand-dark-lighter">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Why <span className="text-brand-green">A Vision For You?</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                For grant funders, institutional donors, and partners who want to make the biggest impact.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Evidence-Based", desc: "Our IOP combines licensed therapy, psychiatry, and peer support with proven clinical outcomes.", icon: Brain },
              { title: "Zero-Barrier Entry", desc: "Surrender Program is 100% free — no insurance needed, no cost, no barriers to getting help.", icon: Shield },
              { title: "Holistic Model", desc: "We address housing, nutrition, career, mental health, and community — not just addiction.", icon: Heart },
              { title: "Community-Driven", desc: "Peer-led recovery with real accountability, real relationships, and lasting support networks.", icon: Users },
              { title: "Fully Transparent", desc: "501(c)(3) with full financial disclosure, measurable outcomes, and public accountability.", icon: CheckCircle },
              { title: "Local Impact", desc: "Serving Louisville's most vulnerable with 7 residences and 6 comprehensive programs.", icon: Home },
            ].map((item, idx) => (
              <AnimateOnScroll key={idx} delay={idx * 0.1} variant="fadeUp">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-brand-green mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll delay={0.3}>
            <div className="text-center mt-12">
              <Link
                href="/contact?department=donate&subject=Partnership%20Inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
              >
                <HandHeart className="w-5 h-5" />
                Partner With Us
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-16 sm:py-20 bg-brand-purple relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(182,228,31,0.15),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <AnimateOnScroll>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Recovery Starts With a Vision
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Whether you need help, want to give, or are ready to partner — we're here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate" className="px-8 py-4 bg-brand-green text-brand-purple rounded-xl font-bold text-lg hover:bg-green-400 hover:scale-105 transition-all duration-300 shadow-lg">
                Donate Today
              </Link>
              <Link href="/admission" className="px-8 py-4 bg-white text-brand-purple rounded-xl font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg">
                Apply for a Program
              </Link>
              <a href="tel:+15027496344" className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300">
                Call (502) 749-6344
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  )
}
