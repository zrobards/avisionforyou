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
  const hasDui = filtered.some((p) => p.slug === 'dui-classes')
  const programs = hasDui
    ? filtered
    : [
        ...filtered,
        {
          title: 'DUI Education & Supervision',
          slug: 'dui-classes',
          category: 'Court-Ordered Programs',
          description: 'Court-ordered DUI education, supervision, and support services',
          fullDescription:
            'Comprehensive DUI education program meeting court requirements with individualized supervision and support. We work with the legal system to provide evidence-based education and intervention.',
          details: [
            'Court-ordered DUI education classes',
            'IDRC (Impaired Driving Resource Center) certified education',
            'Individual and group supervision options',
            'Urine drug screening services',
            'Program documentation for court',
            'Flexible scheduling for work and family',
            'Legal referral networks and partnerships'
          ]
        }
      ]

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
              href="/login?callbackUrl=/assessment"
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
              href="/login?callbackUrl=/assessment"
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
