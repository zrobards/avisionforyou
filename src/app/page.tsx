import Link from 'next/link'
import ImpactMetrics from '@/components/shared/ImpactMetrics'

const TESTIMONIALS = [
  {
    name: "Josh J.",
    role: "Client / Intern",
    quote: "A Vision for You is the best treatment center I have ever been to. It is the longest amount of sobriety in my life. I struggle with mental illness, and I am allowed to take my medication, and the staff is very accommodating."
  },
  {
    name: "Laura F.",
    role: "Alumni / Staff",
    quote: "I moved here from Georgia seeking help with my addiction. After trying many facilities, AVFY has succeeded in showing me a new way to live. They've given me hope and I'm now employed and a full-time student."
  },
  {
    name: "Johnny M.",
    role: "Alumni / Staff",
    quote: "14 months ago, I was hopeless, jobless, and homeless. AVFY took me in with open arms. I now work there helping others. AVFY has given me my life back, and I am eternally grateful."
  }
]

const PROGRAMS = [
  { title: "MindBodySoul IOP", description: "Intensive Outpatient Treatment combining therapy, psychiatry, and evidence-based practices", type: "IOP" },
  { title: "Surrender Program", description: "Voluntary, self-help, social model recovery program grounded in 12-step principles", type: "SHELTER" },
  { title: "Housing & Shelter", description: "Safe, supportive residential recovery spaces with community support", type: "HOUSING" },
  { title: "Self-Help Groups", description: "Peer-driven support groups and community building activities", type: "SELF_HELP" },
  { title: "Food & Nutrition", description: "Nutritious meals and dietary support as part of holistic recovery", type: "FOOD" },
  { title: "Career Reentry", description: "Job training, placement assistance, and employment support services", type: "CAREER" }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-purple via-purple-700 to-brand-green text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">A Vision For You Recovery</h1>
          <p className="text-xl mb-2 font-semibold">501(c)(3) Charity</p>
          <p className="text-lg md:text-xl mb-8 opacity-95">"To empower the homeless, addicted, maladjusted, and mentally ill to lead productive lives through housing, education, self-help, treatment, or any other available resource"</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/login?callbackUrl=/assessment" className="px-8 py-4 bg-white text-brand-purple rounded-lg font-bold hover:bg-brand-green hover:text-white transition">Explore Programs</Link>
            <Link href="/donate" className="px-8 py-4 bg-brand-green text-brand-purple rounded-lg font-bold hover:bg-green-400 transition">Make a Donation</Link>
            <a href="tel:+15027496344" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-brand-green hover:border-brand-green transition">Call (502) 749-6344</a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Approach</h2>
          <p className="text-lg text-gray-700 mb-4">There is hope for recovery and treatment is possible. We combine multiple proven methods including:</p>
          <ul className="text-lg text-gray-700 space-y-2 mb-6">
            <li>✓ Intensive Outpatient Treatment (IOP)</li>
            <li>✓ Peer Driven Behavior Modification</li>
            <li>✓ Twelve Step Groups</li>
            <li>✓ Therapy & Psychiatry</li>
            <li>✓ Primary Care Referral</li>
            <li>✓ Career Reentry & Aftercare</li>
          </ul>
          <p className="text-lg font-semibold text-brand-purple">Our approach? Provide clients with the recovery path that will best meet their individual needs.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Our Programs</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">As a 501(c)(3) Charity, we offer multiple programs to support your recovery journey.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROGRAMS.map((program, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-blue-600">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <Link href="/login?callbackUrl=/assessment" className="text-blue-600 font-semibold hover:text-blue-700">Start Now →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <ImpactMetrics />

      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
                <p className="text-gray-600 italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <hr className="my-4" />
                <p className="font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-5xl font-bold mb-2">500+</div><p className="text-blue-100">Lives Transformed</p></div>
            <div><div className="text-5xl font-bold mb-2">7</div><p className="text-blue-100">Recovery Residences</p></div>
            <div><div className="text-5xl font-bold mb-2">6</div><p className="text-blue-100">Program Types</p></div>
            <div><div className="text-5xl font-bold mb-2">100%</div><p className="text-blue-100">Tax-Deductible</p></div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-purple-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Recovery Community</h2>
              <p className="text-xl text-gray-700 mb-6">Connect with thousands of people on their recovery journey. Share experiences, celebrate milestones, and find support from people who truly understand.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>24/7 Support Groups & Peer Mentoring</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Recovery Resources & Success Stories</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Community Events & Celebrations</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Safe, Moderated, & Private Community</span>
                </li>
              </ul>
              <Link href="/community" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 inline-block">
                Explore Our Community
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8 border-l-4 border-indigo-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Join?</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-bold">1</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real Connection</h4>
                    <p className="text-gray-600 text-sm">Connect with people who understand your journey</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-bold">2</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                    <p className="text-gray-600 text-sm">Get help and encouragement whenever you need it</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-bold">3</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Safe Space</h4>
                    <p className="text-gray-600 text-sm">A moderated community focused on recovery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Your Impact Matters</h2>
          <p className="text-xl text-gray-700 mb-8">Every donation supports safe shelter, meals, recovery beds, and vital services for people facing homelessness and addiction.</p>
          <Link href="/donate" className="px-12 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 inline-block text-lg">Make a Donation Today</Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div><h4 className="text-white font-bold mb-4">A Vision For You</h4><p className="text-sm">Supporting recovery and transformation for those facing homelessness, addiction, and mental health challenges.</p></div>
            <div><h4 className="text-white font-bold mb-4">Links</h4><ul className="space-y-2 text-sm"><li><Link href="/programs" className="hover:text-white">Programs</Link></li><li><Link href="/about" className="hover:text-white">About</Link></li><li><Link href="/blog" className="hover:text-white">Blog</Link></li><li><Link href="/donate" className="hover:text-white">Donate</Link></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">Account</h4><ul className="space-y-2 text-sm"><li><Link href="/login" className="hover:text-white">Sign In</Link></li><li><Link href="/signup" className="hover:text-white">Create Account</Link></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">Contact</h4><p className="text-sm mb-2"><strong>1675 Story Ave, Louisville, KY 40206</strong></p><p className="text-sm mb-2"><a href="tel:+15027496344" className="hover:text-white">(502) 749-6344</a></p><p className="text-sm"><a href="mailto:info@avisionforyourecovery.org" className="hover:text-white">info@avisionforyourecovery.org</a></p></div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm"><p>&copy; 2025 A Vision For You Recovery. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  )
}
