'use client';

import { motion } from 'framer-motion';
import { Mail, User, Phone, Building2, Globe, Zap } from 'lucide-react';
import { useQwizStore } from '@/lib/qwiz/store';

export function ContactForm() {
  const { contact, setContact } = useQwizStore();

  const updateContact = (field: string, value: any) => {
    setContact({ ...contact, [field]: value } as any);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Let's get in touch
        </h2>
        <p className="text-white/60">We'll send your quote to this email</p>
      </div>

      {/* Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={contact?.name || ''}
          onChange={(e) => updateContact('name', e.target.value)}
          placeholder="Your name *"
          required
          className="w-full pl-11 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-base sm:text-sm"
        />
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-white/40" />
        <input
          type="email"
          value={contact?.email || ''}
          onChange={(e) => updateContact('email', e.target.value)}
          placeholder="Email address *"
          required
          className="w-full pl-11 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-base sm:text-sm"
        />
      </motion.div>

      {/* Phone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-white/40" />
        <input
          type="tel"
          value={contact?.phone || ''}
          onChange={(e) => updateContact('phone', e.target.value)}
          placeholder="Phone number (optional)"
          className="w-full pl-11 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-base sm:text-sm"
        />
      </motion.div>

      {/* Company */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={contact?.company || ''}
          onChange={(e) => updateContact('company', e.target.value)}
          placeholder="Company name (optional)"
          className="w-full pl-11 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-base sm:text-sm"
        />
      </motion.div>

      {/* Website */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative"
      >
        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="url"
          value={contact?.website || ''}
          onChange={(e) => updateContact('website', e.target.value)}
          placeholder="Current website (optional)"
          className="w-full pl-11 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-base sm:text-sm"
        />
      </motion.div>

      {/* Rush delivery toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={contact?.rush || false}
            onChange={(e) => updateContact('rush', e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-yellow-500/50 bg-yellow-500/10 text-yellow-500 focus:ring-yellow-500/50"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-1">
              <Zap className="w-4 h-4" />
              Rush Delivery (15% fee)
            </div>
            <div className="text-sm text-white/60">
              Need your project completed in under 3 weeks? We'll prioritize your project.
            </div>
          </div>
        </label>
      </motion.div>
    </div>
  );
}
