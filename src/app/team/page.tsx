'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'

const team = [
  {
    name: "Zach Wilbert, APRN-FNP",
    role: "Medical Director",
    image: "/team/zach.jpg"
  },
  {
    name: "Henry Fuqua, CADC",
    role: "MindBodySoul IOP Program Director",
    image: "/team/henry.jpg"
  },
  {
    name: "Gregory Haynes, CADCA-1 PSS",
    role: "Director of Client Engagement",
    image: "/team/gregory.jpg"
  },
  {
    name: "Steven Furlow",
    role: "Surrender Program Director",
    image: "/team/steve.jpg"
  }
]

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-2xl font-bold">A Vision For You</Link>
            <nav className="hidden md:flex gap-8">
              <Link href="/programs" className="hover:text-blue-200 transition">Programs</Link>
              <Link href="/about" className="hover:text-blue-200 transition">About</Link>
              <Link href="/blog" className="hover:text-blue-200 transition">Blog</Link>
              <Link href="/donate" className="text-yellow-300 font-bold hover:text-yellow-200 transition">Donate</Link>
            </nav>
          </div>
          <h1 className="text-4xl font-bold">Our Leadership Team</h1>
          <p className="text-blue-100 mt-2">Meet the dedicated professionals leading A Vision For You Recovery</p>
        </div>
      </header>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Photo placeholder</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-semibold mt-2">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            "To lead the homeless, addicted, mentally ill, and maladjusted to a relationship with Christ and equip them to serve others."
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-8 text-center border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Team</h2>
          <p className="text-gray-600 mb-6">We're always looking for passionate professionals to join our mission.</p>
          <a href="mailto:info@avisionforyourecovery.org" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Get in Touch
          </a>
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
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/programs" className="hover:text-white transition">Programs</Link></li>
                <li><Link href="/team" className="hover:text-white transition">Team</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support Us</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/donate" className="hover:text-white transition">Donate</Link></li>
                <li><Link href="/admission" className="hover:text-white transition">Admission</Link></li>
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
