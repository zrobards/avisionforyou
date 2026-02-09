import Image from 'next/image'
import { Mail, Heart, Award, Users, Shield } from 'lucide-react'
import { db } from '@/lib/db'

export const revalidate = 60

interface DisplayMember {
  name: string
  title: string
  bio: string
  credentials?: string | null
  email?: string | null
  linkedin?: string | null
  imageUrl?: string | null
}

const BOARD_ROLES = ['BOARD_PRESIDENT', 'BOARD_VP', 'BOARD_TREASURER', 'BOARD_SECRETARY', 'BOARD_MEMBER']

const fallbackLeadership: DisplayMember[] = [
  {
    name: 'Lucas Bennett',
    title: 'President & Executive Director',
    bio: 'Lucas founded A Vision For You and leads the organization with passion and dedication to serving individuals and families.',
    email: 'lucas@avisionforyourecovery.org',
    imageUrl: '/team/lucas-bennett.png'
  },
  {
    name: 'Dr. Evan Massey',
    title: 'Vice President',
    bio: 'Dr. Massey provides strategic leadership and oversight, ensuring the organization maintains its mission and vision while expanding services to meet community needs.',
    email: 'evan.massey@avisionforyourecovery.org',
    imageUrl: '/team/evan-massey.png'
  },
  {
    name: 'Charles Moore',
    title: 'Treasurer',
    bio: 'Charles oversees the financial operations and ensures fiscal responsibility and transparency across all programs and services.',
    email: 'charles.moore@avisionforyourecovery.org',
    imageUrl: '/team/charles-moore.png'
  }
]

const fallbackStaff: DisplayMember[] = [
  {
    name: 'Zach Wilbert',
    title: 'Medical Director',
    credentials: 'APRN-FNP',
    bio: 'As Medical Director, Zach provides comprehensive medical oversight and ensures quality healthcare services are integrated into all recovery programming.',
    email: 'zach.wilbert@avisionforyourecovery.org',
    imageUrl: '/team/zach-wilbert.png'
  },
  {
    name: 'Henry Fuqua',
    title: 'MindBodySoul IOP Program Director',
    credentials: 'CADC',
    bio: 'Henry leads the MindBodySoul IOP program with expertise in addiction counseling and evidence-based treatment approaches.',
    email: 'henry.fuqua@avisionforyourecovery.org',
    imageUrl: '/team/henry-fuqua.png'
  },
  {
    name: 'Gregory Haynes',
    title: 'Director of Client Engagement',
    credentials: 'CADCA-1 PSS',
    bio: 'Gregory builds meaningful connections with clients and ensures each individual receives personalized support throughout their recovery journey.',
    email: 'gregory.haynes@avisionforyourecovery.org',
    imageUrl: '/team/gregory-haynes.png'
  },
  {
    name: 'Josh Altizer',
    title: 'Surrender Program Director',
    bio: 'Josh is an alumni who was originally criminal justice involved when he went through the program. He initially struggled to grasp recovery and even returned to the Surrender Program for a refocus. After Josh achieved recovery success, he knew he had to dedicate his life to walking alongside clients as they overcome the challenges of recovery.',
    email: 'josh.altizer@avisionforyourecovery.org',
    imageUrl: '/team/josh-altizer.png'
  }
]

async function getTeamMembers(): Promise<{ leadership: DisplayMember[]; staff: DisplayMember[] }> {
  try {
    const members = await db.teamMember.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    if (members.length === 0) {
      return { leadership: fallbackLeadership, staff: fallbackStaff }
    }

    const leadership = members.filter(m => BOARD_ROLES.includes(m.role))
    const staff = members.filter(m => !BOARD_ROLES.includes(m.role))

    return {
      leadership: leadership.length > 0 ? leadership : fallbackLeadership,
      staff: staff.length > 0 ? staff : fallbackStaff,
    }
  } catch {
    return { leadership: fallbackLeadership, staff: fallbackStaff }
  }
}

