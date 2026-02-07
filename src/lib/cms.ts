import { db } from './db'

export type ProgramInfo = {
  title: string
  slug: string
  category: string
  description: string
  fullDescription: string
  details: string[]
  heroImages?: string[]
  logo?: string
}

const fallbackPrograms: Record<string, ProgramInfo> = {
  'surrender-program': {
    title: 'Surrender Program',
    slug: 'surrender-program',
    category: 'Long-Term Residential',
    description: 'A 6-9 month peer-driven recovery program',
    fullDescription:
      'Based on our original flagship model, the Surrender Program is a 6-9 month voluntary self-help social model recovery program. Participants are immersed in a community of peers who learn life skills and guide one another through the twelve steps.',
    details: [
      'Onsite IOP Services',
      'Residential living (no cost to client)',
      'Daily recovery oriented classes',
      'Weekly behavioral modification programming',
      'Weekly career education programming',
      'Peer and staff accountability',
      'Three daily meals provided',
      'Weekly random substance screening',
      'Onsite Primary Care offered through partner physicians',
      'Cell phones, vehicles, and employment prohibited in this phase for focus on recovery'
    ],
    heroImages: [
      '/programs/surrender-gathering-1.png',
      '/programs/surrender-gathering-2.png',
      '/programs/surrender-facility.png',
      '/programs/surrender-group.png'
    ]
  },
  'mindbodysoul-iop': {
    title: 'MindBodySoul IOP',
    slug: 'mindbodysoul-iop',
    category: 'Intensive Outpatient Program (IOP)',
    description: '90-day clinical outpatient treatment program',
    fullDescription:
      'A 90-day program with daily sessions, individual therapy, and peer support. Ideal for maintaining daily responsibilities while seeking recovery. Insurance accepting program (all KY Medicaid and some private).',
    details: [
      '90-day structured treatment program',
      'Daily group counseling and educational workshops',
      'Weekly one-on-one sessions with a licensed CADC',
      'Peer support groups',
      'Home-based and community integrated sessions',
      'Insurance accepting - KY Medicaid and some private insurers',
      'Maintain daily responsibilities while in treatment'
    ],
    logo: '/programs/mindbodysoul-logo.png'
  },
  'moving-mountains-ministry': {
    title: 'Moving Mountains Ministry',
    slug: 'moving-mountains-ministry',
    category: 'Addiction Recovery & Treatment',
    description: 'Spiritual recovery and discipleship ministry - The MOOOOVEEEE-ment',
    fullDescription:
      'Spiritual arm of AVFY bridging clinical addiction treatment and spiritual renewal. Focused on leading individuals to a relationship with Christ and equipping them to serve others.',
    details: [
      'Faith-based 12-step classes on campus',
      'Life Recovery Bible distribution',
      'Minister training program for men in recovery',
      'Prison ministry and reentry programs launching in 2026',
      'Weekly faith-based classes taught by leadership'
    ]
  },
  'dui-classes': {
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
}

export async function getPrograms(): Promise<ProgramInfo[]> {
  try {
    const programs = await db.program.findMany({
      orderBy: { createdAt: 'asc' }
    })

    if (!programs.length) {
      return Object.values(fallbackPrograms)
    }

    return programs.map((prog) => {
      const fallback = fallbackPrograms[prog.slug] || {}
      return {
        title: prog.name,
        slug: prog.slug,
        category: prog.programType || fallback.category || 'Program',
        description: prog.description || fallback.description || '',
        fullDescription: prog.longDescription || fallback.fullDescription || '',
        details: fallback.details || [],
        heroImages: fallback.heroImages,
        logo: fallback.logo,
      } satisfies ProgramInfo
    })
  } catch (err) {
    console.error('CMS:getPrograms fallback due to error', err)
    return Object.values(fallbackPrograms)
  }
}
