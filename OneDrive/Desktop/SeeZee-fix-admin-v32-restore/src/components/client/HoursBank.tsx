'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Package, 
  RefreshCw,
  Zap,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface RolloverInfo {
  hours: number;
  expiresAt: string;
  daysUntilExpiry: number;
}

interface PackInfo {
  packId: string;
  packName: string;
  hours: number;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
}

interface HoursBankProps {
  // Monthly hours
  monthlyIncluded: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  
  // Rollover hours
  rolloverTotal: number;
  rolloverExpiringSoon?: RolloverInfo[];
  
  // Hour packs
  packHoursTotal: number;
  packHoursExpiringSoon?: PackInfo[];
  
  // Totals
  totalAvailable: number;
  estimatedHoursPending?: number; // Hours estimated in pending project requests
  estimatedRemaining?: number; // Hours remaining after pending requests are completed
  
  // Status
  isUnlimited: boolean;
  atLimit: boolean;
  isOverage: boolean;
  overageHours: number;
  
  // Change requests
  changeRequestsIncluded: number;
  changeRequestsUsed: number;
  changeRequestsRemaining: number;
  
  // Plan info
  tierName: string;
  periodEnd?: string;
  
  // On-demand status
  onDemandEnabled?: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatHours(hours: number): string {
  if (hours === -1) return '∞';
  if (hours === 0) return '0';
  if (Number.isInteger(hours)) return hours.toString();
  return hours.toFixed(1);
}

function getProgressColor(percent: number): string {
  if (percent >= 100) return 'bg-red-500';
  if (percent >= 80) return 'bg-yellow-500';
  return 'bg-gradient-to-r from-cyan-400 to-blue-500';
}

function getStatusColor(atLimit: boolean, isOverage: boolean, percent: number): string {
  if (isOverage) return 'text-red-400';
  if (atLimit) return 'text-red-400';
  if (percent >= 80) return 'text-yellow-400';
  return 'text-green-400';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HoursBank({
  monthlyIncluded,
  monthlyUsed,
  monthlyRemaining,
  rolloverTotal,
  rolloverExpiringSoon = [],
  packHoursTotal,
  packHoursExpiringSoon = [],
  totalAvailable,
  estimatedHoursPending,
  estimatedRemaining,
  isUnlimited,
  atLimit,
  isOverage,
  overageHours,
  changeRequestsIncluded,
  changeRequestsUsed,
  changeRequestsRemaining,
  tierName,
  periodEnd,
  onDemandEnabled,
}: HoursBankProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const usagePercent = isUnlimited ? 0 : monthlyIncluded > 0 
    ? Math.min(100, (monthlyUsed / monthlyIncluded) * 100) 
    : 0;
  
  const hasExpiringSoon = (rolloverExpiringSoon?.length ?? 0) > 0 || (packHoursExpiringSoon?.length ?? 0) > 0;
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Hours Balance</h3>
              <p className="text-sm text-gray-400">{tierName} Plan</p>
            </div>
          </div>
          
          {!isUnlimited && (
            <div className={`text-right ${getStatusColor(atLimit, isOverage, usagePercent)}`}>
              <p className="text-3xl font-bold">
                {estimatedRemaining !== undefined ? formatHours(estimatedRemaining) : formatHours(totalAvailable)}
              </p>
              <p className="text-xs opacity-80">
                {estimatedRemaining !== undefined && estimatedHoursPending && estimatedHoursPending > 0
                  ? 'estimated remaining'
                  : 'hours available'}
              </p>
              {estimatedHoursPending && estimatedHoursPending > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatHours(estimatedHoursPending)}h in pending requests
                </p>
              )}
            </div>
          )}
          
          {isUnlimited && (
            <div className="text-right text-purple-400">
              <p className="text-3xl font-bold">∞</p>
              <p className="text-xs opacity-80">Unlimited</p>
            </div>
          )}
        </div>
        
