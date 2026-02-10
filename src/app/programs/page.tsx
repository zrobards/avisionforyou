import { getPrograms } from '@/lib/cms'
import { buildPageMetadata } from '@/lib/metadata'
import Link from 'next/link'
import {
  HandHeart, Brain, Home, Users, Utensils, Briefcase,
  ArrowRight, Heart, CheckCircle, Phone, Sparkles
} from 'lucide-react'

export const revalidate = 60

export const metadata = buildPageMetadata(
  'Programs',
  'Explore recovery programs including MindBodySoul IOP, Surrender Program, housing support, and community services in Louisville, KY.'
)

// Icon and badge config for each core program
const programMeta: Record<string, {
  icon: string
  badge: string
  badgeColor: string
  oneLiner: string
}> = {
  'surrender-program': {
    icon: 'HandHeart',
    badge: 'FREE',
    badgeColor: 'bg-[#b6e41f] text-slate-950',
    oneLiner: 'A 6-9 month peer-driven residential recovery program at no cost to the client.'
  },
  'mindbodysoul-iop': {
    icon: 'Brain',
    badge: 'Insurance Accepted',
    badgeColor: 'bg-[#7f3d8b] text-white',
    oneLiner: '90-day clinical outpatient treatment with daily group and individual therapy.'
  },
  'housing': {
    icon: 'Home',
    badge: '7 Residences',
    badgeColor: 'bg-[#b6e41f] text-slate-950',
    oneLiner: 'Safe, structured recovery housing with peer accountability and community support.'
  },
  'self-help': {
    icon: 'Users',
    badge: 'Open to All',
    badgeColor: 'bg-[#7f3d8b] text-white',
    oneLiner: 'Peer-driven recovery meetings, 12-step groups, and community connection.'
  },
  'food': {
    icon: 'Utensils',
    badge: 'Daily Meals',
    badgeColor: 'bg-[#b6e41f] text-slate-950',
    oneLiner: 'Nutritious daily meals supporting physical healing and stability in recovery.'
  },
  'career': {
    icon: 'Briefcase',
    badge: 'Job Placement',
    badgeColor: 'bg-[#7f3d8b] text-white',
    oneLiner: 'Resume coaching, interview prep, and employer connections for reentry success.'
  }
}

// Map icon names to components (server component can't use dynamic imports easily)
const iconComponents: Record<string, typeof HandHeart> = {
  HandHeart,
  Brain,
  Home,
  Users,
  Utensils,
  Briefcase
}

