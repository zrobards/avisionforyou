'use client'

import Link from 'next/link'
import AnimateOnScroll from '@/components/shared/AnimateOnScroll'
import CountUpNumber from '@/components/shared/CountUpNumber'
import {
  Heart,
  Shield,
  Users,
  Star,
  Target,
  Handshake,
  Award,
  Sparkles,
  Globe,
  Leaf,
  Scale,
  Flame,
  ThumbsUp,
  BookOpen,
  Phone,
  Mail,
  Building2,
  Gavel,
  HeartHandshake,
  Landmark,
  ChevronRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CORE_VALUES = [
  { title: 'Compassion', description: 'We meet people where they are with unconditional love', icon: Heart },
  { title: 'Hope', description: 'Recovery is possible, and transformation happens every day', icon: Sparkles },
  { title: 'Dignity', description: 'Every person deserves respect and to be treated with value', icon: Award },
  { title: 'Community', description: 'We are stronger together and support one another', icon: Users },
  { title: 'Integrity', description: 'We act honestly and keep our commitments', icon: Shield },
  { title: 'Empowerment', description: 'We help people discover their own strength and potential', icon: Flame },
  { title: 'Accountability', description: 'We take responsibility for our actions and results', icon: Target },
  { title: 'Service', description: 'We serve others with genuine care and dedication', icon: Handshake },
  { title: 'Excellence', description: 'We pursue the highest standards in all we do', icon: Star },
  { title: 'Inclusivity', description: 'All are welcome regardless of background or circumstance', icon: Globe },
  { title: 'Recovery', description: 'We believe in the power of healing and second chances', icon: Leaf },
  { title: 'Persistence', description: 'We never give up on anyone or any goal', icon: ThumbsUp },
  { title: 'Gratitude', description: 'We appreciate the opportunity to serve', icon: BookOpen },
  { title: 'Justice', description: 'We advocate for fairness and support the marginalized', icon: Scale },
]

const LEADERSHIP = [
  {
    name: 'Lucas Bennett',
    title: 'President & Founder',
    initials: 'LB',
    bio: 'With a heart for the homeless and hurting, Lucas founded A Vision for You to provide the comprehensive support he saw was lacking. His vision transformed from an idea into a movement helping hundreds find hope and recovery.',
    gradient: 'from-[#7f3d8b] to-[#b6e41f]',
  },
  {
    name: 'Dr. Evan Massey',
    title: 'VP Medical Director',
    initials: 'EM',
    bio: 'As a medical doctor and addiction specialist, Dr. Massey brings clinical expertise to our treatment programs, ensuring evidence-based care and compassionate medical support for all clients.',
    gradient: 'from-[#b6e41f] to-blue-500',
  },
  {
    name: 'Charles Moore',
    title: 'Board Member',
    initials: 'CM',
    bio: 'Charles brings years of community leadership and a deep commitment to service. His strategic guidance and connections strengthen our ability to reach and serve those in need across Louisville.',
    gradient: 'from-blue-500 to-[#7f3d8b]',
  },
]

const OUTCOMES = [
  { value: 85, suffix: '%', label: 'Program Completion Rate', color: 'text-[#b6e41f]' },
  { value: 78, suffix: '%', label: 'Housing Placement Rate', color: 'text-blue-400' },
  { value: 72, suffix: '%', label: 'Employment Rate After Program', color: 'text-purple-400' },
  { value: 89, suffix: '%', label: 'Client Retention Rate', color: 'text-amber-400' },
]

const PIE_SLICES = [
  { percent: 80, label: 'Programs & Services', color: '#b6e41f', offset: 0 },
  { percent: 10, label: 'Housing & Facilities', color: '#3b82f6', offset: 80 },
  { percent: 5, label: 'Administration', color: '#8b5cf6', offset: 90 },
  { percent: 5, label: 'Fundraising', color: '#f59e0b', offset: 95 },
]

const PARTNER_CATEGORIES = [
  {
    title: 'Healthcare Partners',
    icon: HeartHandshake,
    description: 'Local hospitals, clinics, and behavioral health providers who collaborate on treatment plans and referrals.',
  },
  {
    title: 'Legal System',
    icon: Gavel,
    description: 'Courts, probation offices, and diversion programs that connect individuals to recovery-based alternatives.',
  },
  {
    title: 'Community Organizations',
    icon: Building2,
    description: 'Shelters, food banks, faith-based groups, and peer-support networks working together for holistic care.',
  },
  {
    title: 'Government Agencies',
    icon: Landmark,
    description: 'Federal, state, and local agencies providing funding, oversight, and program coordination for recovery services.',
  },
]

// ---------------------------------------------------------------------------
// SVG Donut Chart component
// ---------------------------------------------------------------------------

function DonutChart() {
  const size = 200
  const strokeWidth = 40
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Build dash arrays for each slice
  let cumulativeOffset = 0
  const slices = PIE_SLICES.map((slice) => {
    const dashLength = (slice.percent / 100) * circumference
    const gapLength = circumference - dashLength
    const rotation = (cumulativeOffset / 100) * 360 - 90 // -90 to start at top
    cumulativeOffset += slice.percent
    return { ...slice, dashLength, gapLength, rotation }
  })

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform"
        aria-label="Pie chart showing donation allocation"
      >
        {slices.map((slice, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${slice.dashLength} ${slice.gapLength}`}
            transform={`rotate(${slice.rotation} ${size / 2} ${size / 2})`}
            className="transition-all duration-700"
          />
        ))}
        {/* Center label */}
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-sm font-bold"
        >
          100%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white/60 text-[10px]"
        >
          of every dollar
        </text>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-md">
        {PIE_SLICES.map((slice, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className="inline-block w-4 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-white/80 text-sm">
              <span className="font-bold text-white">{slice.percent}%</span> {slice.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* ================================================================== */}
      {/* HERO */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#7f3d8b]/30 to-slate-950 py-20 sm:py-28">
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7f3d8b]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <AnimateOnScroll variant="fadeUp">
            <p className="uppercase tracking-widest text-[#b6e41f] text-sm font-semibold mb-4">
              501(c)(3) Nonprofit Organization
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              About <span className="text-[#b6e41f]">A Vision For You</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Empowering individuals to overcome addiction, rebuild their lives, and thrive in the Louisville community
              through comprehensive recovery programs, housing, and wraparound support services.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* OUR STORY */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">Our Story</h2>
          </AnimateOnScroll>

          <div className="space-y-8">
            <AnimateOnScroll variant="fadeUp" delay={0.1}>
              <div className="bg-slate-800/60 border border-slate-700/50 p-8 sm:p-10 rounded-2xl">
                <h3 className="text-2xl font-bold text-[#b6e41f] mb-4">Founded with Compassion</h3>
                <p className="text-lg text-white/70 leading-relaxed">
                  A Vision For You was founded on the belief that everyone deserves a second chance. Walking the streets
                  of Louisville, Kentucky, our founder Lucas Bennett witnessed the pain of homelessness and addiction
                  firsthand. He realized that what was missing wasn&apos;t the desire for recovery&mdash;it was the
                  support system to make it possible.
                </p>
                <p className="text-lg text-white/70 leading-relaxed mt-4">
                  From those beginnings, A Vision For You has grown into a comprehensive recovery and support network,
                  serving hundreds of people each year. We&apos;re not just a treatment center; we&apos;re a community
                  of recovery.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fadeUp" delay={0.2}>
              <div className="bg-slate-800/60 border border-slate-700/50 p-8 sm:p-10 rounded-2xl">
                <h3 className="text-2xl font-bold text-[#b6e41f] mb-4">Our Mission</h3>
                <blockquote className="text-xl sm:text-2xl font-semibold text-white text-center mb-6 italic border-l-4 border-[#b6e41f] pl-6">
                  &ldquo;To empower the homeless, addicted, maladjusted, and mentally ill to lead productive lives
                  through housing, education, self-help, treatment, or any other available resource.&rdquo;
                </blockquote>
                <p className="text-lg text-white/70 leading-relaxed">
                  This isn&apos;t just words on a page&mdash;it&apos;s what drives us every single day. We combine
                  evidence-based treatment, peer support, housing stability, education, and vocational training to
                  create pathways to lasting recovery.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* BOARD OF DIRECTORS / LEADERSHIP */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Board of Directors</h2>
            <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
              Our leadership team brings together diverse expertise in healthcare, community development, and nonprofit
              management to guide our mission forward.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LEADERSHIP.map((leader, idx) => (
              <AnimateOnScroll key={idx} variant="fadeUp" delay={idx * 0.15}>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors h-full">
                  {/* Initials circle */}
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${leader.gradient} rounded-full mx-auto mb-6 flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-xl">{leader.initials}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-1">{leader.name}</h3>
                  <p className="text-center text-[#b6e41f] font-semibold text-sm mb-4">{leader.title}</p>
                  <p className="text-white/60 text-center leading-relaxed text-sm">{leader.bio}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FINANCIAL TRANSPARENCY - PIE CHART */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-24 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
              How We Use Your Donations
            </h2>
            <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
              Financial stewardship is at the heart of our operations. Every dollar is allocated with purpose and
              accountability.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Chart */}
            <AnimateOnScroll variant="scaleUp" delay={0.1}>
              <div className="flex justify-center">
                <DonutChart />
              </div>
            </AnimateOnScroll>

            {/* Breakdown cards */}
            <AnimateOnScroll variant="fadeRight" delay={0.2}>
              <div className="space-y-4">
                {PIE_SLICES.map((slice, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-slate-800/50 border border-slate-700/40 rounded-xl p-4"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-lg"
                      style={{ backgroundColor: slice.color + '22', color: slice.color }}
                    >
                      {slice.percent}%
                    </div>
                    <div>
                      <p className="text-white font-semibold">{slice.label}</p>
                      <p className="text-white/50 text-sm">
                        {i === 0 && 'Direct client services including treatment, counseling, peer support, and vocational training.'}
                        {i === 1 && 'Recovery residences, maintenance, utilities, and safe living environments.'}
                        {i === 2 && 'Essential organizational operations, compliance, and staff support.'}
                        {i === 3 && 'Community outreach, donor relations, and awareness campaigns.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll variant="fade" delay={0.3}>
            <p className="text-center text-white/40 text-sm mt-12 italic">
              Based on nonprofit sector best practices. Detailed financials available upon request. Contact{' '}
              <a
                href="mailto:info@avisionforyourecovery.org"
                className="text-[#b6e41f]/70 hover:text-[#b6e41f] underline"
              >
                info@avisionforyourecovery.org
              </a>{' '}
              for our most recent Form 990 or audited financial statements.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* MEASURABLE OUTCOMES */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-24 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Measurable Outcomes</h2>
            <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
              We track real results to ensure our programs are making a lasting difference in the lives of those we
              serve.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {OUTCOMES.map((stat, idx) => (
              <AnimateOnScroll key={idx} variant="scaleUp" delay={idx * 0.1}>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center hover:border-slate-700 transition-colors">
                  <div className={`text-5xl sm:text-6xl font-extrabold mb-3 ${stat.color}`}>
                    <CountUpNumber end={stat.value} suffix={stat.suffix} duration={2.5} />
                  </div>
                  <p className="text-white/60 font-medium">{stat.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll variant="fade" delay={0.5}>
            <p className="text-center text-white/40 text-sm mt-10 italic">
              Based on internal program data. Independent audit forthcoming.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PARTNERS & SUPPORTERS */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Partners & Supporters</h2>
            <p className="text-center text-white/50 mb-16 max-w-3xl mx-auto">
              We partner with local healthcare providers, courts, community organizations, and government agencies to
              deliver comprehensive support and create pathways to recovery.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PARTNER_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <AnimateOnScroll key={idx} variant="fadeUp" delay={idx * 0.1}>
                  <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 hover:border-[#b6e41f]/30 transition-colors h-full">
                    <div className="w-12 h-12 bg-[#b6e41f]/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#b6e41f]" />
                    </div>
                    <h3 className="text-white font-bold mb-2">{cat.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{cat.description}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CORE VALUES */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Our Core Values</h2>
            <p className="text-center text-white/50 mb-14 max-w-3xl mx-auto text-lg">
              These 14 values guide everything we do and everyone we serve.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CORE_VALUES.map((value, idx) => {
              const Icon = value.icon
              return (
                <AnimateOnScroll key={idx} variant="fadeUp" delay={(idx % 4) * 0.08}>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-[#7f3d8b]/40 transition-colors h-full group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#7f3d8b]/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#7f3d8b]/30 transition-colors">
                        <Icon className="w-4 h-4 text-[#b6e41f]" />
                      </div>
                      <h3 className="text-white font-bold text-sm">{value.title}</h3>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed">{value.description}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* TRANSPARENCY & TRUST (condensed) */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <AnimateOnScroll variant="fadeUp">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10">
                Our Commitment to Transparency
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: '501(c)(3) Status',
                    text: 'Registered nonprofit. EIN available upon request. All revenues reinvested into our mission.',
                  },
                  {
                    title: 'Tax-Deductible Giving',
                    text: 'Your donations are fully tax-deductible. Receipts provided for every contribution.',
                  },
                  {
                    title: 'Financial Accountability',
                    text: 'Annual 990 forms publicly available. Rigorous accounting and donor accountability.',
                  },
                  {
                    title: 'Mission-Driven Operations',
                    text: 'Every dollar supports recovery. Our board and staff uphold the highest ethical standards.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#b6e41f]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#b6e41f]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                      <p className="text-white/50 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-700/50 text-center">
                <p className="text-white/50 text-sm mb-2">
                  <span className="font-semibold text-white/70">Questions about our nonprofit status or financials?</span>
                </p>
                <p className="text-white/40 text-sm">
                  <a
                    href="mailto:info@avisionforyourecovery.org"
                    className="text-[#b6e41f] hover:text-[#b6e41f]/80 underline"
                  >
                    info@avisionforyourecovery.org
                  </a>
                  {' '}&middot;{' '}
                  <a href="tel:+15027496344" className="text-[#b6e41f] hover:text-[#b6e41f]/80 underline">
                    (502) 749-6344
                  </a>
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA - PARTNER WITH US */}
      {/* ================================================================== */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-br from-[#7f3d8b] via-[#7f3d8b]/90 to-slate-950 overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#b6e41f]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <AnimateOnScroll variant="fadeUp">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">Partner With Us</h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether you represent a foundation, government agency, healthcare provider, or community group, we
              welcome partnerships that expand our capacity to serve those in recovery.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#b6e41f] text-slate-950 rounded-xl font-bold text-lg hover:bg-[#b6e41f]/90 transition-colors shadow-lg shadow-[#b6e41f]/20"
              >
                <Heart className="w-5 h-5" />
                Donate Now
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/60">
              <Phone className="w-4 h-4" />
              <a href="tel:+15027496344" className="hover:text-white transition-colors">
                (502) 749-6344
              </a>
              <span className="mx-2">&middot;</span>
              <span>Mon&ndash;Fri 8am&ndash;6pm &middot; Sat 9am&ndash;2pm</span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  )
}
