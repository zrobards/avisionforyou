'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdmissionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', program: '', message: '' });
      } else {
        setError('Failed to submit. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your admission inquiry has been received. Our team will contact you shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Start Your Journey to Recovery</h1>
          <p className="text-xl text-indigo-100">
            Take the first step. We're here to support you every step of the way.
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
            <Phone className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
            <p className="text-gray-600">(502) 749-6344</p>
            <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
            <Mail className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
            <p className="text-gray-600">info@avisionforyourecovery.org</p>
            <p className="text-sm text-gray-500 mt-2">Quick response</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
            <MapPin className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
            <p className="text-gray-600">1675 Story Ave</p>
            <p className="text-sm text-gray-500">Louisville, KY 40206</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
            <Clock className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Hours</h3>
            <p className="text-gray-600">Mon-Fri: 8am-6pm</p>
            <p className="text-sm text-gray-500">Sat: 9am-2pm · Sun: Closed</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12">
          {/* Left Column - Process & What to Expect */}
          <div className="lg:col-span-2">
            {/* Admission Process */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Admission Process</h2>
              <div className="space-y-6">
                {[
                  {
                    num: 1,
                    title: 'Initial Contact',
                    desc: 'Reach out to us via phone, email, or this form. We\'ll listen to your story.',
                  },
                  {
                    num: 2,
                    title: 'Assessment',
                    desc: 'Complete our comprehensive assessment to understand your needs and goals.',
                  },
                  {
                    num: 3,
                    title: 'Program Matching',
                    desc: 'We match you with the perfect recovery program tailored to your journey.',
                  },
                  {
                    num: 4,
                    title: 'Getting Started',
                    desc: 'Begin your recovery journey with our supportive community and expert guidance.',
                  },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-white font-bold text-lg">
                        {step.num}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What to Expect */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">What to Expect</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Personalized recovery programs',
                  'Expert counselors and mentors',
                  'Supportive community environment',
                  'Flexible meeting schedules',
                  '24/7 crisis support',
                  'Family involvement options',
                  'Holistic wellness approach',
                  'Career and education support',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-1">
            <div className="static lg:sticky lg:top-24 bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Start Now</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="admission-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="admission-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="admission-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="admission-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="admission-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    id="admission-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="(502) 749-6344"
                  />
                </div>

                <div>
                  <label htmlFor="admission-program" className="block text-sm font-semibold text-gray-700 mb-2">
                    Interested Program
                  </label>
                  <select
                    id="admission-program"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a program</option>
                    <option value="surrender-program">Surrender Program</option>
                    <option value="mindbodysoul-iop">MindBodySoul IOP</option>
                    <option value="housing-shelter">Housing & Shelter</option>
                    <option value="meetings-groups">Meetings & Groups</option>
                    <option value="food-nutrition">Food & Nutrition</option>
                    <option value="career-reentry">Career Reentry</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admission-message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="admission-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Tell us about your situation..."
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We respect your privacy. Your information is secure.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Crisis Section */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-red-900 mb-2">In Crisis?</h3>
          <p className="text-red-700 mb-3">
            If you're in immediate danger or having thoughts of suicide, please call 911 or the National Suicide Prevention Lifeline:
          </p>
          <p className="text-2xl font-bold text-red-600">988</p>
        </div>
      </div>
    </div>
  );
}
