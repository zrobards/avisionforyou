'use client'

import Image from 'next/image'
import { Mail, Linkedin, Heart, Award, Users, Shield } from 'lucide-react'

interface TeamMember {
  name: string
  title: string
  role: 'board' | 'leadership' | 'clinical'
  bio: string
  credentials?: string
  email?: string
  linkedin?: string
  image?: string
}

export default function Team() {
  const boardMembers: TeamMember[] = [
    {
      name: 'Lucas Bennett',
      title: 'President & Founder',
      role: 'board',
      credentials: 'MBA, CADC',
      bio: 'Lucas founded A Vision For You Recovery in 2018 after his own journey through recovery. With over 15 years of nonprofit leadership experience and board certification in addiction counseling, he brings both personal understanding and professional expertise to the organization.',
      email: 'lucas@avisionforyourecovery.org',
      image: '/team/lucas-bennett.jpg'
    },
    {
      name: 'Dr. Evan Massey',
      title: 'Vice President & Medical Director',
      role: 'board',
      credentials: 'MD, Addiction Medicine',
      bio: 'Board-certified addiction medicine physician with 12 years of experience in integrated care. Dr. Massey oversees clinical protocols and ensures medical best practices across all programs.',
      email: 'evan.massey@avisionforyourecovery.org',
      image: '/team/evan-massey.jpg'
    },
    {
      name: 'Sarah Thompson',
      title: 'Board Treasurer',
      role: 'board',
      credentials: 'CPA, MBA',
      bio: 'Certified Public Accountant with 20+ years in nonprofit financial management. Sarah ensures fiscal responsibility and transparent financial reporting as required for our 501(c)(3) status.',
      email: 'sarah.t@avisionforyourecovery.org',
      image: '/team/sarah-thompson.jpg'
    },
    {
      name: 'Rev. Michael Carter',
      title: 'Board Secretary',
      role: 'board',
      credentials: 'M.Div, LCSW',
      bio: 'Licensed clinical social worker and ordained minister with 18 years serving communities affected by addiction. Michael leads our faith-based programming and spiritual care initiatives.',
      email: 'michael.c@avisionforyourecovery.org',
      image: '/team/michael-carter.jpg'
    },
    {
      name: 'Dr. Jennifer Martinez',
      title: 'Board Member',
      role: 'board',
      credentials: 'PhD, Clinical Psychology',
      bio: 'Clinical psychologist specializing in dual diagnosis treatment. Dr. Martinez brings expertise in mental health integration and trauma-informed care to program development.',
      email: 'jennifer.m@avisionforyourecovery.org',
      image: '/team/jennifer-martinez.jpg'
    },
    {
      name: 'David Chen',
      title: 'Board Member',
      role: 'board',
      credentials: 'JD, Community Advocate',
      bio: 'Attorney with focus on nonprofit law and community development. David ensures organizational compliance and advocates for policy changes supporting recovery resources.',
      email: 'david.c@avisionforyourecovery.org',
      image: '/team/david-chen.jpg'
    }
  ]

  const leadershipTeam: TeamMember[] = [
    {
      name: 'Amanda Williams',
      title: 'Director of Programs',
      role: 'leadership',
      credentials: 'MSW, LCSW',
      bio: 'Oversees all recovery programs with 10+ years of direct service experience. Amanda ensures quality standards and continuous program improvement based on outcome data.',
      email: 'amanda.w@avisionforyourecovery.org',
      image: '/team/amanda-williams.jpg'
    },
    {
      name: 'Marcus Johnson',
      title: 'Director of Development',
      role: 'leadership',
      credentials: 'CFRE',
      bio: 'Certified Fund Raising Executive managing donor relations, grant applications, and fundraising strategy. Marcus has secured over $2M in funding for recovery programs.',
      email: 'marcus.j@avisionforyourecovery.org',
      image: '/team/marcus-johnson.jpg'
    },
    {
      name: 'Dr. Lisa Patel',
      title: 'Clinical Director',
      role: 'clinical',
      credentials: 'PhD, LCADC',
      bio: 'Licensed clinical alcohol and drug counselor leading our clinical team. Dr. Patel develops evidence-based treatment protocols and supervises all clinical staff.',
      email: 'lisa.p@avisionforyourecovery.org',
      image: '/team/lisa-patel.jpg'
    },
    {
      name: 'James Robinson',
      title: 'Director of Operations',
      role: 'leadership',
      credentials: 'MBA',
      bio: 'Manages day-to-day operations, facility management, and staff coordination across all program sites. James ensures smooth operations and maintains our high standards of care.',
      email: 'james.r@avisionforyourecovery.org',
      image: '/team/james-robinson.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-full mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Our Leadership</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Experienced professionals dedicated to transparency, accountability, and measurable outcomes in recovery services
            </p>
          </div>
        </div>
      </header>

      {/* Board of Directors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-purple rounded-full mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Board of Directors</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our volunteer board provides governance oversight, strategic direction, and ensures fiscal responsibility as required for 501(c)(3) organizations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boardMembers.map((member, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-t-4 border-brand-purple">
                <div className="flex items-center gap-4 mb-4">
                  {member.image ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-brand-purple">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-2xl">{member.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    {member.credentials && (
                      <p className="text-sm text-brand-purple font-semibold">{member.credentials}</p>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{member.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </div>
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-brand-purple hover:text-purple-700">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${member.email}`}>{member.email}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-green rounded-full mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Executive Leadership</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our professional staff brings decades of combined experience in addiction treatment, nonprofit management, and community service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {leadershipTeam.map((member, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-brand-green">
                <div className="flex items-center gap-4 mb-4">
                  {member.image ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-brand-green">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-2xl">{member.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    {member.credentials && (
                      <p className="text-sm text-brand-green font-semibold">{member.credentials}</p>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{member.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </div>
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${member.email}`}>{member.email}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-r from-brand-purple to-purple-900 text-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="w-8 h-8 text-brand-green flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Commitment to Governance</h2>
                <div className="space-y-4 text-purple-100 leading-relaxed">
                  <p>
                    A Vision For You Recovery operates with full transparency and accountability as a 501(c)(3) nonprofit organization. Our Board of Directors meets quarterly to review program outcomes, financial performance, and strategic direction.
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
      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We're always looking for passionate professionals to join our team. Whether you're a clinician, administrator, or support staff, your skills can make a difference.
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
