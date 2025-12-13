'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PhilosophyPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-[#0a1128] py-20 overflow-hidden">
        {/* Subtle tech grid background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(to right, #22d3ee 1px, transparent 1px),
                linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              How We Build
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Three principles that guide every project we ship. Simple UX. Clean systems. No BS.
            </p>

            {/* System banner */}
            <div className="inline-block mt-8 px-6 py-3 bg-black/30 border border-cyan-500/20 rounded-lg backdrop-blur-sm">
              <p className="font-mono text-sm text-cyan-400/80">
                STATUS: building prototypes • accessibility-first • modern stack (Next.js / React / TypeScript)
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principle 1: Accessible by Design */}
      <section className="bg-[#0a1128] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-[60%_40%] gap-12 items-center"
          >
            {/* Left column: content */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)' }}>
                  <span className="text-3xl">🧠</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Accessible by Design
                </h2>
              </div>
              
              <div className="text-lg md:text-xl text-gray-300 leading-relaxed space-y-4">
                <p>
                  We design for cognitive clarity, not complexity. Large type, strong hierarchy, 
                  predictable navigation, and minimal distractions.
                </p>
                <p>
                  Accessibility isn't a checkbox we add later. <span className="text-white font-semibold">It's the foundation.</span>
                </p>
              </div>
            </div>

            {/* Right column: UI clarity visual */}
            <div className="space-y-4">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-mono text-gray-400">Cluttered</span>
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">❌ Avoid</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-600 rounded w-full"></div>
                  <div className="h-2 bg-gray-600 rounded w-[95%]"></div>
                  <div className="h-2 bg-gray-600 rounded w-[90%]"></div>
                  <div className="h-1 bg-gray-700 rounded w-[85%]"></div>
                  <div className="h-1 bg-gray-700 rounded w-[80%]"></div>
                  <div className="h-1 bg-gray-700 rounded w-[75%]"></div>
                </div>
              </div>

              <div className="bg-gray-900/50 border-2 border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-mono text-gray-300">Clear</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">✓ Better</span>
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-gray-400 rounded w-full"></div>
                  <div className="h-3 bg-gray-400 rounded w-[90%]"></div>
                  <div className="h-3 bg-gray-400 rounded w-[85%]"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principle 2: Show the Work */}
      <section className="bg-[#1a2332] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-[60%_40%] gap-12 items-center"
          >
            {/* Left column: content */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)' }}>
                  <span className="text-3xl">⚡</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Show the Work
                </h2>
              </div>
              
              <div className="text-lg md:text-xl text-gray-300 leading-relaxed space-y-4">
                <p>
                  We don't sell buzzwords. We show drafts early: clickable flows, working pages, and real prototypes.
                </p>
                <p>
                  You'll always know what's being built, what's next, and what <span className="text-white font-semibold">done looks like.</span>
                </p>
              </div>
            </div>

            {/* Right column: build log terminal */}
            <div className="relative">
              <div className="bg-black/80 border border-cyan-500/30 rounded-lg overflow-hidden backdrop-blur-sm shadow-xl">
                {/* Terminal header */}
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">build.log</span>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                </div>

                {/* Terminal content */}
                <div className="p-4 font-mono text-sm space-y-2 relative">
                  {/* Subtle scanline effect */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #22d3ee 2px, #22d3ee 4px)'
                    }}
                  />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">scaffold pages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">auth wired</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">forms validated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">db migrations run</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">tests passing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">→</span>
                    <span className="text-cyan-300">deploy preview</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs font-semibold">
                      PREVIEW READY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principle 3: Built to Last */}
      <section className="bg-[#0a1128] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-[60%_40%] gap-12 items-center"
          >
            {/* Left column: content */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)' }}>
                  <span className="text-3xl">🛠️</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Built to Last
                </h2>
              </div>
              
              <div className="text-lg md:text-xl text-gray-300 leading-relaxed space-y-4">
                <p>
                  We build systems that are maintainable. Clean structure, real documentation, 
                  and support that doesn't vanish after launch.
                </p>
                <p>
                  When requirements change, we <span className="text-white font-semibold">adapt the system</span> instead of patching it into a mess.
                </p>
              </div>
            </div>

            {/* Right column: lifecycle timeline */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Plan */}
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-24 h-10 bg-cyan-500/20 border border-cyan-500/40 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-cyan-300">Plan</span>
                    </div>
                    <span className="text-sm text-gray-400">clear scope</span>
                  </div>
                  <div className="absolute left-12 top-10 w-0.5 h-6 bg-cyan-500/30"></div>
                </div>

                {/* Build */}
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-24 h-10 bg-cyan-500/20 border border-cyan-500/40 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-cyan-300">Build</span>
                    </div>
                    <span className="text-sm text-gray-400">working prototype</span>
                  </div>
                  <div className="absolute left-12 top-10 w-0.5 h-6 bg-cyan-500/30"></div>
                </div>

                {/* Launch */}
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-24 h-10 bg-cyan-500/20 border border-cyan-500/40 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-cyan-300">Launch</span>
                    </div>
                    <span className="text-sm text-gray-400">stable release</span>
                  </div>
                  <div className="absolute left-12 top-10 w-0.5 h-6 bg-cyan-500/30"></div>
                </div>

                {/* Support */}
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-24 h-10 bg-cyan-500/20 border border-cyan-500/40 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-cyan-300">Support</span>
                    </div>
                    <span className="text-sm text-gray-400">maintenance & updates</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What This Looks Like */}
      <section className="bg-[#1a2332] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What This Looks Like in Real Life
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-white mb-3">Fast drafts</h3>
                <p className="text-gray-300 leading-relaxed">
                  We show working pages early so you can react fast.
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-white mb-3">Plain English</h3>
                <p className="text-gray-300 leading-relaxed">
                  No tech jargon. We explain decisions clearly.
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="text-4xl mb-4">🧘</div>
                <h3 className="text-xl font-bold text-white mb-3">Calm UI</h3>
                <p className="text-gray-300 leading-relaxed">
                  Less cognitive load. More clarity.
                </p>
              </motion.div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-400 max-w-2xl mx-auto">
                We're early-stage, but we build like professionals and we ship real prototypes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-500 py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to build something real?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Tell us what you need. We'll show you a draft fast.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/start"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-500 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              >
                Start a Project
              </Link>
              <Link
                href="/case-studies/big-red-bus"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:bg-white/10"
              >
                See Our Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
