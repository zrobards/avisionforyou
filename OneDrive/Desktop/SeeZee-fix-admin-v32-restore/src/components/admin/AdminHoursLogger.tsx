'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Check, 
  X, 
  AlertTriangle, 
  DollarSign,
  ChevronDown,
  Save,
  RefreshCw,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

type HoursSource = 'MONTHLY' | 'ROLLOVER' | 'PACK' | 'OVERAGE' | 'COMPLIMENTARY';

interface HoursLogFormData {
  actualHours: number;
  source: HoursSource;
  notes: string;
  isComplimentary: boolean;
}

interface ChangeRequestSummary {
  id: string;
  title: string;
  estimatedHours: number;
  status: string;
  clientName: string;
  tierName: string;
}

interface ClientHoursBalance {
  monthlyRemaining: number;
  rolloverTotal: number;
  packHoursTotal: number;
  totalAvailable: number;
  onDemandEnabled: boolean;
  hourlyOverageRate: number;
}

interface AdminHoursLoggerProps {
  changeRequest: ChangeRequestSummary;
  clientBalance: ClientHoursBalance;
  onSave: (data: HoursLogFormData) => Promise<void>;
  onCancel: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const HOURS_SOURCES: { value: HoursSource; label: string; description: string; color: string }[] = [
  { 
    value: 'MONTHLY', 
    label: 'Monthly Hours', 
    description: 'Deduct from included monthly hours',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  { 
    value: 'ROLLOVER', 
    label: 'Rollover Hours', 
    description: 'Deduct from rolled-over hours',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  { 
    value: 'PACK', 
    label: 'Hour Pack', 
    description: 'Deduct from purchased hour packs',
    color: 'text-green-400 bg-green-500/10 border-green-500/30',
  },
  { 
    value: 'OVERAGE', 
    label: 'On-Demand (Overage)', 
    description: 'Bill at hourly overage rate',
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  },
  { 
    value: 'COMPLIMENTARY', 
    label: 'Complimentary', 
    description: 'No charge - goodwill or correction',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatHours(hours: number): string {
  if (Number.isInteger(hours)) return hours.toString();
  return hours.toFixed(1);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getRecommendedSource(hours: number, balance: ClientHoursBalance): HoursSource {
  // FIFO priority: Monthly → Rollover → Packs → Overage
  if (balance.monthlyRemaining >= hours) return 'MONTHLY';
  if (balance.rolloverTotal >= hours) return 'ROLLOVER';
  if (balance.packHoursTotal >= hours) return 'PACK';
  if (balance.onDemandEnabled) return 'OVERAGE';
  return 'MONTHLY'; // Fallback, would need adjustment
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AdminHoursLogger({
  changeRequest,
  clientBalance,
  onSave,
  onCancel,
}: AdminHoursLoggerProps) {
  const [formData, setFormData] = useState<HoursLogFormData>({
    actualHours: changeRequest.estimatedHours || 1,
    source: getRecommendedSource(changeRequest.estimatedHours || 1, clientBalance),
    notes: '',
    isComplimentary: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  
  const selectedSource = HOURS_SOURCES.find(s => s.value === formData.source);
  const overageAmount = formData.source === 'OVERAGE' 
    ? formData.actualHours * clientBalance.hourlyOverageRate 
    : 0;
  
  const hoursDifference = formData.actualHours - (changeRequest.estimatedHours || 0);
  const isOverEstimate = hoursDifference < 0;
  const isUnderEstimate = hoursDifference > 0;
  
  const willExceedBalance = formData.actualHours > clientBalance.totalAvailable && 
    formData.source !== 'OVERAGE' && 
    formData.source !== 'COMPLIMENTARY';
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Log Hours</h3>
              <p className="text-xs text-gray-400">{changeRequest.title}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Client Balance Summary */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <p className="text-xs text-gray-400 mb-2">{changeRequest.clientName} • {changeRequest.tierName}</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-blue-400">{formatHours(clientBalance.monthlyRemaining)}</p>
            <p className="text-xs text-gray-500">Monthly</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-400">{formatHours(clientBalance.rolloverTotal)}</p>
            <p className="text-xs text-gray-500">Rollover</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-400">{formatHours(clientBalance.packHoursTotal)}</p>
            <p className="text-xs text-gray-500">Packs</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{formatHours(clientBalance.totalAvailable)}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Estimated vs Actual */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Estimated</label>
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center">
              {formatHours(changeRequest.estimatedHours || 0)}h
            </div>
          </div>
          <div className="text-gray-500 pt-5">→</div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Actual Hours</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={formData.actualHours}
              onChange={(e) => setFormData({ 
                ...formData, 
                actualHours: parseFloat(e.target.value) || 0,
                source: getRecommendedSource(parseFloat(e.target.value) || 0, clientBalance),
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>
        
        {/* Variance Indicator */}
        {(isOverEstimate || isUnderEstimate) && (
          <div className={`flex items-center gap-2 text-xs ${
            isOverEstimate ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {isOverEstimate ? (
              <Check className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            <span>
              {isOverEstimate 
                ? `Completed ${Math.abs(hoursDifference).toFixed(1)}h faster than estimated`
                : `Took ${hoursDifference.toFixed(1)}h longer than estimated`
              }
            </span>
          </div>
        )}
        
        {/* Hours Source Selector */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Deduct From</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSourceDropdown(!showSourceDropdown)}
              className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between ${selectedSource?.color || 'bg-white/5 border-white/10'}`}
            >
              <div>
                <p className="text-sm font-medium text-white">{selectedSource?.label}</p>
                <p className="text-xs text-gray-400">{selectedSource?.description}</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showSourceDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl"
              >
                {HOURS_SOURCES.map((source) => (
                  <button
                    key={source.value}
                    type="button"
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        source: source.value,
                        isComplimentary: source.value === 'COMPLIMENTARY',
                      });
                      setShowSourceDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 ${
                      formData.source === source.value ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      source.value === 'MONTHLY' ? 'bg-blue-400' :
                      source.value === 'ROLLOVER' ? 'bg-purple-400' :
                      source.value === 'PACK' ? 'bg-green-400' :
                      source.value === 'OVERAGE' ? 'bg-yellow-400' :
                      'bg-cyan-400'
                    }`} />
                    <div>
                      <p className="text-sm text-white">{source.label}</p>
                      <p className="text-xs text-gray-400">{source.description}</p>
                    </div>
                    {formData.source === source.value && (
                      <Check className="w-4 h-4 text-cyan-400 ml-auto" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Warnings */}
        {willExceedBalance && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-red-400 font-medium">Exceeds Client Balance</p>
                <p className="text-red-300/80 text-xs mt-0.5">
                  Client only has {formatHours(clientBalance.totalAvailable)} hours available.
                  Consider using Overage or Complimentary.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Overage Amount */}
        {formData.source === 'OVERAGE' && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Overage Amount</span>
              </div>
              <span className="text-lg font-bold text-white">
                {formatCurrency(overageAmount)}
              </span>
            </div>
            <p className="text-xs text-yellow-300/80 mt-1">
              {formatHours(formData.actualHours)} hours × ${clientBalance.hourlyOverageRate}/hour
            </p>
          </div>
        )}
        
        {/* Notes */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any notes about the work performed..."
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
          />
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (willExceedBalance && formData.source !== 'COMPLIMENTARY')}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Log Hours
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminHoursLogger;
