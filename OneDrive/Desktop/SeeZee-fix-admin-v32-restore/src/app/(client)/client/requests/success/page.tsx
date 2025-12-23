'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, FileText, Clock, Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function ChangeRequestSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setRequestId(id);
    }
  }, [searchParams]);

  const copyRequestId = async () => {
    if (requestId) {
      try {
        await navigator.clipboard.writeText(requestId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Success Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <CheckCircle2 className="w-20 h-20 text-green-400" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ delay: 0.4 }}
                className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"
              />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Change Request Submitted!
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Your change request has been received and will be reviewed by our team.
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <FileText className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-2">Request ID</p>
              {requestId ? (
                <div className="flex items-center justify-center gap-2">
                  <p className="text-white font-mono text-sm break-all">
                    {requestId.length > 12 ? requestId.slice(0, 12) + '...' : requestId}
                  </p>
                  <button
                    onClick={copyRequestId}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Copy Request ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Processing...</p>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-1">Response Time</p>
              <p className="text-white font-medium">24-48 hours</p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
            <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              What happens next?
            </h3>
            <ul className="text-left space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Our team will review your request within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>You'll receive an email notification when it's approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Work will begin once approved and scheduled</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/client/requests"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all"
            >
              View All Requests
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/client"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

