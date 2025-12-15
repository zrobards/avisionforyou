import Link from 'next/link'

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
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">Vision For You</Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/programs" className="text-gray-700 hover:text-blue-600 font-medium">Programs</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium">Blog</Link>
            <Link href="/donate" className="text-gray-700 hover:text-blue-600 font-medium">Donate</Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-r from-blue-700 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">About A Vision For You</h1>
          <p className="text-xl opacity-95">Our story, our mission, and the people transforming lives every day</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-center">Our Story</h2>
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Founded with Compassion</h3>
              <p className="text-lg text-gray-700 leading-relaxed">A Vision For You was founded on the belief that everyone deserves a second chance. Walking the streets of Louisville, Kentucky, our founder Lucas Bennett witnessed the pain of homelessness and addiction firsthand. He realized that what was missing wasn't the desire for recovery—it was the support system to make it possible.</p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">From those beginnings, A Vision For You has grown into a comprehensive recovery and support network, serving hundreds of people each year. We're not just a treatment center; we're a community of recovery.</p>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Our Mission</h3>
              <p className="text-2xl font-semibold text-center text-gray-900 mb-6">"To empower the homeless, addicted, maladjusted, and mentally ill to lead productive lives through housing, education, self-help, treatment, or any other available resource"</p>
              <p className="text-lg text-gray-700 leading-relaxed">This isn't just words on a page—it's what drives us every single day. We combine evidence-based treatment, peer support, housing stability, education, and vocational training to create pathways to lasting recovery.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center">Our Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {LEADERSHIP.map((leader, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-lg shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mx-auto mb-6"></div>
                <h3 className="text-2xl font-bold text-center mb-2">{leader.name}</h3>
                <p className="text-center text-blue-600 font-semibold mb-4">{leader.title}</p>
                <p className="text-gray-700 text-center leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Core Values</h2>
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-3">500+</div>
              <p className="text-xl text-gray-700">People in active recovery</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-3">7</div>
              <p className="text-xl text-gray-700">Recovery residences throughout Kentucky</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-3">95%</div>
              <p className="text-xl text-gray-700">Success rate for program completion</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join the Community?</h2>
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
