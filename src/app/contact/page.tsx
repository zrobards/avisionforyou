'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, Loader, Users, Heart, Newspaper, Briefcase } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-full mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              We're here to answer your questions and connect you with the resources you need
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Phone */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 border-t-4 border-brand-purple">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Call Us</h3>
                  <p className="text-sm text-gray-600">24/7 Crisis Line Available</p>
                </div>
              </div>
              <a href="tel:+15027496344" className="text-2xl font-bold text-brand-purple hover:text-purple-700 block">
                (502) 749-6344
              </a>
              <p className="text-sm text-gray-600 mt-2">
                Main office hours apply for non-emergency calls
              </p>
            </div>

            {/* Email */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-t-4 border-brand-green">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email Us</h3>
                  <p className="text-sm text-gray-600">We respond within 24 hours</p>
                </div>
              </div>
              <a href="mailto:info@avisionforyourecovery.org" className="text-brand-green hover:text-green-700 font-semibold block break-all">
                info@avisionforyourecovery.org
              </a>
            </div>

            {/* Address */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 border-t-4 border-brand-purple">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Visit Us</h3>
                  <p className="text-sm text-gray-600">Main Office Location</p>
                </div>
              </div>
              <address className="not-italic text-gray-700">
                <strong>A Vision For You Recovery</strong><br />
                1675 Story Ave<br />
                Louisville, KY 40206
              </address>
              <a 
                href="https://maps.google.com/?q=1675+Story+Ave+Louisville+KY+40206" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-purple hover:text-purple-700 text-sm font-semibold mt-3 inline-block"
              >
                Get Directions →
              </a>
            </div>

            {/* Office Hours */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-t-4 border-brand-green">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Office Hours</h3>
                  <p className="text-sm text-gray-600">Administrative Office</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-semibold">Monday - Friday:</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Saturday:</span>
                  <span>9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sunday:</span>
                  <span>Closed</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                  <strong>Crisis Support:</strong> Call our 24/7 hotline for immediate assistance
                </p>
              </div>
            </div>

            {/* Specific Contacts */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-brand-purple">
              <h3 className="font-bold text-gray-900 mb-4">Department Contacts</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Program Admissions:</p>
                  <a href="mailto:admissions@avisionforyourecovery.org" className="text-brand-purple hover:text-purple-700">
                    admissions@avisionforyourecovery.org
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Donations:</p>
                  <a href="mailto:giving@avisionforyourecovery.org" className="text-brand-green hover:text-green-700">
                    giving@avisionforyourecovery.org
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Media Inquiries:</p>
                  <a href="mailto:press@avisionforyourecovery.org" className="text-brand-purple hover:text-purple-700">
                    press@avisionforyourecovery.org
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-brand-purple">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              
              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-semibold">Message sent successfully!</p>
                    <p className="text-sm text-green-700 mt-1">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-semibold">Failed to send message</p>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                      placeholder="(502) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                    >
                      {departments.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-8 py-4 bg-gradient-to-r from-brand-purple to-purple-700 text-white font-bold rounded-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to our privacy policy. We'll never share your information with third parties.
                </p>
              </form>
            </div>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Need Immediate Help?', link: '/admission', linkText: 'Start Application', color: 'purple' },
                { title: 'Join a Meeting', link: '/meetings', linkText: 'View Schedule', color: 'green' },
                { title: 'Support Our Mission', link: '/donate', linkText: 'Make a Donation', color: 'purple' }
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  className={`bg-gradient-to-br ${item.color === 'purple' ? 'from-purple-50 to-white border-brand-purple' : 'from-green-50 to-white border-brand-green'} border-t-4 rounded-xl p-6 hover:shadow-lg transition text-center`}
                >
                  <p className="text-sm font-semibold text-gray-600 mb-2">{item.title}</p>
                  <p className={`font-bold ${item.color === 'purple' ? 'text-brand-purple' : 'text-brand-green'}`}>
                    {item.linkText} →
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-300 rounded-xl h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <p className="font-semibold">Interactive Map</p>
              <p className="text-sm">1675 Story Ave, Louisville, KY 40206</p>
              <a 
                href="https://maps.google.com/?q=1675+Story+Ave+Louisville+KY+40206"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
