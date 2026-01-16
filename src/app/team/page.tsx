import Image from 'next/image'
import { Mail, Linkedin, Heart, Award, Users, Shield } from 'lucide-react'
import { db } from '@/lib/db'
import { TeamRole } from '@prisma/client'

export const revalidate = 300 // Revalidate every 5 minutes

async function getTeamMembers() {
  try {
    const teamMembers = await db.teamMember.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    })
    return teamMembers
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}

// Map database TeamRole to display categories
function getRoleCategory(role: TeamRole): 'board' | 'staff' {
  const boardRoles: TeamRole[] = [
    'BOARD_PRESIDENT',
    'BOARD_VP',
    'BOARD_TREASURER',
    'BOARD_SECRETARY',
    'BOARD_MEMBER'
  ]
  return boardRoles.includes(role) ? 'board' : 'staff'
}

export default async function Team() {
  const teamMembers = await getTeamMembers()
  
  const executiveLeadership = teamMembers.filter(member => getRoleCategory(member.role) === 'board')
  const staffMembers = teamMembers.filter(member => getRoleCategory(member.role) === 'staff')

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

      {/* Executive Leadership */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-purple rounded-full mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Executive Leadership</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our leadership team provides strategic direction, governance oversight, and ensures we fulfill our mission to serve those in recovery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {executiveLeadership.map((member) => (
              <div key={member.id} className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-t-4 border-brand-purple">
                <div className="flex items-center gap-4 mb-4">
                  {member.imageUrl ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-brand-purple">
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-3xl">{member.name[0]}</span>
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
                {member.linkedin && (
                  <div className="flex items-center gap-2 text-sm text-brand-purple hover:text-purple-700 mt-2">
                    <Linkedin className="w-4 h-4" />
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Team */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-green rounded-full mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Staff</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to providing exceptional care and support for individuals in recovery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {staffMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-brand-green">
                <div className="flex items-center gap-4 mb-4">
                  {member.imageUrl ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-brand-green">
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-3xl">{member.name[0]}</span>
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
                {member.linkedin && (
                  <div className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 mt-2">
                    <Linkedin className="w-4 h-4" />
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
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
