'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { 
  FiArrowRight, 
  FiCheck, 
  FiHeart, 
  FiUsers, 
  FiShield, 
  FiEye,
  FiTool,
  FiAward,
  FiBook,
  FiZap,
  FiMail
} from 'react-icons/fi'
import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa'

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gray-900 py-24 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-[56px] font-heading font-bold text-white mb-6 leading-tight"
              >
                Built by Sean and Zach — two developers who care about doing this right.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-300 leading-relaxed"
              >
                SeeZee Studio is a small team from Louisville building accessible, community-focused technology — starting with projects rooted in FBLA competition work and nonprofit initiatives.
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-8 text-center">
                How SeeZee Started
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee didn't begin as a typical web agency.
                </p>
                <p>
                  SeeZee started with two high school friends — Sean and Zach — building websites for FBLA competitions and community projects. We helped local businesses, nonprofits, and community organizations get online — fast, simple, and affordable.
                </p>
                <p className="text-xl text-white font-semibold pt-4">
                  But we kept noticing the same problem:
                </p>
                <p>
                  The people who needed websites the most — mental health organizations, support groups, senior communities, small nonprofits — were either being ignored by big agencies or stuck with confusing, outdated platforms.
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <span className="text-trinity-red mr-3">•</span>
                    <span>Traditional agencies wanted $10,000+ and months of meetings.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-trinity-red mr-3">•</span>
                    <span>DIY website builders were too complicated for non-technical users.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-trinity-red mr-3">•</span>
                    <span>And nobody was designing with cognitive accessibility in mind.</span>
                  </li>
                </ul>
                <p className="text-xl text-white font-semibold pt-4">
                  So we built SeeZee differently.
                </p>
                <p>
                  We focus on the organizations and communities that get overlooked. We build systems that actually work for people who struggle with technology. We design with empathy, clarity, and purpose.
                </p>
                <p>
                  And we don't disappear after launch — we maintain, support, and improve your site as your organization grows.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Our Roots Section - Trinity High School, FBLA, Beta Club */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-8 text-center">
                Our Roots
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee was born at <span className="text-white font-semibold">Trinity High School</span>, where Sean and Zach first discovered their passion for building technology that serves others.
                </p>
                <p>
                  Through our involvement with <span className="text-white font-semibold">FBLA (Future Business Leaders of America)</span>, we learned that business and service go hand in hand. This organization taught us the importance of leadership, community engagement, and using our skills to make a real difference.
                </p>
                <p>
                  Our early projects — websites built for FBLA competitions, community service initiatives, and local nonprofits — showed us that there was a gap in the market. Organizations that needed help the most were being overlooked by traditional agencies.
                </p>
                <p className="text-xl text-white font-semibold pt-4">
                  That's when SeeZee became more than a school project — it became our mission.
                </p>
                <p>
                  Today, we continue to partner with FBLA chapters, offering students real-world experience by working on projects for nonprofits and community organizations. This creates a cycle of impact: students learn valuable skills, communities get the support they need, and organizations receive professional websites at affordable rates.
                </p>
              </div>
            </ScrollAnimation>
            
            {/* Logos Section */}
            <ScrollAnimation delay={0.2}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center bg-white rounded-xl p-4 shadow-lg"
                >
                  <Image
                    src="/logos/trinity-logo.png"
                    alt="Trinity High School"
                    width={140}
                    height={140}
                    className="h-24 w-auto object-contain"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center bg-white rounded-xl p-4 shadow-lg"
                >
                  <Image
                    src="/logos/fbla-logo.png"
                    alt="FBLA - Future Business Leaders of America"
                    width={180}
                    height={100}
                    className="h-20 w-auto object-contain"
                  />
                </motion.div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Sean & Zach Photo Section */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <h2 className="text-3xl text-white text-center mb-12 font-heading font-bold">
              Sean & Zach
            </h2>
          </ScrollAnimation>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8 items-start">
              {/* Left Column - Photo (40%) */}
              <div className="md:col-span-2">
                <ScrollAnimation delay={0.1}>
                  <div className="relative">
                    <ImageLightbox
                      src="/sean-zach-photo.png"
                      alt="Zach, Sean, and Gabe at prom"
                      width={600}
                      height={800}
                      className="rounded-[20px] shadow-2xl w-full h-auto object-cover"
                      caption="Left to right: Zach, Sean, Gabe"
                    />
                    <p className="mt-3 text-sm font-mono text-cyan-400 text-center">
                      Left to right: Zach, Sean, Gabe
                    </p>
                  </div>
                </ScrollAnimation>
              </div>
              
              {/* Right Column - Text (60%) */}
              <div className="md:col-span-3">
                <ScrollAnimation delay={0.2}>
                  <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                    <p>
                      We're Sean and Zach — two developers from Louisville who started building together through FBLA competitions at Trinity High School.
                    </p>
                    <p>
                      What began as school projects quickly became something more serious: a mission to build technology that's calm, accessible, and actually works for people who struggle with typical websites.
                    </p>
                    <p>
                      Gabe rounds out our team, bringing hands-on problem-solving when projects get complicated.
                    </p>
                    <p>
                      We're early-stage, but we build like professionals. We ship working prototypes, explain everything in plain English, and we're committed to sticking around after launch.
                    </p>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-4">
                Meet the Team
              </h2>
            </div>
          </ScrollAnimation>

          <div className="max-w-5xl mx-auto space-y-16">
            {/* Sean */}
            <ScrollAnimation delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="flex flex-col md:flex-row gap-8 items-start p-8 md:p-10 rounded-2xl hover:shadow-xl transition-all bg-gray-800 border-2 border-gray-700 hover:border-trinity-red"
              >
                <div className="w-32 h-32 rounded-full mx-auto md:mx-0 flex-shrink-0 shadow-lg overflow-hidden border-4 border-trinity-red relative group">
                  <Image
                    src="/sean-profile.png"
                    alt="Sean McCulloch"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay with Social Icons */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <a
                      href="https://www.instagram.com/sean.mcculloch7/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-400 transition-colors"
                      aria-label="Instagram"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaInstagram className="w-6 h-6" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/sean-mcculloch-58a3761a9/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-400 transition-colors"
                      aria-label="LinkedIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaLinkedin className="w-6 h-6" />
                    </a>
                    <a
                      href="https://github.com/SeanSpon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label="GitHub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaGithub className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    Sean McCulloch
                  </h3>
                  <p className="text-trinity-red font-semibold mb-4 text-lg">Co-Founder & Technical Director</p>
                  <div className="space-y-4 text-base md:text-lg text-gray-300 leading-relaxed mb-6">
                    <p>
                      Sean builds the systems that power SeeZee — but more importantly, he builds with empathy.
                    </p>
                    <p>
                      He specializes in cognitive accessibility: creating websites and platforms that work for people with memory challenges, processing differences, anxiety, or sensory sensitivities.
                    </p>
                    <p className="text-white font-semibold">
                      Every system he designs follows one principle: "If someone can't use it easily, it's not done."
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Sean handles:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Frontend & backend development</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Database architecture</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Admin dashboard design</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Payment & donation integrations</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Performance optimization</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Accessible UI/UX design</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-300 italic mb-4">
                    Sean builds technology that lifts people up — not locks them out.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <motion.a
                      href="https://github.com/SeanSpon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="GitHub"
                    >
                      <FaGithub className="w-5 h-5" />
                      <span className="font-semibold">GitHub</span>
                    </motion.a>
                    <motion.a
                      href="https://www.linkedin.com/in/sean-mcculloch-58a3761a9/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin className="w-5 h-5" />
                      <span className="font-semibold">LinkedIn</span>
                    </motion.a>
                    <motion.a
                      href="https://www.instagram.com/sean.mcculloch7/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Instagram"
                    >
                      <FaInstagram className="w-5 h-5" />
                      <span className="font-semibold">Follow @sean.mcculloch7</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </ScrollAnimation>

            {/* Zach */}
            <ScrollAnimation delay={0.2}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="flex flex-col md:flex-row gap-8 items-start p-8 md:p-10 rounded-2xl hover:shadow-xl transition-all bg-gray-800 border-2 border-gray-700 hover:border-trinity-red"
              >
                <div className="w-32 h-32 rounded-full mx-auto md:mx-0 flex-shrink-0 shadow-lg overflow-hidden border-4 border-trinity-red relative group">
                  <Image
                    src="/zach-profile.png"
                    alt="Zach Robards"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay with Social Icons */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <a
                      href="https://www.instagram.com/zachrobards/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-400 transition-colors"
                      aria-label="Instagram"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaInstagram className="w-6 h-6" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/zachary-robards-b51457337/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-400 transition-colors"
                      aria-label="LinkedIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaLinkedin className="w-6 h-6" />
                    </a>
                    <a
                      href="https://github.com/zrobards"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label="GitHub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaGithub className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    Zach Robards
                  </h3>
                  <p className="text-trinity-red font-semibold mb-4 text-lg">Co-Founder & Client Experience Director</p>
                  <div className="space-y-4 text-base md:text-lg text-gray-300 leading-relaxed mb-6">
                    <p>
                      Zach makes SeeZee human.
                    </p>
                    <p>
                      He works directly with clients who feel overwhelmed by technology, guiding them through the process with patience, clarity, and genuine care.
                    </p>
                    <p>
                      He also leads SeeZee's community partnerships with FBLA, Beta Club, and local service organizations — connecting students with real projects that help nonprofits and community groups.
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Zach handles:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Client communication & onboarding</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Project planning & timelines</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Content strategy & copywriting</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Community partnerships</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Nonprofit discount coordination</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Long-term client relationships</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-300 italic mb-4">
                    Zach makes every client feel capable — even if they've never touched a computer before.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <motion.a
                      href="https://github.com/zrobards"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="GitHub"
                    >
                      <FaGithub className="w-5 h-5" />
                      <span className="font-semibold">GitHub</span>
                    </motion.a>
                    <motion.a
                      href="https://www.linkedin.com/in/zachary-robards-b51457337/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin className="w-5 h-5" />
                      <span className="font-semibold">LinkedIn</span>
                    </motion.a>
                    <motion.a
                      href="https://www.instagram.com/zachrobards/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaInstagram className="w-5 h-5" />
                      <span className="font-semibold">Follow @zachrobards</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-12 text-center">
                What We Believe
              </h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <FiEye className="w-8 h-8" />,
                  title: 'Technology Should Be Accessible — Cognitively, Not Just Structurally',
                  description: 'We design websites for people with memory issues, processing differences, anxiety, sensory sensitivities, and other cognitive challenges. Clear navigation. Large text. Predictable flows. No jargon. No clutter. Accessibility isn\'t a checklist — it\'s our foundation.',
                },
                {
                  icon: <FiUsers className="w-8 h-8" />,
                  title: 'People Deserve Dignity Online — Even If They Struggle With Tech',
                  description: 'If someone can\'t code, can\'t manage complex dashboards, or gets overwhelmed by standard interfaces — they shouldn\'t be left behind. We build systems that are genuinely easy to use for everyone, not just tech-savvy users.',
                },
                {
                  icon: <FiHeart className="w-8 h-8" />,
                  title: 'We Build for the People Big Agencies Overlook',
                  description: 'Mental health organizations. Support groups. Senior communities. Small nonprofits. Neuro-inclusive advocacy groups. These are the people who need digital tools the most — and the ones traditional agencies ignore. We don\'t.',
                },
                {
                  icon: <FiShield className="w-8 h-8" />,
                  title: 'Support Doesn\'t Disappear After Launch',
                  description: 'Most agencies take your money, build a site, and vanish. We\'re committed to staying involved long-term. We maintain, update, fix, improve, and evolve your systems as your organization grows. Long-term partnerships, not one-time projects.',
                },
                {
                  icon: <FiHeart className="w-8 h-8" />,
                  title: 'Relationships Matter More Than Contracts',
                  description: 'We aim to build relationships that last for years — not because clients are locked in by a contract, but because they genuinely like working with us. We talk like humans. We keep things simple. We deliver more than we promise.',
                },
                {
                  icon: <FiAward className="w-8 h-8" />,
                  title: 'We Give Back Through Community & Education',
                  description: 'Through partnerships with FBLA, Beta Club, and local schools, we help students gain real-world experience by building websites for nonprofits and community organizations. This creates a cycle of impact: students learn, communities grow, and organizations get the support they deserve.',
                },
              ].map((value, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 glass-effect"
                  >
                    <div className="text-trinity-red mb-4">{value.icon}</div>
                    <h3 className="text-xl font-heading font-semibold text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-12 text-center">
                Who We Build For
              </h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { emoji: '🧠', title: 'Mental Health Organizations', desc: 'Support groups, therapy centers, recovery programs, crisis services' },
                { emoji: '🌈', title: 'Neuro-Inclusive Communities', desc: 'ADHD, autism, cognitive accessibility, neurodivergent advocacy' },
                { emoji: '👴', title: 'Senior & Community Groups', desc: 'Organizations serving older adults who need simple, usable technology' },
                { emoji: '💙', title: 'Nonprofits & Small Teams', desc: '501(c)(3) organizations with limited budgets and big missions' },
                { emoji: '🎓', title: 'Student & Youth Programs', desc: 'Schools, service clubs, and youth-led community projects' },
                { emoji: '❤️', title: 'Support & Recovery Groups', desc: 'AA, NA, Al-Anon, mental health peer support, 12-step programs' },
              ].map((group, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 glass-effect"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{group.emoji}</div>
                      <div>
                        <h3 className="text-xl font-heading font-semibold text-white mb-2">
                          {group.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {group.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-12 text-center">
                How We Work
              </h2>
            </ScrollAnimation>
            <div className="space-y-6">
              {[
                {
                  icon: <FiHeart className="w-8 h-8" />,
                  title: 'We Design With Empathy First',
                  description: 'Every website we build is tested for cognitive accessibility. We ask: "Can someone with memory challenges use this? Can someone with anxiety navigate this without stress?" If the answer is no, we redesign it.',
                },
                {
                  icon: <FiTool className="w-8 h-8" />,
                  title: 'We Build Systems, Not Just Websites',
                  description: 'Donations. Events. RSVPs. Email reminders. Admin dashboards. Analytics. We don\'t just make things look good — we make them work.',
                },
                {
                  icon: <FiMail className="w-8 h-8" />,
                  title: 'We Communicate Clearly & Patiently',
                  description: 'No jargon. No tech-speak. No assumptions. We explain everything in plain language and walk clients through the process step by step.',
                },
                {
                  icon: <FiShield className="w-8 h-8" />,
                  title: 'We Stay With You Long-Term',
                  description: 'We don\'t build a site and disappear. We\'re committed to maintaining, updating, and supporting your platform as your organization evolves. Your success is our success.',
                },
              ].map((principle, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <div className="p-6 rounded-xl border-2 border-gray-700 glass-effect">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-trinity-red flex-shrink-0">{principle.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-heading font-semibold text-white mb-2">
                          {principle.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-8 text-center">
                Why We Do This
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee exists because we believe the internet should include everyone.
                </p>
                <p>
                  Too many people — especially those with cognitive challenges, mental health needs, or limited tech experience — are excluded from digital spaces because websites are too complicated, too confusing, or too expensive to access.
                </p>
                <p className="text-xl text-white font-semibold">
                  We're working to change that.
                </p>
                <p>We build:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Accessible platforms for mental health and support organizations</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Simple admin tools for people who aren't tech-savvy</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Affordable solutions for nonprofits with limited budgets</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Long-term partnerships that don't end after launch</span>
                  </li>
                </ul>
                <p className="text-xl text-white font-semibold pt-4">
                  We're not just building websites.
                </p>
                <p className="text-2xl text-trinity-red font-bold">
                  We're building access. We're building dignity. We're building community.
                </p>
                <p className="text-lg text-gray-300 pt-4">
                  And we're working to prove that technology, when designed with empathy, can lift people up instead of leaving them behind.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-trinity-red relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-6">
                Let's Build Something Meaningful Together
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
                Whether you're a nonprofit, support group, community organization, or small team trying to make a difference — we'd love to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-trinity-red rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold text-lg shadow-lg transform hover:-translate-y-1"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/philosophy"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:border-white hover:bg-white/10 transition-all duration-200 font-semibold text-lg"
                >
                  Read Our Philosophy
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
