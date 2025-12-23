'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  CreditCard, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Check,
  RefreshCw,
  Zap,
  Shield,
  TrendingUp,
  Calendar,
  Info,
  ChevronRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/stores/useToast';

// =============================================================================
// TYPES
// =============================================================================

interface BillingSettings {
  // On-demand settings
  onDemandEnabled: boolean;
  dailySpendCap: number;
  monthlySpendCap: number;
  dailyRequestLimit: number;
  urgentRequestsPerWeek: number;
  
  // Rollover settings
  rolloverEnabled: boolean;
  
  // Notifications
  notifyAt80Percent: boolean;
  notifyAt2Hours: boolean;
  notifyBeforeOverage: boolean;
  notifyRolloverExpiring: boolean;
  
  // Payment
  autoPayEnabled: boolean;
}

interface PlanInfo {
  tierName: string;
  monthlyPrice: number;
  hoursIncluded: number;
  changeRequestsIncluded: number;
  isUnlimited: boolean;
  periodStart: string;
  periodEnd: string;
}

// Default settings - will be replaced by API data
const DEFAULT_SETTINGS: BillingSettings = {
  onDemandEnabled: false,
  dailySpendCap: 500,
  monthlySpendCap: 2000,
  dailyRequestLimit: 3,
  urgentRequestsPerWeek: 2,
  rolloverEnabled: true,
  notifyAt80Percent: true,
  notifyAt2Hours: true,
  notifyBeforeOverage: true,
  notifyRolloverExpiring: true,
  autoPayEnabled: false,
};

