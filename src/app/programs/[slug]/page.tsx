import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/lib/metadata'

type ProgramDetail = {
  title: string
  subtitle: string
  description: string
  howItWorks: string[]
  whoItsFor: string[]
  getStarted: string[]
  extraLink?: {
    href: string
    label: string
  }
}

const PROGRAM_DETAILS: Record<string, ProgramDetail> = {
  iop: {
    title: 'MindBodySoul IOP',
    subtitle: 'Intensive Outpatient Treatment',
    description:
      'In our outpatient treatment program, clients receive services through the MindBodySoul Intensive Outpatient Program (IOP). This 90-day program combines evidence-based therapy, psychiatric support, and peer-driven recovery while allowing you to maintain work, school, and family responsibilities.',
    howItWorks: [
      'Comprehensive 90-day treatment plan with daily group counseling and educational workshops.',
      'Weekly one-on-one sessions with licensed counselors and access to psychiatric care as needed.',
      'Peer support groups and community-based recovery activities to strengthen accountability.',
      'Insurance-accepting program (including KY Medicaid and select private insurers).'
    ],
    whoItsFor: [
      'Individuals seeking structured clinical support without full-time residential care.',
      'People balancing recovery with work, school, or family commitments.',
      'Those needing therapy, psychiatric support, and relapse-prevention tools.'
    ],
    getStarted: [
      'Complete the confidential assessment to determine if MindBodySoul IOP is the right fit.',
      'Connect with our admissions team to verify coverage and schedule intake.',
      'Begin your personalized recovery plan with our clinical and peer-support teams.'
    ]
  },
  surrender: {
    title: 'Surrender Program',
    subtitle: 'Long-Term Residential Recovery',
    description:
      'Based on our original flagship model, the Surrender Program is a 6–9 month voluntary self-help social model recovery program. Participants are immersed in a peer-led community that builds life skills and guides one another through the twelve steps. This program is 100% free and does not accept insurance of any kind.',
    howItWorks: [
      'Residential living at no cost to the client with food, shelter, and literature provided through donations.',
      'Daily recovery-oriented classes, weekly behavioral modification programming, and weekly career education.',
      'Onsite IOP services, peer and staff accountability, and daily 12-step meeting attendance.',
      'Weekly random substance screening and onsite primary care through partner physicians.',
      'Cell phones, vehicles, and employment are prohibited in this phase so clients can focus fully on recovery.'
    ],
    whoItsFor: [
      'Individuals needing a structured, immersive recovery environment.',
      'People experiencing homelessness or housing instability who need safe shelter.',
      'Those ready to engage in a peer-driven, twelve-step recovery community.'
    ],
    getStarted: [
      'Complete the confidential assessment so we can understand your needs.',
      'Speak with admissions to review eligibility and availability.',
      'Begin your recovery in a supportive, residential community.'
    ]
  },
  housing: {
    title: 'Housing & Shelter',
    subtitle: 'Safe, Supportive Recovery Living',
    description:
      'A Vision For You provides safe, supportive residential recovery spaces that help individuals stabilize while pursuing treatment. Our housing program prioritizes safety, accountability, and a community of peers committed to recovery.',
    howItWorks: [
      'Recovery-focused housing with structured routines and peer accountability.',
      'Connection to treatment services, case management, and community resources.',
      'Access to essentials like meals, clean clothing, and recovery supplies.'
    ],
    whoItsFor: [
      'Individuals facing homelessness or unstable housing while seeking recovery.',
      'Clients who need a structured environment to maintain sobriety.',
      'People transitioning from inpatient or residential programs into long-term stability.'
    ],
    getStarted: [
      'Complete the confidential assessment to determine housing and program fit.',
      'Connect with admissions to review availability and requirements.',
      'Move into a safe recovery environment with ongoing support.'
    ]
  },
  'self-help': {
    title: 'Meetings & Groups',
    subtitle: 'Peer-Driven Recovery & Community',
    description:
      'Explore our meetings and groups through two distinct paths: 12 Step Meetings and the Surrender Program. These peer-driven gatherings provide accountability, encouragement, and a sense of belonging for individuals in recovery.',
    howItWorks: [
      'Regular 12-step meetings focused on shared experience, strength, and hope.',
      'Peer-led recovery groups that emphasize accountability and mutual support.',
      'Opportunities to connect with our residential community through the Surrender Program.'
    ],
    whoItsFor: [
      'Anyone seeking ongoing recovery support and community connection.',
      'Individuals looking for a twelve-step focused path to sobriety.',
      'People who want peer mentorship and consistent encouragement.'
    ],
    getStarted: [
      'Visit our meetings page to find schedules and locations.',
      'Complete the assessment if you want help selecting the right program.',
      'Join a meeting and meet peers who understand your journey.'
    ],
    extraLink: {
      href: '/meetings',
      label: 'View Meeting Schedule'
    }
  },
  food: {
    title: 'Food & Nutrition',
    subtitle: 'Nourishing Support for Recovery',
    description:
      'Nutritious meals and dietary support are essential to healing. Our Food & Nutrition program provides consistent, balanced meals that help clients rebuild physical health alongside their recovery journey.',
    howItWorks: [
      'Daily meal service with an emphasis on balanced, nourishing options.',
      'Food access integrated into residential and outpatient programs.',
      'Education and support to build sustainable healthy habits.'
    ],
    whoItsFor: [
      'Clients who need reliable access to meals while in recovery.',
      'Individuals rebuilding physical health after substance use.',
      'Residents in our housing and shelter programs.'
    ],
    getStarted: [
      'Complete the assessment to connect with the right recovery services.',
      'Speak with admissions about food support during treatment.',
      'Receive daily nutrition support as part of your recovery plan.'
    ]
  },
  career: {
    title: 'Career Reentry',
    subtitle: 'Employment Support & Aftercare',
    description:
      'Career reentry is a critical step in long-term recovery. We offer job readiness support, career education, and connections to employment opportunities so clients can rebuild stability and independence.',
    howItWorks: [
      'Weekly career education programming and job readiness coaching.',
      'Resume support, interview preparation, and workplace skills development.',
      'Connections to community partners and employment resources.'
    ],
    whoItsFor: [
      'Clients preparing to reenter the workforce after treatment.',
      'Individuals who need coaching to build confidence and job skills.',
      'People seeking long-term stability through employment.'
    ],
    getStarted: [
      'Complete the assessment to identify your goals and program fit.',
      'Work with our team to build a personalized reentry plan.',
      'Access career coaching and community employment resources.'
    ]
  }
}