export default async function Programs() {
  const rawPrograms = await getPrograms()

  // Remove Women's Program and ensure DUI program is present
  const filtered = rawPrograms.filter(
    (p) => p.slug !== 'womens-program' && !/women/i.test(p.title)
  )
  // All 6 core programs that must always appear on the programs page
  const requiredPrograms = [
    {
      title: 'Surrender Program',
      slug: 'surrender-program',
      category: 'Long-Term Residential',
      description: 'A 6-9 month peer-driven recovery program',
      fullDescription:
        'Based on our original flagship model, the Surrender Program is a 6-9 month voluntary self-help social model recovery program. Participants are immersed in a community of peers who learn life skills and guide one another through the twelve steps.',
      details: [
        'Residential living (no cost to client)',
        'Daily recovery oriented classes',
        'Weekly behavioral modification programming',
        'Peer and staff accountability',
        'Three daily meals provided',
        'Onsite Primary Care offered through partner physicians'
      ]
    },
    {
      title: 'MindBodySoul IOP',
      slug: 'mindbodysoul-iop',
      category: 'Intensive Outpatient Program (IOP)',
      description: '90-day clinical outpatient treatment program',
      fullDescription:
        'A 90-day program with daily sessions, individual therapy, and peer support. Ideal for maintaining daily responsibilities while seeking recovery. Insurance accepting program.',
      details: [
        '90-day structured treatment program',
        'Daily group counseling and educational workshops',
        'Weekly one-on-one sessions with a licensed CADC',
        'Insurance accepting - KY Medicaid and some private insurers'
      ]
    },
    {
      title: 'Housing & Shelter',
      slug: 'housing',
      category: 'Housing & Support',
      description: 'Safe, supportive residential recovery spaces with community support',
      fullDescription:
        'We provide safe, structured housing with peer support, accountability, and access to recovery resources.',
      details: [
        'Structured recovery-focused housing',
        'Peer accountability and community support',
        'Access to treatment and case management',
        'Essential needs support and life-skills coaching'
      ]
    },
    {
      title: 'Meetings & Groups',
      slug: 'self-help',
      category: 'Peer Support',
      description: 'Peer-driven recovery meetings, support groups, and community building',
      fullDescription:
        'Regular meetings and groups that provide accountability, encouragement, and a sense of belonging.',
      details: [
        '12-step meetings and recovery groups',
        'Peer-led support and accountability',
        'Community connection and mentorship'
      ]
    },
    {
      title: 'Food & Nutrition',
      slug: 'food',
      category: 'Support Services',
      description: 'Nutritious meals and dietary support to aid recovery',
      fullDescription:
        'Consistent, balanced meals that support physical healing and stability during recovery.',
      details: [
        'Daily meal service',
        'Balanced nutrition support',
        'Healthy habit education'
      ]
    },
    {
      title: 'Career Reentry',
      slug: 'career',
      category: 'Aftercare',
      description: 'Employment support, coaching, and reentry resources',
      fullDescription:
        'Job readiness coaching and connections to community employment resources.',
      details: [
        'Resume and interview support',
        'Career education and coaching',
        'Community employer connections'
      ]
    }
  ]

  // Start with the 6 required programs, then append any extra DB programs
  const requiredSlugs = new Set(requiredPrograms.map((p) => p.slug))
  const extraFromDb = filtered.filter((p) => !requiredSlugs.has(p.slug))

  // Merge: use DB data for required programs when available, fall back to defaults
  const programs = requiredPrograms.map((req) => {
    const fromDb = filtered.find((p) => p.slug === req.slug)
    return fromDb ?? req
  }).concat(extraFromDb)

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Section */}
      <section className="relative bg-brand-dark overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#7f3d8b]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-[#b6e41f]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#b6e41f]/10 border border-[#b6e41f]/20 rounded-full text-[#b6e41f] text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              A Comprehensive Recovery Ecosystem
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Our Programs
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              From residential treatment and clinical outpatient care to housing, peer support, nutrition, and career reentry, our integrated programs meet you where you are and walk with you every step forward.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#b6e41f] text-slate-950 font-bold rounded-lg hover:bg-[#c9f24d] hover:shadow-lg hover:shadow-[#b6e41f]/20 transition"
              >
                Apply Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:+15027496344"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition"
              >
                <Phone className="w-5 h-5" />
                Call (502) 749-6344
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="bg-brand-dark-lighter py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Six Pillars of Recovery
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Each program is designed to address a critical dimension of the recovery journey. Together, they form a complete support system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => {
              const meta = programMeta[program.slug]
              const IconComponent = meta ? iconComponents[meta.icon] : Home
              const badge = meta?.badge
              const badgeColor = meta?.badgeColor || 'bg-[#7f3d8b] text-white'
              const oneLiner = meta?.oneLiner || program.description

              return (
                <div
                  key={program.slug}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
                >
                  {/* Header: Icon + Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-[#7f3d8b]/20 border border-[#7f3d8b]/30 rounded-xl flex items-center justify-center group-hover:bg-[#7f3d8b]/30 transition">
                      <IconComponent className="w-7 h-7 text-[#b6e41f]" />
                    </div>
                    {badge && (
                      <span className={`${badgeColor} text-xs font-bold px-3 py-1 rounded-full`}>
                        {badge}
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  <p className="text-xs font-semibold text-[#b6e41f]/80 uppercase tracking-wider mb-2">
                    {program.category}
                  </p>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {program.title}
                  </h3>

                  {/* One-liner */}
                  <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                    {oneLiner}
                  </p>

                  {/* Key features (show first 3 details) */}
                  {program.details && program.details.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {program.details.slice(0, 3).map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-[#b6e41f] flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action links */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Link
                      href={`/programs/${program.slug}`}
                      className="inline-flex items-center gap-1 text-[#b6e41f] hover:text-[#c9f24d] font-semibold text-sm transition group-hover:gap-2"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/donate?program=${encodeURIComponent(program.title)}`}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-[#c9a0d0] text-sm transition"
                    >
                      <Heart className="w-4 h-4" />
                      Support
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works / Journey */}
      <section className="bg-brand-dark py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Your Path Forward</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Recovery is not one-size-fits-all. Our team works with you to build a personalized plan that addresses your unique needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Reach Out', desc: 'Call us or complete a confidential assessment. Our team will listen and help you explore your options.' },
              { step: '02', title: 'Build Your Plan', desc: 'Work one-on-one with a counselor to identify the right combination of programs for your situation.' },
              { step: '03', title: 'Begin Recovery', desc: 'Enter a supportive community with the structure, mentorship, and resources you need to thrive.' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#b6e41f]/10 border border-[#b6e41f]/20 rounded-full mb-4">
                  <span className="text-[#b6e41f] text-xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative bg-brand-dark-lighter overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7f3d8b]/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Contact us today to learn more about how we can support your recovery journey. No judgment, no pressure -- just honest conversation about your future.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#b6e41f] text-slate-950 font-bold rounded-lg hover:bg-[#c9f24d] hover:shadow-lg hover:shadow-[#b6e41f]/20 transition"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition"
            >
              <Heart className="w-5 h-5" />
              Support Our Mission
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