function MemberCard({ member, variant }: { member: DisplayMember; variant: 'leadership' | 'staff' }) {
  const isLeadership = variant === 'leadership'

  return (
    <div className={`${isLeadership ? 'bg-gradient-to-br from-purple-50 to-white border-t-4 border-brand-purple' : 'bg-white border-l-4 border-brand-green'} rounded-xl shadow-lg px-4 sm:px-6 py-6 hover:shadow-xl transition`}>
      <div className="flex items-center gap-4 mb-4">
        {member.imageUrl ? (
          <div className={`w-24 h-24 rounded-full overflow-hidden flex-shrink-0 ring-2 ${isLeadership ? 'ring-brand-purple' : 'ring-brand-green'}`}>
            <Image
              src={member.imageUrl}
              alt={member.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-24 h-24 bg-gradient-to-br ${isLeadership ? 'from-brand-purple to-purple-600' : 'from-brand-green to-green-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-3xl">{member.name[0]}</span>
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
          {member.credentials && (
            <p className={`text-sm font-semibold ${isLeadership ? 'text-brand-purple' : 'text-brand-green'}`}>{member.credentials}</p>
          )}
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">{member.title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
      </div>
      {member.email && (
        <div className={`flex items-center gap-2 text-sm ${isLeadership ? 'text-brand-purple hover:text-purple-700' : 'text-brand-green hover:text-green-700'}`}>
          <Mail className="w-4 h-4" />
          <a href={`mailto:${member.email}`}>{member.email}</a>
        </div>
      )}
    </div>
  )
}

export default async function Team() {
  const { leadership, staff } = await getTeamMembers()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-full mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Leadership</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Experienced professionals dedicated to transparency, accountability, and measurable outcomes in recovery services
            </p>
          </div>
        </div>
      </header>

      {/* Executive Leadership */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-purple rounded-full mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Executive Leadership</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our leadership team provides strategic direction, governance oversight, and ensures we fulfill our mission to serve those in recovery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {leadership.map((member, idx) => (
              <MemberCard key={idx} member={member} variant="leadership" />
            ))}
          </div>
        </div>
      </section>

      {/* Staff Team */}
      <section className="py-10 sm:py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-green rounded-full mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Staff</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to providing exceptional care and support for individuals in recovery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {staff.map((member, idx) => (
              <MemberCard key={idx} member={member} variant="staff" />
            ))}
          </div>
        </div>
      </section>

      {/* Governance Statement */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-brand-purple to-purple-900 text-white rounded-2xl shadow-2xl p-4 sm:p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="w-8 h-8 text-brand-green flex-shrink-0" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Commitment to Governance</h2>
                <div className="space-y-4 text-purple-100 leading-relaxed">
                  <p>
                    A Vision For You operates with full transparency and accountability as a 501(c)(3) nonprofit organization. Our Board of Directors meets quarterly to review program outcomes, financial performance, and strategic direction.
                  </p>
                  <p>
                    <strong className="text-white">Financial Oversight:</strong> Our Finance Committee reviews all financial statements monthly. We maintain independent audits and make our Form 990 publicly available.
                  </p>
                  <p>
                    <strong className="text-white">Ethical Standards:</strong> All board members and staff adhere to our code of ethics and conflict of interest policy. We maintain strict confidentiality protocols and trauma-informed practices.
                  </p>
                  <p>
                    <strong className="text-white">Community Accountability:</strong> We welcome feedback from clients, donors, and community partners. Our annual reports detail both successes and areas for improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-10 sm:py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We&apos;re always looking for passionate professionals to join our team. Whether you&apos;re a clinician, administrator, or support staff, your skills can make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-purple to-purple-700 text-white font-bold rounded-lg hover:shadow-xl transition"
            >
              Career Opportunities
            </a>
            <a
              href="/donate"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-green to-green-600 text-white font-bold rounded-lg hover:shadow-xl transition"
            >
              Support Our Work
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
