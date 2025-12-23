"use client";

import { useState } from "react";
import { CreditCard, Calendar, Package, ChevronDown, ChevronUp, ExternalLink, Check, Clock, XCircle, Server, CalendarPlus } from "lucide-react";
import { NONPROFIT_TIERS, getTier } from "@/lib/config/tiers";
import { PACKAGES } from "@/lib/qwiz/packages";
import Link from "next/link";
import { useDialogContext } from "@/lib/dialog";

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

interface SubscriptionCardProps {
  subscription: Subscription;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  past_due: "bg-red-500/20 text-red-400 border-red-500/30",
  canceled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  incomplete: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  incomplete: "Incomplete",
};

const CHANGE_REQUEST_STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <Clock className="w-4 h-4 text-yellow-400" />,
  approved: <Check className="w-4 h-4 text-blue-400" />,
  completed: <Check className="w-4 h-4 text-green-400" />,
  rejected: <XCircle className="w-4 h-4 text-red-400" />,
};

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const dialog = useDialogContext();
  const [showChangeRequests, setShowChangeRequests] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  // Use tier config if available
  const tierKey = subscription.tier ? (subscription.tier.toUpperCase() as keyof typeof NONPROFIT_TIERS) : null;
  const tierConfig = tierKey ? getTier(tierKey) : null;
  
  // Change requests are unlimited - tied to hours, not a separate limit
  // No need to calculate remaining - if you have hours, you can make requests
  
  // Get pricing from tier config or monthlyPrice field
  const monthlyPrice = tierConfig 
    ? tierConfig.monthlyPrice 
    : (subscription.monthlyPrice || 0);
  
  const pkgInfo = subscription.projectPackage 
    ? PACKAGES.find((pkg) => pkg.id === subscription.projectPackage)
    : null;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleManageSubscription = async () => {
    // Redirect to Stripe billing portal
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: subscription.projectId }),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to open billing portal' }));
        console.error('Failed to open billing portal:', errorData.error);
        await dialog.alert(errorData.error || 'Failed to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      await dialog.alert('Failed to open billing portal. Please try again.');
    }
  };

  const handleAddToCalendar = async () => {
    if (!subscription.currentPeriodEnd) {
      await dialog.alert('No billing date available for this subscription.');
      return;
    }

    setAddingToCalendar(true);
    try {
      const response = await fetch('/api/client/calendar/add-billing-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          projectId: subscription.projectId,
          billingDate: subscription.currentPeriodEnd,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await dialog.alert('✅ ' + (data.message || 'Billing date added to calendar successfully!'));
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add to calendar' }));
        if (errorData.error?.includes('already added')) {
          await dialog.alert('ℹ️ ' + errorData.error);
        } else {
          await dialog.alert('❌ ' + (errorData.error || 'Failed to add billing date to calendar. Please try again.'));
        }
      }
    } catch (error) {
      console.error('Failed to add to calendar:', error);
      await dialog.alert('❌ Failed to add billing date to calendar. Please try again.');
    } finally {
      setAddingToCalendar(false);
    }
  };

  return (
    <div className="bg-gray-900/40 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">{subscription.projectName}</h3>
            <p className="text-sm text-gray-400">{subscription.planName}</p>
            {pkgInfo && (
              <div className="flex items-center gap-2 mt-2">
                <Package className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400">
                  {pkgInfo.icon} {pkgInfo.title} Package
                </span>
              </div>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              STATUS_COLORS[subscription.status] || STATUS_COLORS.incomplete
            }`}
          >
            {STATUS_LABELS[subscription.status] || subscription.status}
          </span>
        </div>

        <div className="space-y-2">
          {monthlyPrice > 0 && (
            <div className="text-2xl font-bold text-white">
              {formatCurrency(monthlyPrice)}/mo
            </div>
          )}
          {subscription.isAddon && subscription.additionalCost && subscription.additionalCost > 0 && (
            <div className="text-sm text-gray-400">
              + {formatCurrency(subscription.additionalCost)}/mo addon
            </div>
          )}
          {subscription.projectTotalPaid && subscription.projectTotalPaid > 0 && (
            <div className="text-xs text-gray-500">
              Total paid: {formatCurrency(subscription.projectTotalPaid)}
            </div>
          )}
        </div>
      </div>

      {/* Billing Info */}
      <div className="p-6 border-b border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-400">Next Billing Date</div>
            <div className="text-white font-medium">{formatDate(subscription.currentPeriodEnd)}</div>
          </div>
          {subscription.currentPeriodEnd && (
            <button
              onClick={handleAddToCalendar}
              disabled={addingToCalendar}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              title="Add to calendar"
            >
              <CalendarPlus className="w-3 h-3" />
              {addingToCalendar ? 'Adding...' : 'Add to Calendar'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-400">Hosting & Maintenance</div>
            <div className="text-white font-medium">
              {subscription.tierName || subscription.planName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-400">Subscription ID</div>
            <div className="text-white font-mono text-sm">{subscription.stripeId.substring(0, 20)}...</div>
          </div>
        </div>
      </div>

      {/* Change Requests - Unlimited, tied to hours */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-white">Change Requests</span>
          </div>
          <div className="text-sm">
            <span className="font-bold text-green-400">Unlimited</span>
            <span className="text-gray-400"> (tied to available hours)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          As long as you have support hours available, you can submit change requests.
        </p>

        {subscription.resetDate && (
          <div className="text-xs text-gray-500">
            Resets on {formatDate(subscription.resetDate)}
          </div>
        )}

        {/* Toggle Change Requests History */}
        {subscription.changeRequests.length > 0 && (
          <button
            onClick={() => setShowChangeRequests(!showChangeRequests)}
            className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showChangeRequests ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Request History
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View Request History ({subscription.changeRequests.length})
              </>
            )}
          </button>
        )}

        {/* Change Requests List */}
        {showChangeRequests && subscription.changeRequests.length > 0 && (
          <div className="mt-4 space-y-2">
            {subscription.changeRequests.map((cr) => (
              <div
                key={cr.id}
                className="bg-gray-800/50 border border-white/5 rounded-lg p-3 text-sm"
              >
                <div className="flex items-start gap-2">
                  {CHANGE_REQUEST_STATUS_ICONS[cr.status]}
                  <div className="flex-1">
                    <div className="text-white">{cr.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(cr.createdAt)}
                      {cr.status === 'completed' && cr.completedAt && (
                        <> • Completed {formatDate(cr.completedAt)}</>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 capitalize">
                    {cr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3">
        <button
          onClick={handleManageSubscription}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Manage Subscription
        </button>
        
        {subscription.status === 'active' && subscription.stripeId && (
          <button
            onClick={async () => {
              const confirmed = await dialog.confirm('Are you sure you want to cancel your subscription? You\'ll continue to have access until the end of your current billing period.', {
                title: 'Cancel Subscription',
                variant: 'warning',
              });
              if (confirmed) {
                try {
                  const response = await fetch('/api/client/maintenance-plans/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    await dialog.alert('✅ ' + result.message);
                    window.location.reload();
                  } else {
                    const error = await response.json().catch(() => ({ error: 'Failed to cancel subscription' }));
                    await dialog.alert('❌ ' + (error.error || 'Failed to cancel subscription'));
                  }
                } catch (error) {
                  console.error('Cancel subscription error:', error);
                  await dialog.alert('❌ Failed to cancel subscription. Please try again.');
                }
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
}




