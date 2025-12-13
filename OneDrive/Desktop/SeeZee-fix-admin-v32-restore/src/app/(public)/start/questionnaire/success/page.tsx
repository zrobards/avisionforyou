'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Mail, ArrowRight, PartyPopper, Sparkles, Rocket, Star, Zap } from 'lucide-react';
import PageShell from '@/components/PageShell';
import FloatingShapes from '@/components/shared/FloatingShapes';
import QuestionnaireReceipt from '@/components/questionnaire/QuestionnaireReceipt';
import { useSession } from 'next-auth/react';

// Confetti component
function Confetti() {
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  const [height, setHeight] = useState(1000);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHeight(window.innerHeight);
    }
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          initial={{
            y: 0,
            x: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: height + 100,
            x: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Floating emoji component
function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  const [width, setWidth] = useState(1000);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
    }
  }, []);
  
  return (
    <motion.div
      className="absolute text-4xl"
      initial={{
        y: 100,
        x: Math.random() * width,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        y: -100,
        x: Math.random() * width,
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0.8],
      }}
      transition={{
        duration: 3,
        delay,
        ease: 'easeOut',
      }}
    >
      {emoji}
    </motion.div>
  );
}

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [showConfetti, setShowConfetti] = useState(true);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  useEffect(() => {
    const leadIdParam = searchParams.get('leadId');
    if (leadIdParam) {
      setLeadId(leadIdParam);
    }

    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Fetch receipt data when leadId is available
  useEffect(() => {
    const fetchReceiptData = async () => {
      if (!leadId) return;

      setLoadingReceipt(true);
      setReceiptError(null);

      try {
        const response = await fetch(`/api/leads/${leadId}${session?.user?.email ? `?email=${encodeURIComponent(session.user.email)}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch receipt data');
        }

        const data = await response.json();
        const lead = data.lead;

        // Extract receipt data from lead
        const metadata = lead.metadata || {};
        const receiptData = {
          package: metadata.package || lead.serviceType?.toLowerCase() || 'starter',
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || metadata.phone || '',
          company: lead.company || metadata.company || '',
          referralSource: metadata.referralSource || lead.source || '',
          stage: metadata.stage || '',
          outreachProgram: metadata.outreachProgram || '',
          projectType: metadata.projectType || [],
          projectGoals: metadata.projectGoals || '',
          timeline: metadata.timeline || lead.timeline || '',
          specialRequirements: metadata.specialRequirements || '',
          submittedAt: lead.createdAt || new Date().toISOString(),
          leadId: lead.id,
        };

        setReceiptData(receiptData);
      } catch (error: any) {
        console.error('Failed to fetch receipt data:', error);
        setReceiptError(error.message || 'Failed to load receipt');
      } finally {
        setLoadingReceipt(false);
      }
    };

    fetchReceiptData();
  }, [leadId, session?.user?.email]);

  const emojis = ['🎉', '🚀', '✨', '🎊', '💫', '⭐', '🔥', '💎', '🌟', '🎈'];

  return (
    <PageShell>
      <div className="relative overflow-hidden animated-gradient min-h-screen">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        
        {/* Confetti */}
        {showConfetti && <Confetti />}
        
        {/* Floating Emojis */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
          {emojis.map((emoji, i) => (
            <FloatingEmoji key={i} emoji={emoji} delay={i * 0.2} />
          ))}
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="max-w-4xl w-full"
          >
            {/* Success Header with Animation */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2, 
                  type: 'spring', 
                  stiffness: 200,
                  damping: 10
                }}
                className="inline-block mb-8 relative"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute inset-0 bg-green-400/30 blur-3xl rounded-full"
                  />
                  <CheckCircle2 className="w-32 h-32 text-green-400 relative z-10" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="absolute -top-4 -right-4"
                >
                  <PartyPopper className="w-16 h-16 text-yellow-400" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -bottom-4 -left-4"
                >
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-7xl font-heading font-bold mb-6"
              >
                <motion.span
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  Oh YeahhH!!
                </motion.span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                <Rocket className="w-8 h-8 text-blue-400 animate-bounce" />
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Request Submitted Successfully!
                </h2>
                <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
              >
                That's exciting! 🎉 An admin will review your elite package request and get back to you within 24 hours.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 text-lg text-white/70"
              >
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>You will receive an invoice via email once your project is approved.</span>
              </motion.div>
            </div>

            {/* Celebration Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {[
                { icon: Zap, text: 'Fast Response', color: 'from-yellow-500 to-orange-500' },
                { icon: Rocket, text: 'Quick Start', color: 'from-blue-500 to-cyan-500' },
                { icon: Star, text: 'Premium Service', color: 'from-purple-500 to-pink-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass-container rounded-xl p-6 border-2 border-white/10 hover:border-white/30 transition-all"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 mx-auto`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-center text-white font-semibold">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/client')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-xl text-white font-bold text-lg transition-all shadow-lg shadow-purple-500/30 transform hover:-translate-y-1"
              >
                <Sparkles className="w-5 h-5" />
                View in Client Dashboard
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/start')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 rounded-xl text-white font-semibold transition-all"
              >
                Start Another Project
              </motion.button>
            </motion.div>

            {/* Fun Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12 text-center"
            >
              <p className="text-white/60 text-lg">
                🎊 You're all set! Get ready for an amazing experience! 🎊
              </p>
            </motion.div>

            {/* Receipt Section */}
            {loadingReceipt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="mt-12 text-center"
              >
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-trinity-red"></div>
                <p className="text-white/60 mt-4">Loading your receipt...</p>
              </motion.div>
            )}

            {receiptError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="mt-12"
              >
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                  {receiptError}
                </div>
              </motion.div>
            )}

            {receiptData && !loadingReceipt && !receiptError && (
              <div className="mt-12">
                <QuestionnaireReceipt data={receiptData} />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/60">Loading...</div>
        </div>
      </PageShell>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

