"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Section } from "@/components/ui/section";
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from "react-icons/fi";
import { motion } from "framer-motion";

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
      <div className="w-full min-h-screen bg-[#0f172a] py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-xl text-center bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-[#dc2626]/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-8 h-8 text-[#dc2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-3xl font-heading font-bold mb-3 text-white">Message Sent!</h3>
            <p className="text-gray-400 mb-8 text-lg">We'll get back to you within 24 hours.</p>
            <button
              onClick={() => setStatus('idle')}
              className="px-8 py-3 bg-[#dc2626] text-white rounded-lg font-semibold hover:bg-[#b91c1c] transition-colors duration-200"
            >
              Send Another Message
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0f172a] py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-heading font-bold text-white mb-4 leading-tight">
            Get In Touch
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Reach out and let's start building something amazing together.
          </p>
        </motion.div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-[#dc2626]/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-[#dc2626]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-6 h-6 text-[#dc2626]" />
            </div>
            <h3 className="font-semibold text-white mb-2">Email</h3>
            <a
              href="mailto:seezee.enterprises@gmail.com"
              className="text-sm text-gray-400 hover:text-[#dc2626] transition-colors"
            >
              seezee.enterprises@gmail.com
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-[#dc2626]/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-[#dc2626]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhone className="w-6 h-6 text-[#dc2626]" />
            </div>
            <h3 className="font-semibold text-white mb-2">Phone</h3>
            <a
              href="tel:+15024352986"
              className="text-sm text-gray-400 hover:text-[#dc2626] transition-colors"
            >
              (502) 435-2986
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-[#dc2626]/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-[#dc2626]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-6 h-6 text-[#dc2626]" />
            </div>
            <h3 className="font-semibold text-white mb-2">Location</h3>
            <p className="text-sm text-gray-400">Louisville, KY</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-[#dc2626]/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-[#dc2626]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-6 h-6 text-[#dc2626]" />
            </div>
            <h3 className="font-semibold text-white mb-2">Response Time</h3>
            <p className="text-sm text-gray-400">Within 24 hours</p>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto max-w-2xl bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <label htmlFor="name" className="block">
              <span className="block text-sm font-medium text-white mb-2">
                Full Name <span className="text-[#dc2626]">*</span>
              </span>
              <input
                id="name"
                type="text"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 transition-all"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </label>

            {/* Email */}
            <label htmlFor="email" className="block">
              <span className="block text-sm font-medium text-white mb-2">
                Email Address <span className="text-[#dc2626]">*</span>
              </span>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 transition-all"
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </label>
          </div>

          {/* Inquiry Type */}
          <label htmlFor="inquiryType" className="mt-6 block">
            <span className="block text-sm font-medium text-white mb-2">
              Inquiry Type
            </span>
            <select
              id="inquiryType"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 transition-all"
              value={state.inquiryType}
              onChange={(e) => setState({ ...state, inquiryType: e.target.value })}
            >
              <option value="" className="bg-[#1a2332]">Select an inquiry type...</option>
              {INQUIRY_TYPES.map((type) => (
                <option key={type.value} value={type.value} className="bg-[#1a2332]">
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          {/* Message */}
          <label htmlFor="message" className="mt-6 block">
            <span className="block text-sm font-medium text-white mb-2">
              Message <span className="text-[#dc2626]">*</span>
            </span>
            <textarea
              id="message"
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 resize-none transition-all"
              value={state.message}
              onChange={(e) => setState({ ...state, message: e.target.value })}
              required
              placeholder="Tell us how we can help you..."
            />
          </label>

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-[#dc2626]/20 border border-[#dc2626]/50 rounded-xl text-red-200 text-sm"
            >
              {errorMessage}
            </motion.div>
          )}

          <button
            className="mt-8 w-full rounded-xl bg-[#dc2626] text-white px-6 py-4 font-semibold text-lg hover:bg-[#b91c1c] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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

          <p className="mt-6 text-center text-sm text-gray-500">
            We typically respond within 24 hours
          </p>
        </motion.form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-[#0f172a] py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center">
            <div className="animate-pulse text-white">Loading contact form...</div>
          </div>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}
