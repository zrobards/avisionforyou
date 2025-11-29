'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageShell from '@/components/PageShell';
import FloatingShapes from '@/components/shared/FloatingShapes';
import { FiZap, FiAlertCircle, FiArrowRight, FiFileText, FiShoppingCart, FiHeart, FiTool, FiCheck } from 'react-icons/fi';
import { fetchJson } from '@/lib/client-api';

function StartPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [checkingRequests, setCheckingRequests] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/start');
      return;
    }

    // Check for active project requests if authenticated
    if (status === 'authenticated' && session?.user) {
      fetchJson<any>('/api/client/requests')
        .then((data) => {
          const requests = data?.requests || [];
          const active = requests.filter((req: any) => {
            const status = String(req.status || '').toUpperCase();
            return ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'].includes(status);
          });
          setActiveRequests(active);
        })
        .catch((err) => {
          console.error('Failed to check active requests:', err);
        })
        .finally(() => {
          setCheckingRequests(false);
        });
    } else {
      setCheckingRequests(false);
    }
  }, [status, session, router]);

  // Show loading state while checking authentication and active requests
  if (status === 'loading' || checkingRequests) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-trinity-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Don't render package selector until authenticated
  if (!session?.user) {
    return null;
  }

  // If user has active project request, show message instead (unless editing)
  if (activeRequests.length > 0 && !editId) {
    return (
      <PageShell>
        <div className="relative overflow-hidden animated-gradient">
          <FloatingShapes />
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
          
          <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-container rounded-2xl overflow-hidden shadow-large p-8 md:p-12 text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                You have an active project request
              </h1>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                You currently have a project request in progress. Please wait for it to be reviewed before submitting a new one.
              </p>
              
              <div className="space-y-4 mb-8">
                {activeRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 text-left"
                  >
                    <h3 className="font-semibold text-white mb-2">{req.title || 'Untitled Request'}</h3>
                    <p className="text-sm text-amber-300/80">
                      Status: {req.status.replace(/_/g, ' ')}
                    </p>
                    {req.description && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{req.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/client"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View My Dashboard
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/client"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Background Effects */}
      <div className="relative overflow-hidden animated-gradient">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        
        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              <span className="gradient-text">Start Your Project</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the service that fits your needs. Custom quotes provided for all projects.
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <div className="glass-effect px-6 py-3 rounded-full">
              <span className="text-sm text-gray-300">✓ No Hidden Fees</span>
            </div>
            <div className="glass-effect px-6 py-3 rounded-full">
              <span className="text-sm text-gray-300">✓ Full Dashboard Access</span>
            </div>
            <div className="glass-effect px-6 py-3 rounded-full">
              <span className="text-sm text-gray-300">✓ Custom Pricing</span>
            </div>
          </motion.div>
        </section>

        {/* Service Category Cards */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Top Row - New Website Builds */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Card 1: Small Business Website */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-container rounded-2xl p-6 border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 shadow-medium hover:shadow-large transform hover:-translate-y-1"
              >
                <div className="text-center mb-4">
                  <FiFileText className="w-12 h-12 mx-auto mb-3 text-trinity-red" />
                  <h3 className="text-2xl font-bold text-white mb-2">Small Business Website</h3>
                  <div className="text-3xl font-bold text-trinity-red mb-2">Starting at $599</div>
                  <p className="text-sm text-gray-300">Perfect for local businesses, consultants, freelancers, and portfolios</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>3-5 pages</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Mobile-responsive design</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Contact forms</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Basic SEO setup</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>2-week delivery</span>
                  </li>
                </ul>

                <Link
                  href="/start/questionnaire?type=small-business"
                  className="w-full block text-center py-3 px-6 bg-trinity-red hover:bg-trinity-maroon text-white font-semibold rounded-lg transition-all duration-200 shadow-medium transform hover:-translate-y-1"
                >
                  Get Started →
                </Link>
              </motion.div>

              {/* Card 2: E-Commerce & Custom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative glass-container rounded-2xl p-6 border-2 border-blue-500/30 hover:border-trinity-red transition-all duration-300 shadow-medium hover:shadow-large transform hover:-translate-y-1"
              >
                {/* Most Popular Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </div>
                </div>

                <div className="text-center mb-4">
                  <FiShoppingCart className="w-12 h-12 mx-auto mb-3 text-trinity-red" />
                  <h3 className="text-2xl font-bold text-white mb-2">E-Commerce & Custom</h3>
                  <div className="text-3xl font-bold text-trinity-red mb-2">Starting at $1,299</div>
                  <p className="text-sm text-gray-300">Online stores, booking systems, and advanced custom features</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Full e-commerce platform</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Payment processing</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Product/inventory management</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>3-4 week delivery</span>
                  </li>
                </ul>

                <Link
                  href="/start/questionnaire?type=ecommerce"
                  className="w-full block text-center py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-medium transform hover:-translate-y-1"
                >
                  Get Started →
                </Link>
              </motion.div>

              {/* Card 3: Nonprofit Organization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="glass-container rounded-2xl p-6 border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 shadow-medium hover:shadow-large transform hover:-translate-y-1"
              >
                <div className="text-center mb-4">
                  <FiHeart className="w-12 h-12 mx-auto mb-3 text-trinity-red" />
                  <h3 className="text-2xl font-bold text-white mb-2">Nonprofit Organization</h3>
                  <div className="text-3xl font-bold text-trinity-red mb-2">40% Discount</div>
                  <p className="text-sm text-gray-300">Special pricing for verified 501(c)(3) nonprofit organizations</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>All website features</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Discounted rates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Mission-driven pricing</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Same quality, better price</span>
                  </li>
                </ul>

                <Link
                  href="/start/questionnaire?type=nonprofit"
                  className="w-full block text-center py-3 px-6 bg-trinity-red hover:bg-trinity-maroon text-white font-semibold rounded-lg transition-all duration-200 shadow-medium transform hover:-translate-y-1"
                >
                  Get Started →
                </Link>
              </motion.div>
            </div>

            {/* Bottom Row - Ongoing Services (Centered) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Card 4: Maintenance Only */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="glass-container rounded-2xl p-6 border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 shadow-medium hover:shadow-large transform hover:-translate-y-1"
              >
                <div className="text-center mb-4">
                  <FiTool className="w-12 h-12 mx-auto mb-3 text-trinity-red" />
                  <h3 className="text-2xl font-bold text-white mb-2">Maintenance Only</h3>
                  <div className="text-3xl font-bold text-trinity-red mb-2">$79-$149/month</div>
                  <p className="text-sm text-gray-300">Already have a website? Get our AI-powered dashboard and ongoing maintenance</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Client dashboard access</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Monthly updates & security</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Performance monitoring</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Essential ($79) or Premium ($149)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </li>
                </ul>

                <Link
                  href="/start/questionnaire?type=maintenance"
                  className="w-full block text-center py-3 px-6 bg-trinity-red hover:bg-trinity-maroon text-white font-semibold rounded-lg transition-all duration-200 shadow-medium transform hover:-translate-y-1"
                >
                  Subscribe →
                </Link>
              </motion.div>

              {/* Card 5: Quick Fix & Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="glass-container rounded-2xl p-6 border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 shadow-medium hover:shadow-large transform hover:-translate-y-1"
              >
                <div className="text-center mb-4">
                  <FiZap className="w-12 h-12 mx-auto mb-3 text-trinity-red" />
                  <h3 className="text-2xl font-bold text-white mb-2">Quick Fix & Support</h3>
                  <div className="text-3xl font-bold text-trinity-red mb-2">Starting at $150</div>
                  <p className="text-sm text-gray-300">One-time fixes, updates, or troubleshooting for your existing website</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Bug fixes & troubleshooting</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Content updates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Feature additions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Performance improvements</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Fast turnaround (1-3 days)</span>
                  </li>
                </ul>

                <Link
                  href="/start/questionnaire?type=quick-fix"
                  className="w-full block text-center py-3 px-6 bg-trinity-red hover:bg-trinity-maroon text-white font-semibold rounded-lg transition-all duration-200 shadow-medium transform hover:-translate-y-1"
                >
                  Get Help →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="glass-effect rounded-2xl p-8"
          >
            <h2 className="text-3xl font-heading font-bold text-white text-center mb-8">
              How It Works
            </h2>
            <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
              Select your service type above to get started. You'll answer a few questions about your specific needs, and we'll create a custom quote tailored to your project.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-trinity-red rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-semibold text-white mb-2">Choose Service</h3>
                <p className="text-sm text-gray-400">Select the option that fits your needs</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-trinity-red rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-semibold text-white mb-2">Answer Questions</h3>
                <p className="text-sm text-gray-400">Tell us about your project</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-trinity-red rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-semibold text-white mb-2">Get Custom Quote</h3>
                <p className="text-sm text-gray-400">Receive pricing within 24 hours</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-400">
                💡 Not sure which option fits? Choose the closest match and explain your needs in the questionnaire.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Bottom CTA */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="text-center"
          >
            <div className="glass-effect rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-heading font-bold text-white mb-4">
                Questions? We're Here to Help
              </h3>
              <p className="text-gray-300 mb-6">
                Not sure which service is right for you? Book a free 15-minute consultation and we'll help you choose the perfect fit for your business.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 glow-on-hover focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Book Free Consultation
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </PageShell>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-trinity-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageShell>
    }>
      <StartPageContent />
    </Suspense>
  );
}
