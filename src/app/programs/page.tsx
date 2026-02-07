import { getPrograms } from '@/lib/cms'
import { ProgramView } from '@/components/programs/ProgramView'
import LeadCaptureCTA from '@/components/shared/LeadCaptureCTA'
import { buildPageMetadata } from '@/lib/metadata'

export const revalidate = 60

export const metadata = buildPageMetadata(
  'Programs',
  'Explore recovery programs including MindBodySoul IOP, Surrender Program, housing support, and community services in Louisville, KY.'
)

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-purple to-brand-green text-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Programs</h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
            Multiple pathways to recovery, tailored to meet you where you are
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProgramView programs={programs} />

          {/* Program CTAs */}
          <div className="mt-12 flex gap-4 flex-wrap justify-center">
            <a
              href="/assessment"
              className="bg-brand-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-800 transition"
            >
              Start Application
            </a>
            <a
              href="tel:(502)749-6344"
              className="bg-white text-brand-purple border-2 border-brand-purple px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition"
            >
              Call for Info
            </a>
          </div>
        </div>
      </section>

      {/* Lead Capture CTA */}
      <LeadCaptureCTA variant="banner" />

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h2>
          <p className="text-purple-100 mb-6">Contact us today to learn more about how we can support your recovery journey.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/assessment"
              className="bg-brand-green text-brand-purple px-8 py-3 rounded-lg font-bold hover:bg-green-400 transition"
            >
              Begin Your Journey
            </a>
            <a
              href="/donate"
              className="bg-white text-brand-purple px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition"
            >
              Support Our Mission
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
