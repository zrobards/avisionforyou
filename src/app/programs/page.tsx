'use client'

import Link from 'next/link'
import { Heart, Users, Home, BookOpen, Briefcase } from 'lucide-react'
import { useState } from 'react'

const PROGRAMS = [
  {
    title: "Surrender Program",
    slug: "surrender-program",
    category: "Long-Term Residential",
    description: "A 6-9 month peer-driven recovery program",
    icon: Home,
    fullDescription: "Based on our original flagship model, the Surrender Program is a 6-9 month voluntary self-help social model recovery program. Participants of this program are immersed in a community of peers who together learn life skills and guide one another through the twelve steps. This program is 100% free and does not accept insurance of any kind.",
    details: [
      "100% free - no insurance required",
      "Donations support food, shelter, and literature",
      "Residential living with no cost to client",
      "Daily recovery-oriented classes",
      "Weekly behavioral modification programming",
      "Weekly career education programming",
      "Peer and staff accountability",
      "Daily on-property and off-property 12-step meeting attendance",
      "Three daily meals provided",
      "Weekly random substance screening",
      "Onsite primary care through partner physicians",
      "Cell phones, vehicles, and employment prohibited in initial phase to focus on recovery"
    ]
  },
  {
    title: "MindBodySoul IOP",
    slug: "mindbodysoul-iop",
    category: "Intensive Outpatient",
    description: "Clinical intensive outpatient program",
    icon: Users,
    fullDescription: "Our comprehensive intensive outpatient program combining evidence-based therapy, psychiatric care, and holistic wellness approaches.",
    details: [
      "Group and individual therapy sessions",
      "Psychiatric evaluations and medication management",
      "Intensive skill-building workshops",
      "Peer support and community building",
      "Evening and weekend options available",
      "Evidence-based treatment modalities",
      "Mental health and addiction support"
    ]
  },
  {
    title: "Moving Mountains Ministry",
    slug: "moving-mountains-ministry",
    category: "Faith-Based Recovery",
    description: "Spiritual recovery and discipleship ministry",
    icon: BookOpen,
    fullDescription: "Moving Mountains Ministry represents the spiritual arm of A Vision For You, birthed from the conviction that true recovery involves spiritual renewal. Our mission is to lead the homeless, addicted, mentally ill, and maladjusted to a relationship with Christ and equip them to serve others.",
    details: [
      "Faith-based 12-step classes",
      "Life Recovery Bible distribution",
      "Minister training program",
      "Spiritual mentorship and leadership development",
      "Christian discipleship in recovery",
      "Prison and reentry programs (launching 2026)",
      "Church partnerships for extended reach",
      "Holistic spiritual transformation"
    ]
  },
  {
    title: "Women's Program",
    slug: "womens-program",
    category: "Long-Term Residential",
    description: "Specialized recovery program for women",
    icon: Heart,
    fullDescription: "A specialized recovery program designed specifically for women addressing unique needs and challenges in addiction recovery.",
    details: [
      "Female-centered peer community",
      "Trauma-informed care approaches",
      "Specialized counseling services",
      "Holistic wellness programming",
      "Coming soon - additional details available upon inquiry"
    ]
  }
]

export default function Programs() {
  const [selectedProgram, setSelectedProgram] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Our Programs</h1>
          <p className="text-purple-100 mt-2">Comprehensive recovery services tailored to your needs</p>
        </div>
      </header>

      {/* Programs Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PROGRAMS.map((program, index) => {
            const Icon = program.icon
            return (
              <button
                key={index}
                onClick={() => setSelectedProgram(index)}
                className={`p-6 rounded-lg text-left transition ${
                  selectedProgram === index
                    ? 'bg-brand-purple text-white shadow-lg'
                    : 'bg-white text-gray-900 shadow hover:shadow-lg border border-gray-200'
                }`}
              >
                <Icon className="w-8 h-8 mb-2" />
                <h3 className="font-bold text-lg">{program.title}</h3>
                <p className={`text-sm mt-2 ${selectedProgram === index ? 'text-purple-100' : 'text-gray-600'}`}>
                  {program.category}
                </p>
              </button>
            )
          })}
        </div>

        {/* Selected Program Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-brand-purple">
          <div className="mb-6">
            <span className="inline-block bg-purple-100 text-brand-purple px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {PROGRAMS[selectedProgram].category}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{PROGRAMS[selectedProgram].title}</h2>
            <p className="text-lg text-gray-600">{PROGRAMS[selectedProgram].fullDescription}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Program Features</h3>
            <ul className="space-y-3">
              {PROGRAMS[selectedProgram].details.map((detail, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-brand-green font-bold">✓</span>
                  <span className="text-gray-700">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link href="/login?callbackUrl=/assessment" className="bg-brand-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-800 transition">
              Start Application
            </Link>
            <a href="tel:(502)749-6344" className="bg-white text-brand-purple border-2 border-brand-purple px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition">
              Call for Info
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h2>
          <p className="text-purple-100 mb-6">Contact us today to learn more about how we can support your recovery journey.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login?callbackUrl=/assessment" className="bg-brand-green text-brand-purple px-8 py-3 rounded-lg font-bold hover:bg-green-400 transition">
              Begin Your Journey
            </Link>
            <Link href="/donate" className="bg-white text-brand-purple px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition">
              Support Our Mission
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">A Vision For You</h3>
              <p className="text-slate-300">1675 Story Ave, Louisville, KY 40206</p>
              <p className="text-slate-300">(502) 749-6344</p>
              <p className="text-slate-300">info@avisionforyourecovery.org</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/programs" className="hover:text-white transition">Programs</Link></li>
                <li><Link href="/team" className="hover:text-white transition">Team</Link></li>
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support Us</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/donate" className="hover:text-white transition">Donate</Link></li>
                <li><Link href="/admission" className="hover:text-white transition">Apply for Admission</Link></li>
                <li><a href="mailto:info@avisionforyourecovery.org" className="hover:text-white transition">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 A Vision For You Recovery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
