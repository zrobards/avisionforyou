import Link from 'next/link'

const PROGRAMS = [
  { title: "MindBodySoul IOP", description: "Intensive Outpatient Treatment combining therapy, psychiatry, and evidence-based practices", type: "IOP", href: "/programs/iop" },
  { title: "Surrender Program", description: "Voluntary, self-help, social model recovery program grounded in 12-step principles", type: "SHELTER", href: "/programs/surrender" },
  { title: "Housing & Shelter", description: "Safe, supportive residential recovery spaces with community support", type: "HOUSING", href: "/programs/housing" },
  { title: "Meetings & Groups", description: "Peer-driven recovery meetings, support groups, and community building activities", type: "SELF_HELP", href: "/programs/self-help" },
  { title: "Food & Nutrition", description: "Nutritious meals and dietary support as part of holistic recovery", type: "FOOD", href: "/programs/food" },
  { title: "Career Reentry", description: "Job training, placement assistance, and employment support services", type: "CAREER", href: "/programs/career" }
]

export default function ProgramsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Our Programs</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">As a 501(c)(3) Charity, we offer multiple programs to support your recovery journey.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROGRAMS.map((program, idx) => (
            <div key={idx} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-brand-purple">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{program.title}</h3>
              <p className="text-gray-600 mb-4">{program.description}</p>
              <Link href={program.href} className="text-brand-purple font-semibold hover:text-purple-700">Start Now &rarr;</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