const DEFAULT_PLAN: PlanInfo = {
  tierName: 'Director',
  monthlyPrice: 750,
  hoursIncluded: 10,
  changeRequestsIncluded: -1, // unlimited
  isUnlimited: false,
  periodStart: new Date().toISOString(),
  periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// =============================================================================
// COMPONENTS
// =============================================================================

function Toggle({ 
  enabled, 
  onChange,
  disabled = false,
}: { 
  enabled: boolean; 
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-cyan-500' : 'bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
      />
    </button>
  );
}

function SettingRow({ 
  icon: Icon, 
  title, 
  description, 
  children,
  warning,
}: { 
  icon: React.ElementType;
  title: string; 
  description: string;
  children: React.ReactNode;
  warning?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-white/5 last:border-0">
      <div className="flex gap-4">
        <div className="p-2 bg-white/5 rounded-lg h-fit">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-white">{title}</h4>
          <p className="text-xs text-gray-400 mt-0.5 max-w-sm">{description}</p>
          {warning && (
            <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {warning}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}

function SpendCapInput({ 
  value, 
  onChange, 
  min = 0,
  max = 10000,
  step = 100,
}: { 
  value: number; 
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">$</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
        min={min}
        max={max}
        step={step}
        className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      />
    </div>
  );
}

function NumberInput({ 
  value, 
  onChange, 
  min = 0,
  max = 100,
  suffix,
}: { 
  value: number; 
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
        min={min}
        max={max}
        className="w-16 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      />
      {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
    </div>
  );
}

function PlanCard({ plan }: { plan: PlanInfo }) {
  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Current Plan</p>
          <h3 className="text-2xl font-bold text-white mt-1">{plan.tierName}</h3>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">${plan.monthlyPrice}</p>
          <p className="text-xs text-gray-400">/month</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-400">Hours Included</p>
          <p className="text-lg font-bold text-white">
            {plan.isUnlimited ? '∞' : plan.hoursIncluded}
          </p>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-400">Change Requests</p>
          <p className="text-lg font-bold text-white">
            {plan.changeRequestsIncluded === -1 ? '∞' : plan.changeRequestsIncluded}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>Current Period</span>
        <span>
          {new Date(plan.periodStart).toLocaleDateString()} - {new Date(plan.periodEnd).toLocaleDateString()}
        </span>
      </div>
      
      <div className="flex gap-3">
        <Link
          href="/client/upgrade"
          className="flex-1 py-2 px-4 bg-white/10 text-white text-sm font-medium rounded-lg text-center hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Upgrade Plan
        </Link>
        <Link
          href="/client/invoices"
          className="py-2 px-4 bg-white/5 text-gray-300 text-sm rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Invoices
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<BillingSettings>(DEFAULT_SETTINGS);
  const [plan, setPlan] = useState<PlanInfo>(DEFAULT_PLAN);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  
  // Fetch billing settings on mount
  useEffect(() => {
    fetchBillingSettings();
  }, []);
  
  const fetchBillingSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/client/billing/settings');
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No active maintenance plan found. Please contact support to set up a plan.');
        } else {
          throw new Error('Failed to fetch billing settings');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.plan) {
        setPlan(data.plan);
      }
      
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error: any) {
      console.error('Failed to fetch billing settings:', error);
      setError(error.message || 'Failed to load billing settings');
      showToast('Failed to load billing settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateSetting = <K extends keyof BillingSettings>(key: K, value: BillingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/client/billing/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
      
      setHasChanges(false);
      showToast('Billing settings saved successfully', 'success');
      
      // Refresh data to ensure we have the latest
      await fetchBillingSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setError(error.message || 'Failed to save settings');
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading billing settings...</p>
        </div>
      </div>
    );
  }
  
  if (error && !plan) {
    return (
      <div className="min-h-screen bg-gray-950 py-8">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Error Loading Billing Settings</h3>
                <p className="text-gray-300">{error}</p>
                <button
                  onClick={fetchBillingSettings}
                  className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <Settings className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Billing & Hours Settings</h1>
              <p className="text-gray-400">Manage your plan, spending limits, and notifications</p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Plan Card */}
        <div className="mb-8">
          <PlanCard plan={plan} />
        </div>
        
        <div className="space-y-8">
          {/* On-Demand Billing Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">On-Demand Billing</h3>
                  <p className="text-sm text-gray-400">
                    Auto-bill overage hours at $75/hour when you exceed your included hours
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-0">
              <SettingRow
                icon={Zap}
                title="Enable On-Demand Billing"
                description="Allow automatic billing for hours beyond your monthly limit"
                warning={!settings.onDemandEnabled ? "Requests exceeding your limit will be blocked" : undefined}
              >
                <Toggle
                  enabled={settings.onDemandEnabled}
                  onChange={(value) => updateSetting('onDemandEnabled', value)}
                />
              </SettingRow>
              
              {settings.onDemandEnabled && (
                <>
                  <SettingRow
                    icon={DollarSign}
                    title="Daily Spend Cap"
                    description="Maximum on-demand charges per day"
                  >
                    <SpendCapInput
                      value={settings.dailySpendCap}
                      onChange={(value) => updateSetting('dailySpendCap', value)}
                      max={1000}
                    />
                  </SettingRow>
                  
                  <SettingRow
                    icon={DollarSign}
                    title="Monthly Spend Cap"
                    description="Maximum on-demand charges per billing period"
                  >
                    <SpendCapInput
                      value={settings.monthlySpendCap}
                      onChange={(value) => updateSetting('monthlySpendCap', value)}
                      max={10000}
                    />
                  </SettingRow>
                  
                  <SettingRow
                    icon={Clock}
                    title="Daily Request Limit"
                    description="Maximum on-demand requests per day"
                  >
                    <NumberInput
                      value={settings.dailyRequestLimit}
                      onChange={(value) => updateSetting('dailyRequestLimit', value)}
                      min={1}
                      max={10}
                      suffix="/day"
                    />
                  </SettingRow>
                  
                  <SettingRow
                    icon={AlertTriangle}
                    title="Urgent Requests per Week"
                    description="Maximum urgent-priority requests per week"
                  >
                    <NumberInput
                      value={settings.urgentRequestsPerWeek}
                      onChange={(value) => updateSetting('urgentRequestsPerWeek', value)}
                      min={0}
                      max={7}
                      suffix="/week"
                    />
                  </SettingRow>
                </>
              )}
            </div>
          </div>
          
          {/* Rollover Settings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Rollover Hours</h3>
                  <p className="text-sm text-gray-400">
                    Unused hours automatically roll over to the next billing period
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <SettingRow
                icon={RefreshCw}
                title="Enable Rollover"
                description="Automatically carry unused hours to next month (max 2x your monthly hours)"
              >
                <Toggle
                  enabled={settings.rolloverEnabled}
                  onChange={(value) => updateSetting('rolloverEnabled', value)}
                />
              </SettingRow>
              
              {settings.rolloverEnabled && (
                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium text-purple-400 mb-1">Rollover Rules</p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                        <li>Maximum rollover: 2x your monthly hours ({plan.hoursIncluded === -1 ? 'Unlimited' : plan.hoursIncluded * 2} hours)</li>
                        <li>Rollover hours expire after 60-90 days depending on your tier</li>
                        <li>Oldest rollover hours are used first (FIFO)</li>
                        <li>Rollover hours are used after your monthly hours</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <p className="text-sm text-gray-400">
                    Get notified about your hours usage and billing
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-0">
              <SettingRow
                icon={AlertTriangle}
                title="80% Usage Alert"
                description="Get notified when you've used 80% of your monthly hours"
              >
                <Toggle
                  enabled={settings.notifyAt80Percent}
                  onChange={(value) => updateSetting('notifyAt80Percent', value)}
                />
              </SettingRow>
              
              <SettingRow
                icon={Clock}
                title="Low Balance Alert"
                description="Get notified when you have 2 hours or less remaining"
              >
                <Toggle
                  enabled={settings.notifyAt2Hours}
                  onChange={(value) => updateSetting('notifyAt2Hours', value)}
                />
              </SettingRow>
              
              <SettingRow
                icon={DollarSign}
                title="Before Overage"
                description="Get notified before any on-demand charges are applied"
              >
                <Toggle
                  enabled={settings.notifyBeforeOverage}
                  onChange={(value) => updateSetting('notifyBeforeOverage', value)}
                />
              </SettingRow>
              
              <SettingRow
                icon={Calendar}
                title="Rollover Expiring"
                description="Get notified before rollover hours expire"
              >
                <Toggle
                  enabled={settings.notifyRolloverExpiring}
                  onChange={(value) => updateSetting('notifyRolloverExpiring', value)}
                />
              </SettingRow>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Payment Method</h3>
                  <p className="text-sm text-gray-400">
                    Manage your payment method for monthly billing
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {settings.autoPayEnabled ? (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Payment method on file</p>
                      <p className="text-xs text-gray-400">Managed through Stripe</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <CreditCard className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">No payment method</p>
                      <p className="text-xs text-gray-400">Add a payment method to enable auto-pay</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Link
                href="/billing"
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-4"
              >
                Manage payment methods <ChevronRight className="w-4 h-4" />
              </Link>
              
              <SettingRow
                icon={Shield}
                title="Auto-Pay"
                description="Automatically charge your card for monthly invoices"
              >
                <Toggle
                  enabled={settings.autoPayEnabled}
                  onChange={(value) => updateSetting('autoPayEnabled', value)}
                />
              </SettingRow>
            </div>
          </div>
          
          {/* Save Button */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-gray-900 border border-white/20 rounded-xl shadow-2xl p-4 flex items-center gap-4">
                <p className="text-sm text-gray-300">You have unsaved changes</p>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
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
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
