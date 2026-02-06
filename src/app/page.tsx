import Link from 'next/link'
import ImpactMetrics from '@/components/shared/ImpactMetrics'
import LeadCaptureCTA from '@/components/shared/LeadCaptureCTA'
import SocialFeed from '@/components/home/SocialFeed'

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
  { title: "MindBodySoul IOP", description: "Intensive Outpatient Treatment combining therapy, psychiatry, and evidence-based practices", type: "IOP", href: "/programs/iop" },
  { title: "Surrender Program", description: "Voluntary, self-help, social model recovery program grounded in 12-step principles", type: "SHELTER", href: "/programs/surrender" },
  { title: "Housing & Shelter", description: "Safe, supportive residential recovery spaces with community support", type: "HOUSING", href: "/programs/housing" },
  { title: "Self-Help Groups", description: "Peer-driven support groups and community building activities", type: "SELF_HELP", href: "/programs/self-help" },
  { title: "Food & Nutrition", description: "Nutritious meals and dietary support as part of holistic recovery", type: "FOOD", href: "/programs/food" },
  { title: "Career Reentry", description: "Job training, placement assistance, and employment support services", type: "CAREER", href: "/programs/career" }
]

const HERO_VIDEO_SRC = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/videos/cloud-background.mp4"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/AVFY%20LOGO.jpg"
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-white py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">A Vision For You</h1>
            <p className="text-xl mb-2 font-semibold drop-shadow-md">501(c)(3) Charity</p>
            <p className="text-lg md:text-xl mb-8 opacity-95 drop-shadow-md max-w-4xl mx-auto">"To empower the homeless, addicted, maladjusted, and mentally ill to lead productive lives through housing, education, self-help, treatment, or any other available resource"</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/programs" className="px-8 py-4 bg-white text-brand-purple rounded-lg font-bold hover:bg-brand-green hover:text-white transition shadow-lg hover:shadow-xl">Explore Programs</Link>
              <Link href="/donate" className="px-8 py-4 bg-brand-green text-white rounded-lg font-bold hover:bg-green-500 transition shadow-lg hover:shadow-xl">Make a Donation</Link>
              <a href="tel:+15027496344" className="px-8 py-4 border-2 border-white bg-black/20 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-brand-green hover:border-brand-green transition shadow-lg hover:shadow-xl">Call (502) 749-6344</a>
            </div>
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
              <div key={idx} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-brand-purple">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <Link href={program.href} className="text-brand-purple font-semibold hover:text-purple-700">Start Now →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture CTA */}
      <LeadCaptureCTA variant="banner" />

      {/* Impact Metrics */}
      <ImpactMetrics />

      <section className="py-20 bg-purple-50">
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

      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-5xl font-bold mb-2">500+</div><p className="text-brand-green">Lives Transformed</p></div>
            <div><div className="text-5xl font-bold mb-2">7</div><p className="text-brand-green">Recovery Residences</p></div>
            <div><div className="text-5xl font-bold mb-2">6</div><p className="text-brand-green">Program Types</p></div>
            <div><div className="text-5xl font-bold mb-2">100%</div><p className="text-brand-green">Tax-Deductible</p></div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-purple-50 to-green-50 py-20">
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
              <Link href="/community" className="px-8 py-3 bg-brand-purple text-white rounded-lg font-semibold hover:bg-purple-700 inline-block">
                Explore Our Community
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8 border-l-4 border-brand-purple">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Join?</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-brand-purple font-bold">1</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real Connection</h4>
                    <p className="text-gray-600 text-sm">Connect with people who understand your journey</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-brand-purple font-bold">2</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                    <p className="text-gray-600 text-sm">Get help and encouragement whenever you need it</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-brand-purple font-bold">3</div>
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

      {/* Social Media Feed */}
      <SocialFeed 
        instagramUrl="https://www.instagram.com/avision_foryourecovery/"
        facebookPageUrl="https://www.facebook.com/avisionforyourecovery"
        tiktokUsername="avisionforyourecovery"
      />
    </div>
  )
}