        {/* Main Progress Bar */}
        {!isUnlimited && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Monthly Usage</span>
              <span>
                {formatHours(monthlyUsed)} / {formatHours(monthlyIncluded)} hours
              </span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, usagePercent)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full ${getProgressColor(usagePercent)} transition-all`}
              />
            </div>
            {usagePercent >= 80 && usagePercent < 100 && (
              <p className="text-xs text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                You've used 80% of your monthly hours
              </p>
            )}
            {atLimit && !isOverage && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Monthly limit reached
              </p>
            )}
            {isOverage && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {formatHours(overageHours)} overage hours used
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Balance Breakdown */}
      {!isUnlimited && (
        <div className="p-6 grid grid-cols-3 gap-4">
          {/* Monthly */}
          <div className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-2">
              <p className="text-2xl font-bold text-blue-400">
                {formatHours(monthlyRemaining)}
              </p>
            </div>
            <p className="text-xs text-gray-400">Monthly</p>
          </div>
          
          {/* Rollover */}
          <div className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 mb-2 relative">
              <p className="text-2xl font-bold text-purple-400">
                {formatHours(rolloverTotal)}
              </p>
              {(rolloverExpiringSoon?.length ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              )}
            </div>
            <p className="text-xs text-gray-400">Rollover</p>
          </div>
          
          {/* Packs */}
          <div className="text-center">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 mb-2 relative">
              <p className="text-2xl font-bold text-green-400">
                {formatHours(packHoursTotal)}
              </p>
              {(packHoursExpiringSoon?.length ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              )}
            </div>
            <p className="text-xs text-gray-400">Packs</p>
          </div>
        </div>
      )}
      
      {/* Expiring Hours Warning */}
      {hasExpiringSoon && (
        <div className="px-6 pb-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-400 mb-2">Hours Expiring Soon</p>
                <div className="space-y-1 text-xs text-yellow-200/80">
                  {rolloverExpiringSoon?.map((r, i) => (
                    <p key={`rollover-${i}`}>
                      {formatHours(r.hours)} rollover hours expire in {r.daysUntilExpiry} days
                    </p>
                  ))}
                  {packHoursExpiringSoon?.map((p) => (
                    <p key={p.packId}>
                      {formatHours(p.hours)} from {p.packName} expire in {p.daysUntilExpiry} days
                    </p>
                  ))}
                </div>
                <Link 
                  href="/client/requests/new"
                  className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 mt-2"
                >
                  Use hours now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Expand Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-6 py-3 border-t border-white/10 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        {showDetails ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            View Details
          </>
        )}
      </button>
      
      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/10"
        >
          <div className="p-6 space-y-4">
            {/* Period Info */}
            {periodEnd && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Period Ends
                </span>
                <span className="text-white">
                  {new Date(periodEnd).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {/* On-Demand Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                On-Demand Billing
              </span>
              <span className={onDemandEnabled ? 'text-green-400' : 'text-gray-500'}>
                {onDemandEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            {/* Rollover Details */}
            {rolloverTotal > 0 && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Rollover Hours
                </h4>
                <div className="space-y-2">
                  {(rolloverExpiringSoon?.length ?? 0) > 0 ? (
                    rolloverExpiringSoon?.map((r, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          Expires {new Date(r.expiresAt).toLocaleDateString()}
                        </span>
                        <span className="text-purple-400">
                          {formatHours(r.hours)} hrs
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No rollover hours expiring soon</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Hour Packs */}
            {packHoursTotal > 0 && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-400" />
                  Hour Packs
                </h4>
                <div className="space-y-2">
                  {(packHoursExpiringSoon?.length ?? 0) > 0 ? (
                    packHoursExpiringSoon?.map((p) => (
                      <div key={p.packId} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {p.packName} 
                          {p.expiresAt && ` - expires ${new Date(p.expiresAt).toLocaleDateString()}`}
                          {!p.expiresAt && ' - Never expires'}
                        </span>
                        <span className="text-green-400">
                          {formatHours(p.hours)} hrs
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No active hour packs</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <Link
                href="/client/hours"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg text-center hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                Purchase Hours
              </Link>
              <Link
                href="/client/settings/billing"
                className="flex-1 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg text-center hover:bg-white/20 transition-colors"
              >
                Manage Plan
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default HoursBank;
