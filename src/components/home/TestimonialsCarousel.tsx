'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import AnimateOnScroll from '@/components/shared/AnimateOnScroll'
import { TESTIMONIALS } from '@/app/home/constants'

export default function TestimonialsCarousel() {
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
  )
}
