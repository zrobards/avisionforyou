'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Package, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface Subscription {
  id: string;
  tier: string;
  status: string;
  monthlyPrice: number;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  project: {
    id: string;
    name: string;
  };
  organization: {
    id: string;
    name: string;
    members: Array<{
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string | null;
      };
    }>;
  };
}

interface HourPack {
  id: string;
  packType: string;
  hours: number;
  hoursRemaining: number;
  cost: number;
  purchasedAt: Date;
  expiresAt: Date | null;
  neverExpires: boolean;
  isActive: boolean;
  project: {
    id: string;
    name: string;
  };
  organization: {
    id: string;
    name: string;
    members: Array<{
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string | null;
      };
    }>;
  };
}

interface SubscriptionPayment {
  id: string;
  number: string;
  amount: number;
  total: number;
  paidAt: Date | null;
  project: {
    id: string;
    name: string;
  } | null;
  organization: {
    id: string;
    name: string;
    members: Array<{
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string | null;
      };
    }>;
  };
}

interface PurchasesClientProps {
  subscriptions: Subscription[];
  hourPacks: HourPack[];
  subscriptionPayments: SubscriptionPayment[];
}

const packNames: Record<string, string> = {
  SMALL: 'Starter Pack',
  MEDIUM: 'Growth Pack',
  LARGE: 'Scale Pack',
  PREMIUM: 'Premium Reserve',
};

const tierNames: Record<string, string> = {
  ESSENTIALS: 'Nonprofit Essentials',
  DIRECTOR: 'Digital Director Platform',
  COO: 'Digital COO System',
};

export default function PurchasesClient({
  subscriptions,
  hourPacks,
  subscriptionPayments,
}: PurchasesClientProps) {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'hour-packs' | 'payments'>('subscriptions');

  const totalRevenue = subscriptionPayments.reduce((sum, p) => sum + p.total, 0);
  const totalHourPackRevenue = hourPacks.reduce((sum, p) => sum + (p.cost / 100), 0);
  const monthlyRecurringRevenue = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (s.monthlyPrice / 100), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Purchases & Subscriptions</h1>
        <p className="text-gray-400">View all customer subscriptions, purchases, and payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">MRR</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(monthlyRecurringRevenue)}</div>
          <div className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</div>
        </div>
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue + totalHourPackRevenue)}</div>
          <div className="text-xs text-gray-500 mt-1">All-time payments</div>
        </div>
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">Active Subscriptions</span>
          </div>
          <div className="text-2xl font-bold text-white">{subscriptions.filter(s => s.status === 'ACTIVE').length}</div>
          <div className="text-xs text-gray-500 mt-1">Currently active</div>
        </div>
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Hour Packs</span>
          </div>
          <div className="text-2xl font-bold text-white">{hourPacks.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total purchases</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('hour-packs')}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'hour-packs'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Hour Packs ({hourPacks.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Payments ({subscriptionPayments.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden">
        {activeTab === 'subscriptions' && (
          <div className="divide-y divide-white/10">
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No subscriptions found</div>
            ) : (
              subscriptions.map((sub) => (
                <div key={sub.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {tierNames[sub.tier] || sub.tier}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sub.status === 'ACTIVE' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Organization</div>
                          <div className="text-white font-medium">{sub.organization.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Project</div>
                          <Link 
                            href={`/admin/projects/${sub.project.id}`}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            {sub.project.name}
                          </Link>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Monthly Price</div>
                          <div className="text-white font-medium">{formatCurrency(sub.monthlyPrice / 100)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Next Billing</div>
                          <div className="text-white font-medium">{formatDate(sub.currentPeriodEnd)}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-gray-500">
                          Customer: {sub.organization.members[0]?.user.name || sub.organization.members[0]?.user.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'hour-packs' && (
          <div className="divide-y divide-white/10">
            {hourPacks.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hour packs found</div>
            ) : (
              hourPacks.map((pack) => (
                <div key={pack.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {packNames[pack.packType] || pack.packType}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          pack.isActive 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {pack.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Organization</div>
                          <div className="text-white font-medium">{pack.organization.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Project</div>
                          <Link 
                            href={`/admin/projects/${pack.project.id}`}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            {pack.project.name}
                          </Link>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Cost</div>
                          <div className="text-white font-medium">{formatCurrency(pack.cost / 100)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Hours</div>
                          <div className="text-white font-medium">{pack.hoursRemaining}/{pack.hours}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Purchased</div>
                          <div className="text-white font-medium">{formatDate(pack.purchasedAt)}</div>
                        </div>
                      </div>
                      {pack.expiresAt && !pack.neverExpires && (
                        <div className="mt-2 text-xs text-gray-500">
                          Expires: {formatDate(pack.expiresAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="divide-y divide-white/10">
            {subscriptionPayments.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No payments found</div>
            ) : (
              subscriptionPayments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          Invoice {payment.number}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          Paid
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Organization</div>
                          <div className="text-white font-medium">{payment.organization.name}</div>
                        </div>
                        {payment.project && (
                          <div>
                            <div className="text-gray-400 mb-1">Project</div>
                            <Link 
                              href={`/admin/projects/${payment.project.id}`}
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              {payment.project.name}
                            </Link>
                          </div>
                        )}
                        <div>
                          <div className="text-gray-400 mb-1">Amount</div>
                          <div className="text-white font-medium">{formatCurrency(payment.total)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Paid Date</div>
                          <div className="text-white font-medium">{formatDate(payment.paidAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}





