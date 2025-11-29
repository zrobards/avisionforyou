"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface WelcomeScreenProps {
  userName?: string;
}

export default function WelcomeScreen({ userName }: WelcomeScreenProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-800 bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-4xl"
        >
          👋
        </motion.div>
        
        <h1 className="mb-4 font-heading text-4xl font-bold text-white">
          Welcome{userName ? `, ${userName}` : ''}!
        </h1>
        
        <p className="mx-auto mb-8 max-w-lg text-lg text-gray-300">
          You're all set! Ready to bring your vision to life? Let's start building your project.
        </p>
        
        <Link
          href="/start"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/25"
        >
          <span className="text-xl">🚀</span>
          Start Your Project
        </Link>
      </motion.div>
      
      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-gray-800 bg-gray-900/50 p-8"
      >
        <h2 className="mb-6 font-heading text-2xl font-bold text-white">
          How It Works
        </h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
              📝
            </div>
            <h3 className="mb-2 font-semibold text-white">
              1. Tell Us Your Vision
            </h3>
            <p className="text-sm text-gray-400">
              Complete a brief questionnaire about your project goals and requirements.
            </p>
          </div>
          
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
              💻
            </div>
            <h3 className="mb-2 font-semibold text-white">
              2. We Build It
            </h3>
            <p className="text-sm text-gray-400">
              Our team brings your project to life while keeping you updated every step of the way.
            </p>
          </div>
          
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-2xl">
              🚀
            </div>
            <h3 className="mb-2 font-semibold text-white">
              3. Launch & Grow
            </h3>
            <p className="text-sm text-gray-400">
              Your project goes live, and we continue supporting you with maintenance and updates.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center"
      >
        <p className="mb-4 text-gray-400">
          Have questions before you start?
        </p>
        <Link
          href="/client/support"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-6 py-3 font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800"
        >
          💬 Contact Support
        </Link>
      </motion.div>
    </div>
  );
}

