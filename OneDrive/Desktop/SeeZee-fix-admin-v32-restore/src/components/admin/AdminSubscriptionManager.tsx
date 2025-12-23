"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  MoreVertical, 
  Pause, 
  Play, 
  X, 
  Edit, 
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface MaintenancePlan {
  id: string;
  status: string;
  tier: string | null;
  monthlyPrice: number | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  currentPeriodStart: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
    organization: {
      id: string;
      name: string | null;
      members: Array<{
        user: {
          id: string;
          name: string | null;
          email: string | null;
        };
      }>;
    };
  };
}

interface Subscription {
  id: string;
  status: string;
  price: number | null;
  stripeId: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
    organization: {
      id: string;
      name: string | null;
      members: Array<{
        user: {
          id: string;
          name: string | null;
          email: string | null;
        };
      }>;
    };
  };
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  cancelled: number;
  pastDue: number;
  totalMonthlyRevenue: number;
}

interface AdminSubscriptionManagerProps {
  maintenancePlans: MaintenancePlan[];
  subscriptions: Subscription[];
  stats: Stats;
  currentUser: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  past_due: "bg-red-500/20 text-red-400 border-red-500/30",
  canceled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function AdminSubscriptionManager({
  maintenancePlans,
  subscriptions,
  stats,
  currentUser,
}: AdminSubscriptionManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "$0.00";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAction = async (planId: string, action: 'pause' | 'resume' | 'cancel' | 'modify') => {
    if (!confirm(`Are you sure you want to ${action} this subscription?`)) return;
    
    setActionLoading(planId);
    try {
      const response = await fetch(`/api/admin/subscriptions/${planId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} subscription`);
      }

      alert(`✅ Subscription ${action}d successfully!`);
      window.location.reload();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Combine all subscriptions
  const allSubscriptions = [
    ...maintenancePlans.map(plan => ({
      id: plan.id,
      type: 'maintenance' as const,
      status: plan.status,
      price: plan.monthlyPrice,
      stripeId: plan.stripeSubscriptionId,
      currentPeriodEnd: plan.currentPeriodEnd,
      createdAt: plan.createdAt,
      tier: plan.tier,
      project: plan.project,
    })),
    ...subscriptions.map(sub => ({
      id: sub.id,
      type: 'legacy' as const,
      status: sub.status,
      price: sub.price,
      stripeId: sub.stripeId,
      currentPeriodEnd: sub.currentPeriodEnd,
      createdAt: sub.createdAt,
      tier: null,
      project: sub.project,
    })),
  ];

  // Filter subscriptions
  const filteredSubscriptions = allSubscriptions.filter(sub => {
    const matchesSearch = 
      sub.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.project.organization.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.project.organization.members.some(m => 
        m.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getClientEmail = (sub: typeof allSubscriptions[0]) => {
    return sub.project.organization.members[0]?.user.email || 'N/A';
  };

  const getClientName = (sub: typeof allSubscriptions[0]) => {
    return sub.project.organization.members[0]?.user.name || 
           sub.project.organization.name || 
           'Unknown Client';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-purple-400" />
            Subscription Manager
          </h1>
          <p className="text-gray-400">
            Manage all client subscriptions and billing
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Subscriptions</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Active</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.active}</div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Pending</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Monthly Revenue</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {formatCurrency(stats.totalMonthlyRevenue)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client, project, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-900/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="past_due">Past Due</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-gray-900/40 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Client / Project
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Type / Tier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Monthly Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Stripe ID
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{sub.project.name}</div>
                        <div className="text-sm text-gray-400">
                          {getClientName(sub)} • {getClientEmail(sub)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {sub.type === 'maintenance' ? 'Maintenance Plan' : 'Legacy Subscription'}
                        </div>
                        {sub.tier && (
                          <div className="text-gray-400">{sub.tier}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        statusColors[sub.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {formatCurrency(sub.price)}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {formatDate(sub.currentPeriodEnd)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-gray-400">
                        {sub.stripeId ? (
                          <a
                            href={`https://dashboard.stripe.com/subscriptions/${sub.stripeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {sub.stripeId.substring(0, 20)}...
                          </a>
                        ) : (
                          'No Stripe ID'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Link
                          href={`/admin/pipeline/projects/${sub.project.id}`}
                          className="px-2 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          View
                        </Link>
                        {sub.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleAction(sub.id, 'pause')}
                            disabled={actionLoading === sub.id}
                            className="px-2 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                            title="Pause subscription"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {sub.status === 'PENDING' && (
                          <button
                            onClick={() => handleAction(sub.id, 'resume')}
                            disabled={actionLoading === sub.id}
                            className="px-2 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                            title="Activate subscription"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(sub.id, 'cancel')}
                          disabled={actionLoading === sub.id}
                          className="px-2 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                          title="Cancel subscription"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

