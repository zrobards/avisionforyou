'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  Package, 
  Clock, 
  Zap, 
  Star, 
  Check, 
  ArrowRight,
  Shield,
  TrendingUp,
  Gift,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { NONPROFIT_TIERS, getTier } from '@/lib/config/tiers';
import { useDialogContext } from '@/lib/dialog';

// =============================================================================
// TYPES & DATA
// =============================================================================

interface HourPack {
  id: string;
  name: string;
  hours: number;
  price: number;
  expirationDays: number | null;
  description: string;
  popular?: boolean;
  features: string[];
  savings?: string;
}

const HOUR_PACKS: HourPack[] = [
  {
    id: 'SMALL',
    name: 'Starter Pack',
    hours: 5,
    price: 350,
    expirationDays: 60,
    description: 'Perfect for quick updates and minor fixes',
    features: [
      '5 support hours',
      'Valid for 60 days',
      '$70/hour effective rate',
      'Email support included',
    ],
  },
  {
    id: 'MEDIUM',
    name: 'Growth Pack',
    hours: 10,
    price: 650,
    expirationDays: 90,
    description: 'Ideal for ongoing improvements and enhancements',
    popular: true,
    features: [
      '10 support hours',
      'Valid for 90 days',
      '$65/hour effective rate',
      'Priority email support',
      'Monthly check-in call',
    ],
    savings: 'Save $100',
  },
  {
    id: 'LARGE',
    name: 'Scale Pack',
    hours: 20,
    price: 1200,
    expirationDays: 120,
    description: 'Best value for major projects and redesigns',
    features: [
      '20 support hours',
      'Valid for 120 days',
      '$60/hour effective rate',
      'Priority support',
      'Bi-weekly check-in calls',
      'Analytics review',
    ],
    savings: 'Save $300',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface CurrentPlan {
  tier: string;
  tierName?: string;
  monthlyHours: number;
  totalHours: number;
  hourPacks: number;
  rolloverHours: number;
  paymentRequired?: boolean;
}

function PackCard({ 
  pack, 
  onSelect, 
  currentPlan 
}: { 
  pack: HourPack; 
  onSelect: (pack: HourPack) => void;
  currentPlan?: CurrentPlan | null;
}) {
  // Calculate hourly rate for comparison
  const packHourlyRate = pack.price / pack.hours;
  
  // Don't show "worse deal" warning for unlimited tiers
  const isUnlimited = currentPlan?.monthlyHours === -1;
  
  // Calculate current hourly rate from tier pricing
  // For unlimited tiers, don't calculate (no comparison needed)
  let currentHourlyRate = 0;
  if (!isUnlimited && currentPlan?.monthlyHours && currentPlan.monthlyHours > 0 && currentPlan.tier) {
    // Get tier config to get actual pricing
    const tierKey = currentPlan.tier.toUpperCase() as keyof typeof NONPROFIT_TIERS;
    const tierConfig = getTier(tierKey);
    if (tierConfig) {
      const monthlyPrice = tierConfig.monthlyPrice / 100; // Convert cents to dollars
      currentHourlyRate = monthlyPrice / currentPlan.monthlyHours;
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl overflow-hidden flex flex-col ${
        pack.popular 
          ? 'border-cyan-500/50 ring-2 ring-cyan-500/20' 
          : 'border-white/10 hover:border-white/20'
      } transition-all`}
    >
      {/* Popular Badge */}
      {pack.popular && (
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Popular
          </span>
        </div>
      )}
      
      {/* Savings Badge */}
      {pack.savings && (
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
            {pack.savings}
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="p-6 pb-4">
        <div className={`inline-flex p-3 rounded-xl mb-4 ${
          pack.expirationDays === null 
            ? 'bg-purple-500/20 border border-purple-500/30' 
            : 'bg-cyan-500/20 border border-cyan-500/30'
        }`}>
          {pack.expirationDays === null ? (
            <Sparkles className="w-6 h-6 text-purple-400" />
          ) : (
            <Package className="w-6 h-6 text-cyan-400" />
          )}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1">{pack.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{pack.description}</p>
        
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{formatPrice(pack.price)}</span>
          <span className="text-gray-400">/ {pack.hours} hours</span>
        </div>
        
        <p className="text-sm text-gray-500 mt-1">
          {pack.expirationDays 
            ? `Valid for ${pack.expirationDays} days` 
            : 'Never expires'
          }
        </p>
      </div>
      
      {/* Features */}
      <div className="px-6 pb-6 flex-1">
        <ul className="space-y-3">
          {pack.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Action */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onSelect(pack)}
          className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            pack.popular
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Purchase Pack
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function ComparisonTable() {
  const getPriorityStars = (packId: string) => {
    switch (packId) {
      case 'LARGE':
        return { stars: '★★☆', color: 'text-yellow-300' };
      default:
        return { stars: '★☆☆', color: 'text-gray-500' };
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-bold text-white mb-1">Pack Comparison</h3>
        <p className="text-sm text-gray-400">Find the right pack for your needs</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Feature</th>
              {HOUR_PACKS.map((pack) => (
                <th key={pack.id} className="px-6 py-4 text-center text-sm font-semibold text-white">
                  <div className="flex flex-col items-center gap-1">
                    <span>{pack.name}</span>
                    {pack.popular && (
                      <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-300">Hours</td>
              {HOUR_PACKS.map((pack) => (
                <td key={pack.id} className="px-6 py-4 text-center text-base font-bold text-white">
                  {pack.hours}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-300">Price</td>
              {HOUR_PACKS.map((pack) => (
                <td key={pack.id} className="px-6 py-4 text-center">
                  <div className="text-base font-bold text-white">{formatPrice(pack.price)}</div>
                  {pack.savings && (
                    <div className="text-xs text-green-400 mt-1">{pack.savings}</div>
                  )}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-300">Hourly Rate</td>
              {HOUR_PACKS.map((pack) => {
                const hourlyRate = Math.round(pack.price / pack.hours);
                return (
                  <td key={pack.id} className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-white">
                      ${hourlyRate.toLocaleString()}/hr
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-300">Validity</td>
              {HOUR_PACKS.map((pack) => (
                <td key={pack.id} className="px-6 py-4 text-center">
                  {pack.expirationDays ? (
                    <span className="text-sm text-white">{pack.expirationDays} days</span>
                  ) : (
                    <span className="text-sm text-purple-400 font-semibold flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Forever
                    </span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-300">Priority</td>
              {HOUR_PACKS.map((pack) => {
                const { stars, color } = getPriorityStars(pack.id);
                return (
                  <td key={pack.id} className="px-6 py-4 text-center">
                    <span className={`text-lg ${color} font-semibold`}>{stars}</span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

interface CurrentPlan {
  tier: string;
  tierName?: string;
  monthlyHours: number;
  totalHours: number;
  hourPacks: number;
  rolloverHours: number;
  paymentRequired?: boolean;
  hourPacksList: Array<{
    id: string;
    packType: string;
    hours: number;
    hoursRemaining: number;
    expiresAt: string | null;
    neverExpires: boolean;
    purchasedAt: string;
    cost: number; // Cost in cents
  }>;
  totalSpentOnPacks?: number; // Total amount spent on all hour packs (in cents)
}

export default function HourPacksPage() {
  const searchParams = useSearchParams();
  const dialog = useDialogContext();
  const [selectedPack, setSelectedPack] = useState<HourPack | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [updatingTier, setUpdatingTier] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  
  // Prevent concurrent verify-payment calls
  const verifyingRef = useRef(false);
  const lastVerifyTimeRef = useRef(0);
  const VERIFY_DEBOUNCE_MS = 3000; // Only allow one verify call per 3 seconds
  
  // Fetch current plan
  useEffect(() => {
    const init = async () => {
      const data = await fetchCurrentPlan();
      
      // Check for success/cancel params from Stripe redirect
      const tierUpdated = searchParams.get('tier-updated');
      const tierCancelled = searchParams.get('tier-update-cancelled');
      
      if (tierUpdated === 'true') {
        // Payment completed - try to verify immediately
        console.log('[TIER UPDATE] Payment completed, verifying...');
        await verifyPaymentAndRefresh();
      } else if (tierCancelled === 'true') {
        // Payment cancelled
        console.log('[TIER UPDATE] Payment cancelled');
      } else if (data?.paymentRequired && data?.hasCheckoutSession) {
        // If payment is required but we have a checkout session, try to verify it
        // This handles cases where payment completed but webhook hasn't processed yet
        console.log('[TIER UPDATE] Payment required but checkout session exists, verifying...');
        setTimeout(async () => {
          await verifyPaymentAndRefresh();
        }, 2000); // Wait 2 seconds after page load to allow Stripe to process
      }
    };
    
    init();
  }, [searchParams]);
  
  // Verify payment with Stripe and update plan if needed
  const verifyPaymentAndRefresh = async () => {
    // Prevent concurrent calls
    if (verifyingRef.current) {
      console.log('[TIER UPDATE] Verification already in progress, skipping...');
      return false;
    }
    
    // Debounce: don't call if we just called recently
    const now = Date.now();
    if (now - lastVerifyTimeRef.current < VERIFY_DEBOUNCE_MS) {
      console.log('[TIER UPDATE] Verification called too soon, skipping...');
      return false;
    }
    
    verifyingRef.current = true;
    lastVerifyTimeRef.current = now;
    setVerifyingPayment(true);
    
    try {
      const verifyResponse = await fetch('/api/client/maintenance-plans/verify-payment', {
        method: 'POST',
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        if (verifyResult.success) {
          console.log('[TIER UPDATE] Payment verified successfully!');
          window.history.replaceState({}, '', '/client/hours');
          await fetchCurrentPlan();
          setVerifyingPayment(false);
          verifyingRef.current = false;
          return true;
        } else {
          console.log('[TIER UPDATE] Payment not verified:', verifyResult.message);
        }
      }
      
      // If verify didn't work, poll for webhook
      console.log('[TIER UPDATE] Direct verification failed, polling for webhook...');
      setVerifyingPayment(false);
      verifyingRef.current = false;
      pollForPlanActivation();
      return false;
    } catch (error) {
      console.error('[TIER UPDATE] Verification error:', error);
      setVerifyingPayment(false);
      verifyingRef.current = false;
      pollForPlanActivation();
      return false;
    }
  };

  const pollForPlanActivation = async (attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000;
    
    if (attempts >= maxAttempts) {
      console.log('[TIER UPDATE] Polling complete, trying direct verification...');
      // Try direct verification one more time (using debounced function)
      const verified = await verifyPaymentAndRefresh();
      if (verified) {
        await dialog.alert('✅ Payment verified! Your subscription is now active.');
        window.history.replaceState({}, '', '/client/hours');
        await fetchCurrentPlan();
        return;
      }
      
      await fetchCurrentPlan();
      await dialog.alert('⏳ Payment is being processed. Please refresh the page in a moment.');
      window.history.replaceState({}, '', '/client/hours');
      return;
    }
    
    try {
      const response = await fetch('/api/client/hours');
      if (response.ok) {
        const data = await response.json();
        
        // Check if payment was processed (no paymentRequired flag)
        if (!data.paymentRequired && data.tier) {
          console.log('[TIER UPDATE] Plan activated!', data);
          setCurrentPlan(data);
          await dialog.alert('✅ Payment successful! Your subscription is now active.');
          window.history.replaceState({}, '', '/client/hours');
          return;
        }
        
        // If there's a checkout session, try to verify it (only once, on first attempt)
        if (data.hasCheckoutSession && attempts === 0 && !verifyingRef.current) {
          console.log('[TIER UPDATE] Checkout session exists, verifying...');
          const verified = await verifyPaymentAndRefresh();
          if (verified) {
            return;
          }
        }
      }
      
      // Payment not processed yet, poll again
      setTimeout(() => pollForPlanActivation(attempts + 1), pollInterval);
    } catch (error) {
      console.error('[TIER UPDATE] Polling error:', error);
      if (attempts < maxAttempts - 1) {
        setTimeout(() => pollForPlanActivation(attempts + 1), pollInterval);
      } else {
        await fetchCurrentPlan();
      }
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch('/api/client/hours');
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from hours API:', text);
        setCurrentPlan(null);
        setLoadingPlan(false);
        return null;
      }
      
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data);
        setLoadingPlan(false);
        return data;
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch plan data' }));
        console.error('Failed to fetch current plan:', error);
        setCurrentPlan(null);
        setLoadingPlan(false);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
      if (error instanceof SyntaxError) {
        console.error('JSON parse error - server may have returned HTML instead of JSON');
      }
      setCurrentPlan(null);
      setLoadingPlan(false);
      return null;
    }
  };
  
  const handleSelectPack = (pack: HourPack) => {
    setSelectedPack(pack);
    setShowPurchaseModal(true);
  };
  
  const handleCheckout = async () => {
    if (!selectedPack) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout/hour-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: selectedPack.id }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout');
      }
      
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      await dialog.alert(error.message || 'Failed to process checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <Package className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Hour Packs</h1>
              <p className="text-gray-400">Purchase additional support hours for your projects</p>
            </div>
          </div>
          
          {/* Benefits Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-300">Flexible Hours</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">No Commitment</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-300">Better Rates</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <Gift className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-300">Stack with Plan</span>
            </div>
          </div>
        </div>
        
        {/* Current Plan Display */}
        {currentPlan && (
          <div id="current-plan" className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 mb-8">
            {verifyingPayment && (
              <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-blue-300 text-sm">Verifying payment status...</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {currentPlan.paymentRequired ? 'Selected Plan (Payment Required)' : 'Your Current Plan'}
              </h3>
              
              {currentPlan.monthlyHours === -1 ? (
                // Unlimited tier - simplified message
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium">{currentPlan.tierName || 'COO System'}</div>
                      <div className="text-sm text-gray-400">Unlimited hours • Unlimited change requests</div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">
                      <strong>You don't need hour packs!</strong> Your plan includes unlimited hours every month. 
                      Hour packs below are only useful if you want to prepay for hours that never expire.
                    </p>
                  </div>
                </div>
              ) : (
                // Limited tier - show breakdown
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-white font-medium text-lg">
                        {currentPlan.tierName || (currentPlan.tier ? NONPROFIT_TIERS[currentPlan.tier.toUpperCase() as keyof typeof NONPROFIT_TIERS]?.name : 'Essentials')}
                      </div>
                      {currentPlan.paymentRequired && (
                        <div className="text-xs text-yellow-400 mt-1">
                          ⚠️ Payment required to access hours
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Monthly Hours</div>
                      <div className="text-lg font-bold text-white">
                        {currentPlan.monthlyHours}/month
                      </div>
                      <div className="text-xs text-gray-500">Resets monthly</div>
                    </div>
                    {currentPlan.rolloverHours > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Rollover</div>
                        <div className="text-lg font-bold text-yellow-400">{currentPlan.rolloverHours}</div>
                        <div className="text-xs text-gray-500">From last month</div>
                      </div>
                    )}
                    {currentPlan.hourPacks > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Hour Packs</div>
                        <div className="text-lg font-bold text-cyan-400">{currentPlan.hourPacks}</div>
                        <div className="text-xs text-gray-500">Purchased</div>
                        {currentPlan.totalSpentOnPacks && currentPlan.totalSpentOnPacks > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            ${(currentPlan.totalSpentOnPacks / 100).toFixed(2)} spent
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Available</div>
                      <div className="text-lg font-bold text-green-400">{currentPlan.totalHours}</div>
                      <div className="text-xs text-gray-500">Right now</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      💡 <strong>Need more hours?</strong> Purchase hour packs below to add extra hours on top of your monthly allowance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tier Selection Section */}
        <div id="select-plan" className="mb-12 scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Change Your Plan</h2>
            <p className="text-gray-400">Upgrade or downgrade your monthly plan tier</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(NONPROFIT_TIERS).map((tier) => {
              // Check if this tier matches the selected plan
              const tierMatches = currentPlan?.tier?.toUpperCase() === tier.id;
              // Only show as "current" if tier matches AND payment is complete
              const isCurrentTier = tierMatches && !currentPlan?.paymentRequired;
              // Check if payment is required for this tier
              const needsPayment = tierMatches && currentPlan?.paymentRequired;
              // Determine upgrade/downgrade only if current plan is paid
              const isUpgrade = currentPlan?.tier && !currentPlan?.paymentRequired &&
                ['ESSENTIALS', 'DIRECTOR', 'COO'].indexOf(currentPlan.tier.toUpperCase()) < 
                ['ESSENTIALS', 'DIRECTOR', 'COO'].indexOf(tier.id);
              const isDowngrade = currentPlan?.tier && !currentPlan?.paymentRequired &&
                ['ESSENTIALS', 'DIRECTOR', 'COO'].indexOf(currentPlan.tier.toUpperCase()) > 
                ['ESSENTIALS', 'DIRECTOR', 'COO'].indexOf(tier.id);
              
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl overflow-hidden ${
                    isCurrentTier
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                      : isUpgrade
                      ? 'border-green-500/50 hover:border-green-500'
                      : isDowngrade
                      ? 'border-yellow-500/50 hover:border-yellow-500'
                      : 'border-white/10 hover:border-white/20'
                  } transition-all`}
                >
                  {(isCurrentTier || needsPayment) && (
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 text-white text-xs font-bold rounded-full ${
                        needsPayment ? 'bg-yellow-500' : 'bg-cyan-500'
                      }`}>
                        {needsPayment ? 'Payment Required' : 'Current Plan'}
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-white mb-1">
                        ${(tier.monthlyPrice / 100).toLocaleString()}
                        <span className="text-lg text-gray-400">/month</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Support Hours</span>
                        <span className="text-white font-medium">
                          {tier.supportHoursIncluded === -1 ? 'Unlimited' : `${tier.supportHoursIncluded}/month`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Change Requests</span>
                        <span className="text-white font-medium">Unlimited</span>
                      </div>
                    </div>
                    
                    {needsPayment ? (
                      <div className="space-y-2">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setUpdatingTier(tier.id);
                            
                            // First try to verify if payment was already completed (using debounced function)
                            const verified = await verifyPaymentAndRefresh();
                            if (verified) {
                              await dialog.alert('✅ Payment verified! Your subscription is now active.');
                              await fetchCurrentPlan();
                              setUpdatingTier(null);
                              return;
                            }
                            
                            try {
                              const response = await fetch('/api/client/maintenance-plans/update-tier', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ tier: tier.id }),
                              });
                              
                              const contentType = response.headers.get('content-type');
                              if (!contentType || !contentType.includes('application/json')) {
                                const text = await response.text();
                                console.error('[TIER SELECT] Non-JSON response:', text);
                                await dialog.alert('❌ Server error. Please try again or contact support.');
                                setUpdatingTier(null);
                                return;
                              }
                              
                              const result = await response.json();
                              
                              if (response.ok && result.requiresPayment && result.checkoutUrl) {
                                window.location.href = result.checkoutUrl;
                                return;
                              } else {
                                await dialog.alert(`❌ ${result.error || 'Failed to create checkout. Please try again or contact support.'}`);
                              }
                            } catch (error) {
                              console.error('[TIER SELECT] Exception:', error);
                              await dialog.alert('❌ Failed to process payment. Please try again or contact support.');
                            } finally {
                              setUpdatingTier(null);
                            }
                          }}
                          disabled={updatingTier === tier.id}
                          className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
                        >
                          {updatingTier === tier.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Complete Payment
                            </>
                          )}
                        </button>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setUpdatingTier(tier.id + '-verify');
                            
                            const verified = await verifyPaymentAndRefresh();
                            if (verified) {
                              // Success message already shown by verifyPaymentAndRefresh
                              await dialog.alert('✅ Payment verified! Your subscription is now active.');
                            } else {
                              // Only show message if verification actually ran (not skipped due to debounce)
                              if (!verifyingRef.current && Date.now() - lastVerifyTimeRef.current >= VERIFY_DEBOUNCE_MS) {
                                await dialog.alert('ℹ️ Payment not found. Please complete payment above.');
                              }
                            }
                            
                            setUpdatingTier(null);
                          }}
                          disabled={updatingTier === tier.id + '-verify' || verifyingPayment}
                          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {updatingTier === tier.id + '-verify' || verifyingPayment ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Already paid? Verify Payment
                            </>
                          )}
                        </button>
                      </div>
                    ) : isCurrentTier ? (
                      <div className="w-full py-3 px-4 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm text-center rounded-xl">
                        Your Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          console.log('[TIER SELECT] Button clicked for tier:', tier.id);
                          
                          const action = isUpgrade ? 'upgrade' : 'downgrade';
                          const confirmMessage = isUpgrade
                            ? `Upgrade to ${tier.name} for $${(tier.monthlyPrice / 100).toLocaleString()}/month? Your subscription will be updated immediately and you'll be charged the prorated amount.`
                            : `Downgrade to ${tier.name} for $${(tier.monthlyPrice / 100).toLocaleString()}/month? Your subscription will be updated immediately. You'll receive a credit for the unused portion of your current plan, and the new rate will apply going forward.`;
                          
                          const confirmed = await dialog.confirm(confirmMessage, {
                            variant: isUpgrade ? 'default' : 'warning',
                            title: isUpgrade ? 'Upgrade Plan' : 'Downgrade Plan',
                          });
                          if (!confirmed) {
                            console.log('[TIER SELECT] User cancelled');
                            return;
                          }
                          
                          console.log('[TIER SELECT] User confirmed, starting update...');
                          setUpdatingTier(tier.id);
                          
                          try {
                            console.log('[TIER SELECT] Making API call to update-tier with tier:', tier.id);
                            const response = await fetch('/api/client/maintenance-plans/update-tier', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ tier: tier.id }),
                            });
                            
                            console.log('[TIER SELECT] Response status:', response.status, response.statusText);
                            
                            // Check if response is JSON before parsing
                            const contentType = response.headers.get('content-type');
                            if (!contentType || !contentType.includes('application/json')) {
                              const text = await response.text();
                              console.error('[TIER SELECT] Non-JSON response:', text);
                              await dialog.alert('❌ Server error. Please try again or contact support.\n\n' + text.substring(0, 200));
                              setUpdatingTier(null);
                              return;
                            }
                            
                            const result = await response.json();
                            console.log('[TIER SELECT] Response data:', result);
                            
                            if (response.ok) {
                              // If payment is required, redirect to checkout
                              if (result.requiresPayment && result.checkoutUrl) {
                                console.log('[TIER SELECT] Redirecting to checkout:', result.checkoutUrl);
                                window.location.href = result.checkoutUrl;
                                return;
                              }
                              
                              // If invoice URL is provided, show it
                              if (result.invoiceUrl) {
                                const openInvoice = await dialog.confirm(`✅ Plan updated to ${tier.name}! A prorated invoice has been created. Would you like to view it?`, {
                                  title: 'Plan Updated',
                                  confirmText: 'View Invoice',
                                  cancelText: 'Later',
                                });
                                if (openInvoice) {
                                  window.open(result.invoiceUrl, '_blank');
                                }
                              } else {
                                await dialog.alert(`✅ Plan updated to ${tier.name}! Your subscription has been updated.`);
                              }
                              await fetchCurrentPlan();
                            } else {
                              console.error('[TIER SELECT] Error response:', result);
                              const errorMsg = result.error || 'Failed to update plan. Please try again or contact support.';
                              const details = result.details ? '\n\n' + result.details : '';
                              await dialog.alert(`❌ ${errorMsg}${details}`);
                            }
                          } catch (error) {
                            console.error('[TIER SELECT] Exception:', error);
                            if (error instanceof SyntaxError) {
                              await dialog.alert('❌ Server returned an invalid response. Please try again or contact support.');
                            } else {
                              await dialog.alert('❌ Failed to update plan. Please try again or contact support.\n\nError: ' + (error instanceof Error ? error.message : String(error)));
                            }
                          } finally {
                            setUpdatingTier(null);
                          }
                        }}
                        disabled={updatingTier === tier.id}
                        className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                          updatingTier === tier.id
                            ? 'opacity-50 cursor-not-allowed'
                            : isUpgrade
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                            : isDowngrade
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {updatingTier === tier.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            {isUpgrade ? '⬆️ Upgrade' : isDowngrade ? '⬇️ Downgrade' : 'Switch'} to {tier.shortName}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Hour Pack Details Section */}
        {currentPlan && currentPlan.hourPacksList && currentPlan.hourPacksList.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Your Hour Packs</h2>
              <p className="text-gray-400">Detailed breakdown of all your purchased hour packs</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Total Packs</div>
                    <div className="text-2xl font-bold text-white">{currentPlan.hourPacksList.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Total Hours</div>
                    <div className="text-2xl font-bold text-cyan-400">{currentPlan.hourPacksList.reduce((sum, p) => sum + p.hours, 0)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Hours Remaining</div>
                    <div className="text-2xl font-bold text-green-400">{currentPlan.hourPacksList.reduce((sum, p) => sum + p.hoursRemaining, 0)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Total Spent</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      ${currentPlan.totalSpentOnPacks ? (currentPlan.totalSpentOnPacks / 100).toFixed(2) : currentPlan.hourPacksList.reduce((sum, p) => sum + (p.cost || 0), 0) / 100}
                    </div>
                  </div>
                </div>

                {/* Pack List */}
                <div className="space-y-4">
                  {currentPlan.hourPacksList.map((pack) => {
                    const packNames: Record<string, string> = {
                      SMALL: 'Starter Pack',
                      MEDIUM: 'Growth Pack',
                      LARGE: 'Scale Pack',
                      PREMIUM: 'Premium Reserve',
                    };
                    const packName = packNames[pack.packType as keyof typeof packNames] || pack.packType;
                    const purchasedDate = new Date(pack.purchasedAt);
                    const expiresDate = pack.expiresAt ? new Date(pack.expiresAt) : null;
                    const now = new Date();
                    const daysUntilExpiry = expiresDate ? Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                    const cost = pack.cost || 0;
                    const hourlyRate = cost > 0 && pack.hours > 0 ? cost / pack.hours / 100 : 0;
                    
                    return (
                      <div key={pack.id} className="bg-gray-800/50 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{packName}</h3>
                            <p className="text-sm text-gray-400">
                              Purchased {purchasedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-400">
                              ${(cost / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                              ${hourlyRate.toFixed(0)}/hr
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Total Hours</div>
                            <div className="text-base font-semibold text-white">{pack.hours}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Remaining</div>
                            <div className="text-base font-semibold text-green-400">{pack.hoursRemaining}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Used</div>
                            <div className="text-base font-semibold text-gray-400">{pack.hours - pack.hoursRemaining}</div>
                          </div>
                        </div>

                        {expiresDate && !pack.neverExpires ? (
                          <div className="pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Expires</span>
                              <span className={`text-sm font-medium ${daysUntilExpiry && daysUntilExpiry <= 30 ? 'text-red-400' : 'text-gray-300'}`}>
                                {expiresDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                                  <span className="ml-2 text-xs">
                                    ({daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'} left)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">Status:</span>
                              <span className="text-sm font-medium text-green-400">Never expires</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hour Packs Grid */}
        {currentPlan?.monthlyHours === -1 ? (
          // For unlimited tier, show a message instead
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">You Have Unlimited Hours!</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Your <strong className="text-white">{currentPlan.tierName || 'COO'}</strong> plan includes unlimited hours every month. 
              You don't need to purchase hour packs - you already have everything you need!
            </p>
            <div className="flex justify-center">
              <Link
                href="/client/requests/new"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-colors"
              >
                Submit a Request
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Purchase Additional Hours</h2>
              <p className="text-gray-400">Buy extra hours on top of your monthly plan</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {HOUR_PACKS.map((pack, index) => (
                <motion.div
                  key={pack.id}
                  id={`pack-${pack.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PackCard pack={pack} onSelect={handleSelectPack} currentPlan={currentPlan} />
                </motion.div>
              ))}
            </div>
          </>
        )}
        
        {/* Comparison Table */}
        <ComparisonTable />
        
        {/* FAQ Section */}
        <div className="mt-12 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Frequently Asked Questions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">What are hour packs?</h4>
              <p className="text-sm text-gray-400">
                Hour packs are extra hours you can buy on top of your monthly plan. They're useful if you need more hours 
                than your plan includes.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">How do they work with my monthly hours?</h4>
              <p className="text-sm text-gray-400">
                Your monthly hours reset each billing cycle and never expire. Hour packs add extra hours on top. 
                We use your monthly hours first, then hour packs. Change requests are unlimited - you can submit as many 
                as you want as long as you have hours available.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">What happens when a pack expires?</h4>
              <p className="text-sm text-gray-400">
                We'll email you reminders before expiration. Any unused hours from that pack expire at the end of the validity period. 
                Your monthly hours are never affected - they always reset each month.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">I have unlimited hours - do I need packs?</h4>
              <p className="text-sm text-gray-400">
                No! If you're on the COO tier with unlimited hours, you don't need hour packs. Your plan already includes 
                unlimited hours every month.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Not sure which pack is right for you?
          </p>
          <Link
            href="/client/support"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Contact Support
          </Link>
        </div>
        
        {/* Purchase Modal Placeholder */}
        {showPurchaseModal && selectedPack && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-2">Confirm Purchase</h3>
              <p className="text-gray-400 mb-6">
                You're about to purchase the <strong className="text-white">{selectedPack.name}</strong>
              </p>
              
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Hours</span>
                  <span className="text-white">{selectedPack.hours}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Validity</span>
                  <span className="text-white">
                    {selectedPack.expirationDays ? `${selectedPack.expirationDays} days` : 'Never expires'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-bold">{formatPrice(selectedPack.price)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Checkout
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Secure payment via Stripe
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
