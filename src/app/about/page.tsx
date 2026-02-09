import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata(
  'About A Vision For You',
  'Learn about our mission, leadership, and community-based addiction recovery programs in Louisville, KY.'
)

const CORE_VALUES = [
  "Compassion - We meet people where they are with unconditional love",
  "Hope - Recovery is possible, and transformation happens every day",
  "Dignity - Every person deserves respect and to be treated with value",
  "Community - We are stronger together and support one another",
  "Integrity - We act honestly and keep our commitments",
  "Empowerment - We help people discover their own strength and potential",
  "Accountability - We take responsibility for our actions and results",
  "Service - We serve others with genuine care and dedication",
  "Excellence - We pursue the highest standards in all we do",
  "Inclusivity - All are welcome regardless of background or circumstance",
  "Recovery - We believe in the power of healing and second chances",
  "Persistence - We never give up on anyone or any goal",
  "Gratitude - We appreciate the opportunity to serve",
  "Justice - We advocate for fairness and support the marginalized"
]

const LEADERSHIP = [
  {
    name: "Lucas Bennett",
    title: "President & Founder",
    bio: "With a heart for the homeless and hurting, Lucas founded A Vision for You to provide the comprehensive support he saw was lacking. His vision transformed from an idea into a movement helping hundreds find hope and recovery."
  },
  {
    name: "Dr. Evan Massey",
    title: "VP Medical Director",
    bio: "As a medical doctor and addiction specialist, Dr. Massey brings clinical expertise to our treatment programs, ensuring evidence-based care and compassionate medical support for all clients."
  }
]

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">About A Vision For You</h1>
          <p className="text-xl opacity-95">Our story, our mission, and the people transforming lives every day</p>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">Our Story</h2>
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-brand-purple mb-4">Founded with Compassion</h3>
              <p className="text-lg text-gray-700 leading-relaxed">A Vision For You was founded on the belief that everyone deserves a second chance. Walking the streets of Louisville, Kentucky, our founder Lucas Bennett witnessed the pain of homelessness and addiction firsthand. He realized that what was missing wasn't the desire for recovery—it was the support system to make it possible.</p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">From those beginnings, A Vision For You has grown into a comprehensive recovery and support network, serving hundreds of people each year. We're not just a treatment center; we're a community of recovery.</p>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-brand-purple mb-4">Our Mission</h3>
              <p className="text-2xl font-semibold text-center text-gray-900 mb-6">"To empower the homeless, addicted, maladjusted, and mentally ill to lead productive lives through housing, education, self-help, treatment, or any other available resource"</p>
              <p className="text-lg text-gray-700 leading-relaxed">This isn't just words on a page—it's what drives us every single day. We combine evidence-based treatment, peer support, housing stability, education, and vocational training to create pathways to lasting recovery.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-16 text-center">Our Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {LEADERSHIP.map((leader, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-green-50 p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mx-auto mb-6"></div>
                <h3 className="text-2xl font-bold text-center mb-2">{leader.name}</h3>
                <p className="text-center text-blue-600 font-semibold mb-4">{leader.title}</p>
                <p className="text-gray-700 text-center leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 text-center">Our Core Values</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto text-lg">These 14 values guide everything we do and everyone we serve:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {CORE_VALUES.map((value, idx) => {
              const [title, description] = value.split(" - ")
              return (
                <div key={idx} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                  <p className="font-bold text-blue-600 mb-1 text-sm">{title}</p>
                  <p className="text-xs text-gray-600">{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600 mb-3">500+</div>
              <p className="text-xl text-gray-700">People in active recovery</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-green-600 mb-3">7</div>
              <p className="text-xl text-gray-700">Recovery residences throughout Kentucky</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600 mb-3">95%</div>
              <p className="text-xl text-gray-700">Success rate for program completion</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-lg border-l-4 border-purple-600">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">Our Commitment to Transparency & Trust</h2>
            
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">501(c)(3) Nonprofit Status</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed sm:ml-16">A Vision For You is a registered 501(c)(3) nonprofit organization (EIN available upon request). This status is granted by the IRS to organizations that operate exclusively for charitable, educational, or social purposes and reinvest all revenues back into our mission.</p>
            </div>

            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Tax-Deductible Giving</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed sm:ml-16">Your donations to A Vision For You are fully tax-deductible. We encourage you to consult with your tax advisor about the tax implications of your charitable contribution. All donations support our core mission of providing housing, treatment, education, and support services to those in recovery.</p>
            </div>

            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Financial Accountability</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed sm:ml-16">As a nonprofit organization, A Vision For You operates with complete transparency. Our financial statements and annual 990 forms are available to the public through the IRS and charity databases. We maintain rigorous accounting practices and are accountable to our donors, clients, and community.</p>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Mission-Driven Operations</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed sm:ml-16">Every donation goes directly to supporting our mission. Our leadership, board members, and staff are committed to the vision that everyone deserves a second chance. We maintain the highest ethical standards and operate with integrity in all dealings.</p>
            </div>

            <div className="mt-12 p-4 sm:p-6 md:p-8 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-center text-gray-700 mb-4">
                <span className="font-semibold text-purple-900">Questions about our nonprofit status or financial practices?</span>
              </p>
              <p className="text-center text-gray-600">
                Contact us at{' '}
                <a href="mailto:info@avisionforyourecovery.org" className="text-purple-600 hover:text-purple-900 font-semibold underline">
                  info@avisionforyourecovery.org
                </a>
                {' '}or call{' '}
                <a href="tel:+15027496344" className="text-purple-600 hover:text-purple-900 font-semibold underline">
                  (502) 749-6344
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Ready to Join the Community?</h2>
          <p className="text-xl mb-8 opacity-95">Whether you're seeking recovery for yourself or wanting to support others on their journey, we welcome you.</p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/programs" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-50 transition">Explore Our Programs</Link>
            <a href="tel:+15027496344" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition">Call (502) 749-6344</a>
          </div>
        </div>
      </section>
    </div>
  )
}
