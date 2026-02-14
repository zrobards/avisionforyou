"use client"

import Image from 'next/image'
import { useState } from 'react'
import { Heart, Users, Home, BookOpen, FileText } from 'lucide-react'
import type { ProgramInfo } from '@/lib/cms'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'surrender-program': Home,
  'mindbodysoul-iop': Users,
  'moving-mountains-ministry': BookOpen,
  'dui-classes': FileText,
}

export function ProgramView({ programs }: { programs: ProgramInfo[] }) {
  const safePrograms = programs.length ? programs : []
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = safePrograms[selectedIndex] || safePrograms[0]

  if (!safePrograms.length) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Our Programs</h1>
          <p className="text-purple-100 mt-2">Comprehensive recovery services tailored to your needs</p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {safePrograms.map((program, index) => {
            const Icon = iconMap[program.slug] || Home
            const isSelected = selectedIndex === index
            return (
              <button
                key={program.slug}
                onClick={() => setSelectedIndex(index)}
                className={`p-6 rounded-lg text-left transition ${
                  isSelected
                    ? 'bg-brand-purple text-white shadow-lg'
                    : 'bg-white text-gray-900 shadow hover:shadow-lg border border-gray-200'
                }`}
                aria-pressed={isSelected}
              >
                <Icon className="w-8 h-8 mb-2" aria-hidden="true" />
                <h3 className="font-bold text-lg">{program.title}</h3>
                <p className={`text-sm mt-2 ${isSelected ? 'text-purple-100' : 'text-gray-600'}`}>
                  {program.category}
                </p>
              </button>
            )
          })}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-brand-purple">
          <div className="mb-6">
            <span className="inline-block bg-purple-100 text-brand-purple px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {selected?.category}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{selected?.title}</h2>
            <p className="text-lg text-gray-600">{selected?.fullDescription}</p>
          </div>

          {selected?.details?.length ? (
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Program Features</h3>
              <ul className="space-y-3">
                {selected.details.map((detail, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-brand-green font-bold">✓</span>
                    <span className="text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {selected?.slug === 'surrender-program' && selected.heroImages?.length ? (
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-white rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Community in Action</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selected.heroImages.map((src, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                    <Image
                      src={src}
                      alt={selected.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selected?.slug === 'mindbodysoul-iop' && selected.logo ? (
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-white rounded-lg p-6">
              <div className="flex items-center justify-center mb-6">
                <Image
                  src={selected.logo}
                  alt="MindBodySoul Logo"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Program in Action</h3>
              <p className="text-gray-700">Daily group counseling, one-on-one sessions, and home-based services keep participants engaged while maintaining life responsibilities.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
