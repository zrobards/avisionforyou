"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Pause,
  Play,
  X,
  ExternalLink,
  Clock,
  Zap,
  Crown,
} from "lucide-react";

interface MaintenancePlan {
  id: string;
  tier: string;
  monthlyPrice: number;
  status: string;
  hoursIncluded?: number;
  hoursUsed?: number;
  project: {
    name: string;
    organization: { name: string };
  };
}

interface SubscriptionsTableProps {
  subscriptions: MaintenancePlan[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const tierConfig: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
  basic: { icon: Clock, color: "text-blue-400 bg-blue-500/20", label: "Basic" },
  BASIC: { icon: Clock, color: "text-blue-400 bg-blue-500/20", label: "Basic" },
  standard: { icon: Zap, color: "text-yellow-400 bg-yellow-500/20", label: "Standard" },
  STANDARD: { icon: Zap, color: "text-yellow-400 bg-yellow-500/20", label: "Standard" },
  premium: { icon: Crown, color: "text-purple-400 bg-purple-500/20", label: "Premium" },
  PREMIUM: { icon: Crown, color: "text-purple-400 bg-purple-500/20", label: "Premium" },
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  PAUSED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handlePause = async (planId: string) => {
    try {
      await fetch(`/api/admin/maintenance/${planId}/pause`, { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to pause subscription:", error);
    }
    setOpenMenuId(null);
  };

  const handleResume = async (planId: string) => {
    try {
      await fetch(`/api/admin/maintenance/${planId}/resume`, { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to resume subscription:", error);
    }
    setOpenMenuId(null);
  };

  const handleCancel = async (planId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    try {
      await fetch(`/api/admin/maintenance/${planId}/cancel`, { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    }
    setOpenMenuId(null);
  };

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-700 bg-[#151b2e] p-12 text-center">
        <p className="text-gray-400">No active subscriptions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((plan, index) => {
        const tier = tierConfig[plan.tier] || tierConfig.basic;
        const TierIcon = tier.icon;
        const hoursUsed = plan.hoursUsed || 0;
        const hoursIncluded = plan.hoursIncluded || 2;
        const usagePercent = (hoursUsed / hoursIncluded) * 100;

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-5 hover:border-trinity-red/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${tier.color}`}>
                  <TierIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {plan.project.organization.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        statusStyles[plan.status] || statusStyles.ACTIVE
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{plan.project.name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {tier.label} Plan
                    </span>
                    <span className="text-xs text-gray-500">
                      {currencyFormatter.format(plan.monthlyPrice)}/mo
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Hours Usage */}
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {hoursUsed} / {hoursIncluded} hrs
                  </p>
                  <div className="w-24 h-2 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 90
                          ? "bg-red-500"
                          : usagePercent > 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === plan.id ? null : plan.id)
                    }
                    className="p-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>

                  {openMenuId === plan.id && (
                    <div className="absolute right-0 mt-2 w-40 rounded-lg border-2 border-gray-700 bg-[#151b2e] shadow-xl z-10">
                      {plan.status === "ACTIVE" ? (
                        <button
                          onClick={() => handlePause(plan.id)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-[#1a2235] transition"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      ) : plan.status === "PAUSED" ? (
                        <button
                          onClick={() => handleResume(plan.id)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-[#1a2235] transition"
                        >
                          <Play className="w-4 h-4" />
                          Resume
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleCancel(plan.id)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#1a2235] transition"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default SubscriptionsTable;