type ProgramSlug = keyof typeof PROGRAM_DETAILS

export function generateStaticParams() {
  return Object.keys(PROGRAM_DETAILS).map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const program = PROGRAM_DETAILS[params.slug as ProgramSlug]

  if (!program) {
    return buildPageMetadata('Program Details', 'Learn more about our recovery programs and services.')
  }

  return buildPageMetadata(
    `${program.title} | A Vision For You`,
    program.description
  )
}

export default function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const program = PROGRAM_DETAILS[params.slug as ProgramSlug]

  if (!program) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-brand-green font-semibold mb-3">{program.subtitle}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{program.title}</h1>
          <p className="text-lg md:text-xl text-purple-100">{program.description}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 grid gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <ul className="space-y-3 text-gray-700">
              {program.howItWorks.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-brand-green font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Who It’s For</h2>
              <ul className="space-y-3 text-gray-700">
                {program.whoItsFor.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-brand-purple font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Get Started</h2>
              <ol className="space-y-3 text-gray-700 list-decimal list-inside">
                {program.getStarted.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            </div>
          </div>

          {program.extraLink && (
            <div className="text-center">
              <Link href={program.extraLink.href} className="text-brand-purple font-semibold hover:text-purple-700">
                {program.extraLink.label} →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-brand-purple to-brand-green text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take the Next Step?</h2>
          <p className="text-lg text-purple-100 mb-6">
            Start with a confidential assessment so we can guide you to the right program.
          </p>
          <Link
            href="/login?callbackUrl=/assessment"
            className="inline-block bg-white text-brand-purple px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Start Assessment
          </Link>
        </div>
      </section>
    </div>
  )
}
