'use client'

import { useState } from 'react'
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, Loader,
  Users, Heart, Newspaper, Briefcase, Building2, HandHeart, Eye, CalendarCheck
} from 'lucide-react'
import AnimateOnScroll from '@/components/shared/AnimateOnScroll'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'general',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', phone: '', department: 'general', subject: '', message: '' })
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setErrorMessage('Failed to send message. Please try again or contact us directly.')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  const departments = [
    { value: 'general', label: 'General Inquiry', icon: Mail },
    { value: 'programs', label: 'Program Information', icon: Users },
    { value: 'donate', label: 'Donations & Giving', icon: Heart },
    { value: 'volunteer', label: 'Volunteer Opportunities', icon: Users },
    { value: 'press', label: 'Media & Press', icon: Newspaper },
    { value: 'careers', label: 'Career Opportunities', icon: Briefcase }
  ]

  const scrollToForm = (dept: string) => {
    setFormData(prev => ({ ...prev, department: dept }))
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Section */}
      <section className="relative bg-brand-dark overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7f3d8b]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#b6e41f]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <AnimateOnScroll variant="fadeUp">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#b6e41f]/20 border border-[#b6e41f]/30 rounded-full mb-6">
                <Mail className="w-8 h-8 text-[#b6e41f]" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                We're here to answer your questions and connect you with the resources you need.
                Every conversation starts a path toward healing.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Phone */}
            <AnimateOnScroll variant="fadeLeft" delay={0}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#7f3d8b]/30 border border-[#7f3d8b]/40 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#b6e41f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Call Us</h3>
                    <p className="text-sm text-slate-400">24/7 Crisis Line Available</p>
                  </div>
                </div>
                <a href="tel:+15027496344" className="text-2xl font-bold text-[#b6e41f] hover:text-[#c9f24d] block transition">
                  (502) 749-6344
                </a>
                <p className="text-sm text-slate-400 mt-2">
                  Main office hours apply for non-emergency calls
                </p>
              </div>
            </AnimateOnScroll>

            {/* Email */}
            <AnimateOnScroll variant="fadeLeft" delay={0.1}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#b6e41f]/20 border border-[#b6e41f]/30 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-[#b6e41f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Email Us</h3>
                    <p className="text-sm text-slate-400">We respond within 24 hours</p>
                  </div>
                </div>
                <a href="mailto:info@avisionforyourecovery.org" className="text-[#b6e41f] hover:text-[#c9f24d] font-semibold block break-all transition">
                  info@avisionforyourecovery.org
                </a>
              </div>
            </AnimateOnScroll>

            {/* Address */}
            <AnimateOnScroll variant="fadeLeft" delay={0.2}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#7f3d8b]/30 border border-[#7f3d8b]/40 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#b6e41f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Visit Us</h3>
                    <p className="text-sm text-slate-400">Main Office Location</p>
                  </div>
                </div>
                <address className="not-italic text-slate-300">
                  <strong className="text-white">A Vision For You</strong><br />
                  1675 Story Ave<br />
                  Louisville, KY 40206
                </address>
                <a
                  href="https://maps.google.com/?q=1675+Story+Ave+Louisville+KY+40206"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#b6e41f] hover:text-[#c9f24d] text-sm font-semibold mt-3 inline-block transition"
                >
                  Get Directions &rarr;
                </a>
              </div>
            </AnimateOnScroll>

            {/* Office Hours */}
            <AnimateOnScroll variant="fadeLeft" delay={0.3}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#b6e41f]/20 border border-[#b6e41f]/30 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#b6e41f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Office Hours</h3>
                    <p className="text-sm text-slate-400">Administrative Office</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Monday - Friday:</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Saturday:</span>
                    <span>9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-white/10">
                    <strong className="text-slate-400">Crisis Support:</strong> Call our 24/7 hotline for immediate assistance
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Department Contacts */}
            <AnimateOnScroll variant="fadeLeft" delay={0.4}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition">
                <h3 className="font-bold text-white mb-4">Department Contacts</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-300">Program Admissions:</p>
                    <a href="mailto:admissions@avisionforyourecovery.org" className="text-[#b6e41f] hover:text-[#c9f24d] transition">
                      admissions@avisionforyourecovery.org
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-300">Donations:</p>
                    <a href="mailto:giving@avisionforyourecovery.org" className="text-[#b6e41f] hover:text-[#c9f24d] transition">
                      giving@avisionforyourecovery.org
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-300">Media Inquiries:</p>
                    <a href="mailto:press@avisionforyourecovery.org" className="text-[#b6e41f] hover:text-[#c9f24d] transition">
                      press@avisionforyourecovery.org
                    </a>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2">
            <AnimateOnScroll variant="fadeUp">
              <div id="contact-form" className="bg-brand-dark-lighter border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8">
                <h2 className="text-3xl font-bold text-white mb-6">Send Us a Message</h2>

                <div aria-live="polite" role="status">
                  {status === 'success' && (
                    <div className="mb-6 p-4 bg-[#b6e41f]/10 border-2 border-[#b6e41f]/30 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-[#b6e41f] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#b6e41f] font-semibold">Message sent successfully!</p>
                        <p className="text-sm text-slate-300 mt-1">We'll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg flex items-start gap-3" role="alert">
                      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-semibold">Failed to send message</p>
                        <p className="text-sm text-red-300 mt-1">{errorMessage}</p>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-300 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent transition"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-300 mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent transition"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent transition"
                        placeholder="(502) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-department" className="block text-sm font-semibold text-slate-300 mb-2">
                        Department <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="contact-department"
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent transition"
                      >
                        {departments.map(dept => (
                          <option key={dept.value} value={dept.value} className="bg-brand-dark-lighter text-white">{dept.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-300 mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent transition"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-300 mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#b6e41f] focus:border-transparent transition resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-8 py-4 bg-[#b6e41f] text-slate-950 font-bold rounded-lg hover:bg-[#c9f24d] hover:shadow-lg hover:shadow-[#b6e41f]/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    By submitting this form, you agree to our privacy policy. We'll never share your information with third parties.
                  </p>
                </form>
              </div>
            </AnimateOnScroll>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Need Immediate Help?', link: '/admission', linkText: 'Start Application', accent: 'purple' },
                { title: 'Join a Meeting', link: '/meetings', linkText: 'View Schedule', accent: 'green' },
                { title: 'Support Our Mission', link: '/donate', linkText: 'Make a Donation', accent: 'purple' }
              ].map((item, idx) => (
                <AnimateOnScroll key={idx} variant="fadeUp" delay={idx * 0.1}>
                  <a
                    href={item.link}
                    className="block bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition text-center group"
                  >
                    <p className="text-sm font-semibold text-slate-400 mb-2">{item.title}</p>
                    <p className={`font-bold ${item.accent === 'green' ? 'text-[#b6e41f]' : 'text-[#c9a0d0]'} group-hover:translate-x-1 transition-transform inline-block`}>
                      {item.linkText} &rarr;
                    </p>
                  </a>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grant Funders & Institutional Giving */}
      <section className="bg-brand-dark-lighter py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variant="fadeUp">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ways to Connect</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Whether you are a grant funder, corporate partner, volunteer, or community member, there is a place for you at A Vision For You.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Grant Funders */}
            <AnimateOnScroll variant="fadeUp" delay={0}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition h-full">
                <div className="w-14 h-14 bg-[#7f3d8b]/30 border border-[#7f3d8b]/40 rounded-xl flex items-center justify-center mb-6">
                  <Building2 className="w-7 h-7 text-[#b6e41f]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Institutional Giving & Grants</h3>
                <p className="text-slate-400 mb-6">
                  For grant applications, institutional partnerships, and major gift inquiries, our development team is ready to collaborate.
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:giving@avisionforyourecovery.org"
                    className="flex items-center gap-3 text-[#b6e41f] hover:text-[#c9f24d] font-semibold transition"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    giving@avisionforyourecovery.org
                  </a>
                  <a
                    href="tel:+15027496344"
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition"
                  >
                    <Phone className="w-5 h-5 flex-shrink-0" />
                    (502) 749-6344
                  </a>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Corporate Sponsors */}
            <AnimateOnScroll variant="fadeUp" delay={0.1}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition h-full">
                <div className="w-14 h-14 bg-[#b6e41f]/20 border border-[#b6e41f]/30 rounded-xl flex items-center justify-center mb-6">
                  <HandHeart className="w-7 h-7 text-[#b6e41f]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Corporate Partnerships</h3>
                <p className="text-slate-400 mb-6">
                  Align your brand with recovery and community impact. We offer naming opportunities, event sponsorships, and program partnerships for organizations that share our mission.
                </p>
                <button
                  onClick={() => scrollToForm('donate')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#7f3d8b]/30 border border-[#7f3d8b]/50 text-white rounded-lg hover:bg-[#7f3d8b]/50 transition font-semibold"
                >
                  Contact Us for Sponsorship
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </AnimateOnScroll>

            {/* Volunteer */}
            <AnimateOnScroll variant="fadeUp" delay={0.2}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition h-full">
                <div className="w-14 h-14 bg-[#7f3d8b]/30 border border-[#7f3d8b]/40 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-[#b6e41f]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Volunteer With Us</h3>
                <p className="text-slate-400 mb-6">
                  Join our team of dedicated volunteers making a difference in the lives of those seeking recovery. From meal service to mentorship, there are many ways to get involved.
                </p>
                <button
                  onClick={() => scrollToForm('volunteer')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#b6e41f] text-slate-950 rounded-lg hover:bg-[#c9f24d] transition font-semibold"
                >
                  Sign Up to Volunteer
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </AnimateOnScroll>

            {/* Schedule a Tour */}
            <AnimateOnScroll variant="fadeUp" delay={0.3}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition h-full">
                <div className="w-14 h-14 bg-[#b6e41f]/20 border border-[#b6e41f]/30 rounded-xl flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-[#b6e41f]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Visit Our Facilities</h3>
                <p className="text-slate-400 mb-6">
                  See our recovery residences and programs firsthand. Schedule a tour to experience the supportive community environment we have built.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+15027496344"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#7f3d8b]/30 border border-[#7f3d8b]/50 text-white rounded-lg hover:bg-[#7f3d8b]/50 transition font-semibold"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    Call (502) 749-6344 to Schedule
                  </a>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-brand-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variant="fadeUp">
            <div className="bg-brand-dark-lighter border border-white/10 rounded-xl h-64 sm:h-80 md:h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-[#b6e41f]" />
                <p className="font-semibold text-white text-lg">Interactive Map</p>
                <p className="text-sm text-slate-400 mt-1">1675 Story Ave, Louisville, KY 40206</p>
                <a
                  href="https://maps.google.com/?q=1675+Story+Ave+Louisville+KY+40206"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-6 py-2 bg-[#b6e41f] text-slate-950 font-bold rounded-lg hover:bg-[#c9f24d] transition"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  )
}
