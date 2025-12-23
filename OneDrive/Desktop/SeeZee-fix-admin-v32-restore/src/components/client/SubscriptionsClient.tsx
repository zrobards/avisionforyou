"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SubscriptionCard } from "./SubscriptionCard";
import { CreditCard, Package, AlertCircle, DollarSign, TrendingUp, Server, Receipt } from "lucide-react";
import { NONPROFIT_TIERS, getTier } from "@/lib/config/tiers";
import { PACKAGES } from "@/lib/qwiz/packages";
import { SubscriptionSuccessEmailTrigger } from "@/app/(client)/client/subscriptions/SubscriptionSuccessEmailTrigger";

interface ChangeRequest {
  id: string;
  description: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

interface Subscription {
  id: string;
  projectId: string;
  projectName: string;
  stripeId: string;
  priceId: string;
  status: string;
  planName: string;
  tier?: string;
  tierName?: string;
  currentPeriodEnd: string | null;
  changeRequestsAllowed: number;
  changeRequestsUsed: number;
  resetDate: string | null;
  createdAt: string;
  additionalCost?: number;
  isAddon?: boolean;
  changeRequests: ChangeRequest[];
  projectTotalPaid?: number;
  projectPackage?: string | null;
  projectFeatures?: string[];
  monthlyPrice?: number;
  isMaintenancePlan?: boolean;
}

interface SubscriptionsClientProps {
  subscriptions: Subscription[];
  totalMonthlyCost?: number;
  totalAnnualCost?: number;
  totalPaid?: number;
  paymentRequired?: boolean;
  upgraded?: boolean;
  sessionId?: string;
}

export function SubscriptionsClient({ 
  subscriptions, 
  totalMonthlyCost = 0, 
  totalAnnualCost = 0,
  totalPaid = 0,
  paymentRequired = false,
  upgraded = false,
  sessionId
}: SubscriptionsClientProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'past_due'>('all');

  // Handle subscription upgrade success - trigger email sending via client component
  // This ensures emails are sent even if webhook hasn't fired yet

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
  const pastDueSubscriptions = subscriptions.filter((s) => s.status === 'past_due');

  const filteredSubscriptions =
    filter === 'all'
      ? subscriptions
      : filter === 'active'
      ? activeSubscriptions
      : pastDueSubscriptions;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const getPackageInfo = (packageId: string | null | undefined) => {
    if (!packageId) return null;
    return PACKAGES.find((pkg) => pkg.id === packageId);
  };

  // Check if any subscription has a Stripe subscription ID (paid)
  const hasPaidSubscription = subscriptions.some((s) => s.status === 'active' && s.stripeId);

  if (paymentRequired || (!hasPaidSubscription && subscriptions.length > 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Payment Required</h3>
              <p className="text-gray-300 mb-4">
                You need to complete payment for your subscription before you can access the client panel and use your hours. 
                Please set up a payment method and complete your subscription.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/client/hours#select-plan"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Select Plan & Pay
                </Link>
              </div>
            </div>
          </div>
        </div>

        {subscriptions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Your Subscriptions</h2>
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Active Subscriptions</h2>
            <p className="text-gray-400 mb-6">
              You don't have any active subscriptions yet. Subscriptions are created when your project goes live or when you set up a maintenance plan.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/client/billing"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                View Billing
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email trigger component - sends email on client side when subscription is upgraded */}
      {(upgraded || sessionId) && (
        <SubscriptionSuccessEmailTrigger sessionId={sessionId} />
      )}
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Subscriptions</h1>
          <p className="text-gray-400">
            Manage your monthly subscriptions and billing
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Active ({activeSubscriptions.length})
          </button>
          {pastDueSubscriptions.length > 0 && (
            <button
              onClick={() => setFilter('past_due')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'past_due'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Past Due ({pastDueSubscriptions.length})
            </button>
          )}
        </div>
      </div>

      {/* Cost Overview Section */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-400" />
          Spending Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/60 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Monthly Recurring Cost</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalMonthlyCost)}</div>
            <div className="text-xs text-gray-500 mt-1">All active subscriptions</div>
          </div>
          <div className="bg-gray-900/60 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Annual Recurring Cost</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalAnnualCost)}</div>
            <div className="text-xs text-gray-500 mt-1">Projected yearly spending</div>
          </div>
          <div className="bg-gray-900/60 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Paid (All Time)</div>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(totalPaid)}</div>
            <div className="text-xs text-gray-500 mt-1">Including packages & invoices</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Active Subscriptions</span>
          </div>
          <div className="text-3xl font-bold text-white">{activeSubscriptions.length}</div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Change Requests</span>
          </div>
          <div className="text-3xl font-bold text-white">Unlimited</div>
          <div className="text-xs text-gray-500 mt-1">Tied to available hours</div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Hosting & Maintenance</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {activeSubscriptions.length} {activeSubscriptions.length === 1 ? 'Project' : 'Projects'}
          </div>
        </div>

        {pastDueSubscriptions.length > 0 ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-400">Needs Attention</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{pastDueSubscriptions.length}</div>
          </div>
        ) : (
          <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">All Up to Date</span>
            </div>
            <div className="text-2xl font-bold text-green-400">✓</div>
          </div>
        )}
      </div>

      {/* Package & Cost Breakdown */}
      {subscriptions.length > 0 && (
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            Package & Cost Breakdown
          </h2>
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              // Use tier config for pricing if it's a MaintenancePlan
              const tierKey = sub.tier ? (sub.tier.toUpperCase() as keyof typeof NONPROFIT_TIERS) : null;
              const tierConfig = tierKey ? getTier(tierKey) : null;
              const pkgInfo = getPackageInfo(sub.projectPackage);
              
              // Use tier monthlyPrice if available, otherwise fall back to monthlyPrice field
              const monthlyCost = tierConfig 
                ? tierConfig.monthlyPrice 
                : (sub.monthlyPrice || 0);

              return (
                <div 
                  key={sub.id}
                  className="bg-gray-800/50 border border-white/5 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{sub.projectName}</h3>
                      {pkgInfo && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400">Package:</span>
                          <span className="text-sm font-medium text-blue-400">
                            {pkgInfo.icon} {pkgInfo.title} - {formatCurrency(pkgInfo.basePrice)}
                          </span>
                        </div>
                      )}
                      {sub.projectTotalPaid && sub.projectTotalPaid > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Total paid: {formatCurrency(sub.projectTotalPaid)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {formatCurrency(monthlyCost)}/mo
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Maintenance Plan</div>
                      <div className="text-white font-medium">
                        {sub.tierName || sub.planName}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Hosting & Support</div>
                      <div className="text-white font-medium">
                        {formatCurrency(monthlyCost)}/mo
                      </div>
                    </div>
                  </div>
                  {sub.isAddon && sub.additionalCost && sub.additionalCost > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="text-xs text-gray-400 mb-1">Additional Addon</div>
                      <div className="text-sm text-white">+{formatCurrency(sub.additionalCost)}/mo</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSubscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </div>
    </div>
  );
}



