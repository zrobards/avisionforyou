'use client'

import Link from 'next/link'
import Image from 'next/image'
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
      "Onsite IOP Services",
      "Residential living (no cost to client)",
      "Daily recovery oriented classes",
      "Weekly behavioral modification programming",
      "Weekly career education programming",
      "Peer and staff accountability",
      "Daily on property and off property 12 step meeting attendance",
      "Three daily meals provided",
      "Weekly random substance screening",
      "Onsite Primary Care offered through partner house call and telehealth physicians",
      "Cell Phones, vehicles, and employment are prohibited in this phase, so that clients can focus on recovery"
    ]
  },
  {
    title: "MindBodySoul IOP",
    slug: "mindbodysoul-iop",
    category: "Intensive Outpatient Program (IOP)",
    description: "90-day clinical outpatient treatment program",
    icon: Users,
    fullDescription: "A 90-day program with daily sessions, individual therapy, and peer support. Ideal for maintaining daily responsibilities while seeking recovery. This is a clinical outpatient treatment program for people suffering from substance use disorder and is an insurance accepting program. MindBodySoul accepts all forms of KY Medicaid and some private insurances.",
    details: [
      "90-day structured treatment program",
      "Daily Sessions: Group counseling and educational workshops on addiction, mental health, and wellness",
      "Individual Therapy: Weekly one-on-one sessions with a licensed CADC (Certified Alcohol and Drug Counselor)",
      "Peer Support: Facilitated group sessions to build a supportive network",
      "Home-based and community integrated sessions",
      "Insurance accepting program - All forms of KY Medicaid and some private insurances accepted",
      "Maintain daily responsibilities while in treatment"
    ]
  },
  {
    title: "Moving Mountains Ministry",
    slug: "moving-mountains-ministry",
    category: "Faith-Based Recovery",
    description: "Spiritual recovery and discipleship ministry - The MOOOOVEEEE-ment",
    icon: BookOpen,
    fullDescription: "Moving Mountains Ministry represents the spiritual arm of A Vision For You Inc., honoring Gary Morris's early vision and leadership. Born during the COVID-19 pandemic when traditional recovery meetings had shuttered, this ministry emerged from a warehouse in South Louisville where Gary Morris found both sobriety and a renewed relationship with God. Our mission: To lead the homeless, addicted, mentally ill, and maladjusted to a relationship with Christ and equip them to serve others.",
    details: [
      "Faith-based 12-step classes on our residential recovery campus",
      "Life Recovery Bible distribution to those we serve",
      "Minister training program - equipping men and women in recovery to become spiritual leaders",
      "Biblical foundation: Faith, even as small as a mustard seed, can move mountains",
      "Holistic approach bridging clinical addiction treatment and spiritual transformation",
      "Prison ministry and reentry programs launching in 2026",
      "Church partnerships and treatment center collaborations",
      "Weekly faith-based classes taught by Executive Director Lucas Bennett",
      "The MOOOOVEEEE-ment - a passionate community affirming spiritual breakthroughs together"
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

          {/* Community Photos Gallery - Surrender Program */}
          {selectedProgram === 0 && (
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-white rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Community in Action</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <Image
                    src="/programs/surrender-gathering-1.png"
                    alt="Community gathering"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <Image
                    src="/programs/surrender-gathering-2.png"
                    alt="Meal time community"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <Image
                    src="/programs/surrender-facility.png"
                    alt="Program facility"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <Image
                    src="/programs/surrender-group.png"
                    alt="Group activity"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MindBodySoul IOP Photos Gallery */}
          {selectedProgram === 1 && (
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-white rounded-lg p-6">
              <div className="flex items-center justify-center mb-6">
                <Image
                  src="/programs/mindbodysoul-logo.png"
                  alt="MindBodySoul Logo"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Program in Action</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <Image
                    src="/programs/mindbodysoul-group-1.png"
                    alt="Group therapy session"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <Image
                    src="/programs/mindbodysoul-teaching.png"
                    alt="Educational session"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <Image
                    src="/programs/mindbodysoul-education.png"
                    alt="Clinical education"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <Image
                    src="/programs/mindbodysoul-group-2.png"
                    alt="Support circle"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Moving Mountains Ministry Section */}
          {selectedProgram === 2 && (
            <div className="mt-8 bg-gradient-to-br from-green-50 to-white rounded-lg p-6">
              <div className="flex items-center justify-center mb-6">
                <Image
                  src="/programs/movingmountains-logo.png"
                  alt="Moving Mountains Ministry Logo"
                  width={250}
                  height={250}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">The MOOOOVEEEE-ment: Our Story</h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    In the darkest days of the COVID-19 pandemic, when traditional recovery meetings had shuttered and isolation was rampant, a glimmer of hope emerged in an unlikely place—a warehouse in South Louisville. It was there, in 2020, that Gary Morris, a man in early recovery and one of the founding board members of A Vision For You Inc., found both sobriety and a renewed relationship with God.
                  </p>
                  <p>
                    Gary had been gathering and volunteering with men for worship services and 12-step meetings in the only place open and large enough to allow for safe, socially-distanced gatherings. It was during this season of adversity that Gary felt called to name a new A.A. meeting inspired by his growing faith—"Moving Mountains."
                  </p>
                  <p className="font-semibold text-brand-green">
                    The name drew from the biblical promise that faith, even as small as a mustard seed, can move mountains.
                  </p>
                  <p>
                    The meeting quickly developed a strong sense of community and identity. Participants would often shout "MOOOOVE!" in unison, a playful yet passionate affirmation of the spiritual breakthroughs they were experiencing together.
                  </p>
                  <p>
                    That small weekly class has since evolved into a full-fledged ministry—Moving Mountains Ministry—representing the spiritual arm of A Vision For You Inc., honoring Gary Morris's early vision and leadership.
                  </p>
                  <p className="text-lg font-bold text-brand-purple mt-6">
                    Transforming Lives Through Faith and Recovery
                  </p>
                  <p>
                    At its core, Moving Mountains Ministry bridges the gap between clinical addiction treatment and spiritual transformation. It stands as a testament to how faith-based initiatives can complement traditional models of recovery, bringing holistic healing to individuals who have been marginalized, criminalized, and cast aside.
                  </p>
                  <p className="italic text-gray-600">
                    And it all began with one man's surrender to God in a warehouse during a global crisis.
                  </p>
                </div>
              </div>
            </div>
          )}

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

    </div>
  )
}
