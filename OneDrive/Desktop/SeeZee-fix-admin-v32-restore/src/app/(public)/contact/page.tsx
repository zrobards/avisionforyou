"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Section } from "@/components/ui/section";
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from "react-icons/fi";

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const INQUIRY_TYPES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Support Request' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'media', label: 'Media & Press' },
  { value: 'other', label: 'Other' },
];

function ContactForm() {
  const searchParams = useSearchParams();
  const inquiryParam = searchParams.get('inquiry');

  const [state, setState] = useState({ 
    name: "", 
    email: "", 
    message: "",
    inquiryType: inquiryParam || "",
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name,
          email: state.email,
          message: state.inquiryType 
            ? `Inquiry Type: ${INQUIRY_TYPES.find(t => t.value === state.inquiryType)?.label || state.inquiryType}\n\n${state.message}`
            : state.message,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setState({ name: "", email: "", message: "", inquiryType: inquiryParam || "" });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Something went wrong');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Failed to send message. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <Section title="Contact" subtitle="We're here to help.">
        <div className="mx-auto max-w-xl text-center seezee-glass rounded-2xl p-12 border border-white/10">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold mb-2 text-white">Message Sent!</h3>
          <p className="text-gray-400 mb-6">We'll get back to you within 24 hours.</p>
          <button
            onClick={() => setStatus('idle')}
            className="px-6 py-2 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-300 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Contact Us" subtitle="Get in touch with our team. We'd love to hear from you.">
      <div className="mx-auto max-w-6xl">
        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="seezee-glass rounded-xl border border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Email</h3>
            <p className="text-sm text-gray-400">hello@seezee.com</p>
          </div>

          <div className="seezee-glass rounded-xl border border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhone className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Phone</h3>
            <p className="text-sm text-gray-400">Available on request</p>
          </div>

          <div className="seezee-glass rounded-xl border border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Location</h3>
            <p className="text-sm text-gray-400">Remote First</p>
          </div>

          <div className="seezee-glass rounded-xl border border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Response Time</h3>
            <p className="text-sm text-gray-400">Within 24 hours</p>
          </div>
        </div>

        {/* Contact Form */}
        <form
          className="mx-auto max-w-2xl rounded-2xl border border-white/10 seezee-glass p-8 backdrop-blur"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <label htmlFor="name" className="block text-sm text-gray-300">
              Full Name *
              <input
                id="name"
                type="text"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </label>

            {/* Email */}
            <label htmlFor="email" className="block text-sm text-gray-300">
              Email Address *
              <input
                id="email"
                type="email"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </label>
          </div>

          {/* Inquiry Type */}
          <label htmlFor="inquiryType" className="mt-6 block text-sm text-gray-300">
            Inquiry Type
            <select
              id="inquiryType"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
              value={state.inquiryType}
              onChange={(e) => setState({ ...state, inquiryType: e.target.value })}
            >
              <option value="">Select an inquiry type...</option>
              {INQUIRY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          {/* Message */}
          <label htmlFor="message" className="mt-6 block text-sm text-gray-300">
            Message *
            <textarea
              id="message"
              rows={6}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none transition-all"
              value={state.message}
              onChange={(e) => setState({ ...state, message: e.target.value })}
              required
              placeholder="Tell us how we can help you..."
            />
          </label>

          {status === 'error' && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-4 font-semibold text-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            type="submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <FiSend className="w-5 h-5" />
                Send Message
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            We typically respond within 24 hours
          </p>
        </form>
      </div>
    </Section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Section title="Contact Us" subtitle="Loading..."><div className="mx-auto max-w-2xl text-center">Loading contact form...</div></Section>}>
      <ContactForm />
    </Suspense>
  );
}
