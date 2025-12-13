"use client"

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trophy, Rocket, Zap, Code, Palette } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa'

export function About() {
  const team = [
    {
      name: 'Sean',
      role: 'Lead Engineer & Co-Founder',
      initial: 'S',
      gradient: 'from-blue-500 to-purple-600',
      textColor: 'text-blue-400',
      description: 'Lead Engineer focused on backend infrastructure and full-stack development. Trinity High School graduate with FBLA experience in business applications. Passionate about Raspberry Pi projects, AI automation, and building scalable systems with modern technologies.',
      instagram: 'https://www.instagram.com/sean.mcculloch7/?hl=en'
    },
    {
      name: 'Zach',
      role: 'Product Designer & Frontend Lead',
      initial: 'Z',
      gradient: 'from-green-500 to-blue-600',
      textColor: 'text-green-400',
      description: 'Product Designer and Frontend Lead specializing in user experience and interface design. Focuses on client experience, presentation polish, and ensuring every project not only works perfectly but looks amazing. Trinity High School graduate with strong FBLA background.',
      instagram: 'https://www.instagram.com/zachrobards/?hl=en'
    }
  ]

  const journey = [
    {
      icon: Trophy,
      title: 'FBLA Projects',
      description: 'Started building business applications through Future Business Leaders of America competitions at Trinity High School, learning the importance of real-world solutions.',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: Rocket,
      title: 'Client Launches',
      description: 'Launched our first two business websites - Red Head Printing\'s e-commerce platform and Big Red Bus\'s booking system, proving our ability to deliver real results.',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      icon: Zap,
      title: 'Next Chapter',
      description: 'Now building full dashboards, automation tools, and modern web applications with Next.js, focusing on fast delivery and cutting-edge technology.',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ]

  return (
    <section id="about" className="py-32 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <Image 
                src="/logos/trinity-logo.png" 
                alt="Trinity High School" 
                width={400}
                height={150}
                className="h-24 md:h-32 w-auto object-contain"
              />
            </div>
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <Image 
                src="/logos/fbla-logo.png" 
                alt="Future Business Leaders of America" 
                width={400}
                height={120}
                className="h-20 md:h-28 w-auto object-contain"
              />
            </div>
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <Image 
                src="/logos/nhs-logo.png" 
                alt="National Honor Society" 
                width={150}
                height={150}
                className="h-24 md:h-32 w-auto object-contain"
              />
            </div>
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <Image 
                src="/logos/beta-club-logo.png" 
                alt="Beta Club" 
                width={150}
                height={150}
                className="h-24 md:h-32 w-auto object-contain"
              />
            </div>
          </motion.div>
          <motion.h2 
            className="text-5xl md:text-6xl font-black mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Who We Are
            </span>
          </motion.h2>
          <motion.div 
            className="max-w-3xl mx-auto space-y-6 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.p 
              className="text-xl text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              We're young developers, designers, and builders from Louisville, KY.
            </motion.p>
            <motion.p 
              className="text-lg text-gray-400 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We started SeeZee to make powerful tech accessible to small businesses, creators, and anyone chasing something big.
            </motion.p>
            <motion.p 
              className="text-lg text-gray-400 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              No agency markup. No outsourcing. Just real work, fast.
            </motion.p>
          </motion.div>
          <motion.p 
            className="text-sm text-gray-500 italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Founded by Sean McCulloch and team.
          </motion.p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-6 mb-20">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  className={`w-20 h-20 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6 flex-shrink-0`}
                  whileHover={{ 
                    scale: 1.15,
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                >
                  {member.initial}
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                    {member.name}
                  </h3>
                  <p className={`${member.textColor} font-medium`}>{member.role}</p>
                </div>
              </div>
              <motion.p 
                className="text-gray-300 leading-relaxed mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                {member.description}
              </motion.p>
              {member.instagram && (
                <motion.a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <FaInstagram className="w-5 h-5" />
                  <span className="text-sm">Instagram</span>
                </motion.a>
              )}
              {/* Hover glow */}
              <motion.div 
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${member.gradient} opacity-0 blur-xl -z-10`}
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl md:text-4xl font-black mb-12">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Our Journey
            </span>
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {journey.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <motion.div 
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-5`}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  {React.createElement(step.icon, { className: "w-8 h-8 text-white" })}
                </motion.div>
                <h4 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                  {step.title}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>
                {/* Hover glow */}
                <motion.div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-0 blur-xl -z-10`}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}