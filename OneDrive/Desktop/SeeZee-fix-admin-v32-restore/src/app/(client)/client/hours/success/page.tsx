'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Package, TrendingUp, Clock, Sparkles, Gift } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/stores/useToast';

interface PackInfo {
  id: string;
  name: string;
  hours: number;
  price: number;
}

interface CurrentPlan {
  tier: string;
  tierName?: string;
  monthlyHours: number;
  totalHours: number;
  hourPacks: number;
  rolloverHours?: number;
  monthlyRemaining?: number;
}

const PACK_INFO: Record<string, PackInfo> = {
  SMALL: { id: 'SMALL', name: 'Starter Pack', hours: 5, price: 350 },
  MEDIUM: { id: 'MEDIUM', name: 'Growth Pack', hours: 10, price: 650 },
  LARGE: { id: 'LARGE', name: 'Scale Pack', hours: 20, price: 1200 },
  PREMIUM: { id: 'PREMIUM', name: 'Premium Reserve', hours: 10, price: 850 },
};

export default function HourPackSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [packId, setPackId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('pack');
    const sessionId = searchParams.get('session_id');
    
    if (id) {
      setPackId(id);
      
      // If we have a session ID, verify the purchase immediately
      // Pass the packId directly since state updates are async
      if (sessionId) {
        verifyPackPurchase(sessionId, id).then(() => {
          fetchCurrentPlan();
        });
      } else {
        fetchCurrentPlan();
      }
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPackPurchase = async (sessionId: string, packIdParam?: string) => {
    // Use packIdParam if provided, otherwise fall back to state (for backwards compatibility)
    const currentPackId = packIdParam || packId;
    
    try {
      const response = await fetch('/api/client/hours/verify-pack-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('Pack purchase verified:', result.pack);
          
          // Send receipt email as fallback (webhook might not have sent it yet)
          if (currentPackId && PACK_INFO[currentPackId]) {
            try {
              const pack = PACK_INFO[currentPackId];
              const emailResponse = await fetch('/api/client/hours/send-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  packId: currentPackId,
                  packName: pack.name,
                  hours: pack.hours,
                  price: pack.price,
                }),
              });
              
              if (emailResponse.ok) {
                console.log('Receipt email sent from success page');
                // Show success toast notification
                const result = await emailResponse.json();
                if (result.success) {
                  const customerEmail = session?.user?.email;
                  showToast(
                    customerEmail ? `Receipt email sent to ${customerEmail}` : 'Receipt email sent successfully',
                    'success'
                  );
                }
              } else {
                console.warn('Failed to send receipt email from success page');
                showToast('Failed to send receipt email. Please contact support.', 'error');
              }
            } catch (emailError) {
              console.warn('Error sending receipt email from success page:', emailError);
            }
          }
        }
      } else {
        const error = await response.json();
        console.log('Verification response:', error);
      }
    } catch (error) {
      console.error('Failed to verify pack purchase:', error);
    }
  };

  const fetchCurrentPlan = async (retryCount = 0) => {
    try {
      const response = await fetch('/api/client/hours');
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data);
        
        // If we just purchased a pack but it's not showing up yet, retry a few times
        // (webhook might still be processing)
        if (packId && retryCount < 5 && data.hourPacks === 0) {
          setTimeout(() => {
            fetchCurrentPlan(retryCount + 1);
          }, 2000); // Retry every 2 seconds, up to 5 times (10 seconds total)
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
      if (retryCount < 3) {
        setTimeout(() => {
          fetchCurrentPlan(retryCount + 1);
        }, 2000);
      } else {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  const purchasedPack = packId ? PACK_INFO[packId] : null;
  
  // Handle unlimited hours (-1) properly
  const isUnlimited = currentPlan?.totalHours === -1 || currentPlan?.monthlyHours === -1;
  
  // Calculate previous and new hours
  // totalHours from API = monthlyRemaining + rolloverHours + hourPacks (total available)
  let previousHours: number;
  let newHours: number;
  
  if (isUnlimited) {
    previousHours = -1;
    newHours = -1;
  } else if (currentPlan && purchasedPack) {
    const purchasedHours = purchasedPack.hours;
    const currentTotal = currentPlan.totalHours || 0; // This is totalAvailable = monthly + rollover + packs
    const currentPackHours = currentPlan.hourPacks || 0; // Total hours from all packs
    
    // Calculate what the total should be: monthly + rollover + packs
    const monthlyRem = currentPlan.monthlyRemaining ?? (currentPlan.monthlyHours || 0);
    const rollover = currentPlan.rolloverHours || 0;
    const expectedTotal = monthlyRem + rollover + currentPackHours;
    
    // If currentTotal matches expectedTotal, the pack has been processed
    // If currentPackHours >= purchasedHours, the pack is likely included
    const packProcessed = Math.abs(currentTotal - expectedTotal) < 2 && currentPackHours >= purchasedHours;
    
    if (packProcessed) {
      // Pack has been processed: totalHours already includes the new pack
      newHours = currentTotal; // Total WITH the new pack
      // Calculate previous: subtract the purchased hours from pack hours, then recalculate total
      const previousPackHours = Math.max(0, currentPackHours - purchasedHours);
      previousHours = monthlyRem + rollover + previousPackHours;
    } else {
      // Pack not processed yet: currentTotal doesn't include the new pack
      previousHours = currentTotal; // Current total (before purchase)
      newHours = currentTotal + purchasedHours; // New total (after purchase)
    }
  } else if (currentPlan) {
    // No purchased pack info, just show current totals
    previousHours = currentPlan.totalHours || 0;
    newHours = currentPlan.totalHours || 0;
  } else {
    // No current plan data
    previousHours = 0;
    newHours = purchasedPack?.hours || 0;
  }
  
  // Helper function to format hours display
  const formatHours = (hours: number) => {
    if (hours === -1) return 'Unlimited';
    return hours.toString();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        {/* Success Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <CheckCircle2 className="w-20 h-20 text-green-400" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ delay: 0.4 }}
                className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mt-6 mb-2">
              Purchase Successful!
            </h1>
            <p className="text-xl text-gray-300">
              Your hours have been added to your account
            </p>
          </motion.div>

          {/* Hours Summary */}
          {purchasedPack && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Package className="w-8 h-8 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">{purchasedPack.name}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Hours Added</p>
                  <p className="text-3xl font-bold text-white">{purchasedPack.hours}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Amount Paid</p>
                  <p className="text-3xl font-bold text-white">${purchasedPack.price}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Per Hour</p>
                  <p className="text-3xl font-bold text-white">
                    ${Math.round(purchasedPack.price / purchasedPack.hours)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hours Upgrade Display */}
          {currentPlan && purchasedPack && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Your Total Hours</h3>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Previous</p>
                  <p className="text-2xl font-bold text-gray-400 line-through">
                    {formatHours(previousHours)}
                  </p>
                </div>

                <ArrowRight className="w-6 h-6 text-cyan-400" />

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Now</p>
                  <p className="text-3xl font-bold text-green-400">
                    {formatHours(newHours)}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-300">
                  {isUnlimited ? (
                    <span className="text-green-400 font-semibold">You have unlimited hours with your COO plan</span>
                  ) : (
                    <>
                      <span className="text-green-400 font-semibold">+{purchasedPack.hours} hours</span> added to your account
                    </>
                  )}
                </p>
              </div>
            </motion.div>
          )}

          {/* Current Plan Info */}
          {currentPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Your Current Plan</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Plan Tier</p>
                  <p className="text-xl font-bold text-white">
                    {currentPlan.tierName || currentPlan.tier || 'Essentials'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Monthly Hours</p>
                  <p className="text-xl font-bold text-white">
                    {currentPlan.monthlyHours === -1 ? 'Unlimited' : (currentPlan.monthlyHours || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Hour Packs</p>
                  <p className="text-xl font-bold text-white">
                    {currentPlan.hourPacks || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6"
          >
            <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-blue-400" />
              What You Can Do Now
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Use your hours for any website work - design, development, content updates, and more</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Hours stack with your monthly plan - we use monthly hours first, then packs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Purchase more packs anytime to add even more hours</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/client/hours"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all"
            >
              Buy More Hours
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/client/requests/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/10"
            >
              <Clock className="w-5 h-5" />
              Submit Change Request
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

