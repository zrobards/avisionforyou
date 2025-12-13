'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, ArrowRight, Package, DollarSign, Calendar, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import { formatPrice } from '@/lib/qwiz/pricing';
import { getPackage } from '@/lib/qwiz/packages';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const redirectTo = searchParams.get('redirectTo') || '/client';

  useEffect(() => {
    const qid = searchParams.get('qid');
    if (qid) {
      // Fetch the submitted lead data
      fetch(`/api/leads/get?qid=${qid}`)
        .then(res => res.json())
        .then(data => {
          setLeadData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching lead:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleViewDashboard = () => {
    router.push(redirectTo);
  };

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/60">Loading your receipt...</div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center p-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-6"
            >
              <CheckCircle2 className="w-20 h-20 text-green-400" />
            </motion.div>

            <h1 className="text-5xl font-bold text-white mb-4">
              Quote Submitted Successfully!
            </h1>

            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Thank you for choosing SeeZee! Your project quote has been received and our team will review it shortly.
            </p>
          </div>

          {/* Receipt Card */}
          {leadData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6"
            >
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Quote Receipt</h2>
                  <p className="text-white/50 text-sm">Reference ID: {leadData.lead?.id || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-sm mb-1">Submitted</div>
                  <div className="text-white font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              {/* Package Info */}
              {leadData.questionnaire?.data?.package && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                    <Package className="w-4 h-4" />
                    <span className="font-semibold">Selected Package</span>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getPackage(leadData.questionnaire.data.package).icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {getPackage(leadData.questionnaire.data.package).title}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {getPackage(leadData.questionnaire.data.package).description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Summary */}
              {leadData.questionnaire?.data?.totals && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">Pricing Summary</span>
                  </div>
                  <div className="bg-black/20 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Base Package</span>
                      <span className="text-white font-semibold">
                        {formatPrice(leadData.questionnaire.data.totals.packageBase)}
                      </span>
                    </div>
                    {leadData.questionnaire.data.totals.addons > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Additional Features</span>
                        <span className="text-purple-400 font-semibold">
                          +{formatPrice(leadData.questionnaire.data.totals.addons)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg text-white font-semibold">Total Project Cost</span>
                        <span className="text-2xl text-blue-400 font-bold">
                          {formatPrice(leadData.questionnaire.data.totals.total)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Monthly Maintenance</span>
                        <span className="text-green-400 font-semibold">
                          {formatPrice(leadData.questionnaire.data.totals.monthly)}/mo
                        </span>
                      </div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Deposit to Start</span>
                        <span className="text-xl text-green-400 font-bold">
                          {formatPrice(leadData.questionnaire.data.totals.deposit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {leadData.questionnaire?.data?.contact && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                    <FileText className="w-4 h-4" />
                    <span className="font-semibold">Contact Information</span>
                  </div>
                  <div className="bg-black/20 rounded-xl p-5 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/50 text-xs mb-1">Name</div>
                      <div className="text-white font-medium">{leadData.questionnaire.data.contact.name}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-xs mb-1">Email</div>
                      <div className="text-white font-medium">{leadData.questionnaire.data.contact.email}</div>
                    </div>
                    {leadData.questionnaire.data.contact.phone && (
                      <div>
                        <div className="text-white/50 text-xs mb-1">Phone</div>
                        <div className="text-white font-medium">{leadData.questionnaire.data.contact.phone}</div>
                      </div>
                    )}
                    {leadData.questionnaire.data.contact.company && (
                      <div>
                        <div className="text-white/50 text-xs mb-1">Company</div>
                        <div className="text-white font-medium">{leadData.questionnaire.data.contact.company}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Email Notification */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5 mb-8"
          >
            <div className="flex items-center gap-3 text-cyan-400 mb-2">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Confirmation Email Sent</span>
            </div>
            <p className="text-white/60 text-sm mb-3">
              A copy of this receipt has been sent to your email. Our team will review your project and respond within 24 hours.
            </p>
            <p className="text-cyan-300 text-sm font-medium">
              💡 <strong>Tip:</strong> Log in with the email you used to submit this form to view your project request in the client dashboard.
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              What Happens Next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-4">
                <div className="text-blue-400 font-bold mb-2">1. Review</div>
                <div className="text-sm text-white/60">
                  Our team reviews your requirements and prepares a detailed proposal
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-4">
                <div className="text-purple-400 font-bold mb-2">2. Consultation</div>
                <div className="text-sm text-white/60">
                  We'll schedule a call to discuss your vision and answer questions
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4">
                <div className="text-green-400 font-bold mb-2">3. Launch</div>
                <div className="text-sm text-white/60">
                  Approve the quote and we'll begin bringing your project to life
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={`/login?returnUrl=${encodeURIComponent(redirectTo)}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-500/30"
            >
              Log In to View Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition-all"
            >
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
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
