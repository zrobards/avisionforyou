'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  Check, 
  Upload,
  X,
  ChevronRight,
  Zap,
  Info,
  ArrowLeft,
  Send,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import type { HoursBalanceData } from '../../actions/hours';

// =============================================================================
// TYPES & DATA
// =============================================================================

interface FormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  estimatedHours: number | null;
  attachments: File[];
  agreeToTerms: boolean;
}

const CATEGORIES = [
  { value: 'CONTENT', label: 'Content Update', description: 'Text, images, or media changes' },
  { value: 'DESIGN', label: 'Design Change', description: 'Visual or layout modifications' },
  { value: 'FUNCTIONALITY', label: 'New Feature', description: 'Add or modify functionality' },
  { value: 'BUG_FIX', label: 'Bug Fix', description: 'Fix broken functionality' },
  { value: 'PERFORMANCE', label: 'Performance', description: 'Speed or optimization improvements' },
  { value: 'SEO', label: 'SEO Update', description: 'Search engine optimization' },
  { value: 'SECURITY', label: 'Security', description: 'Security patches or updates' },
  { value: 'OTHER', label: 'Other', description: 'Anything else' },
];

const PRIORITIES = [
  { 
    value: 'LOW', 
    label: 'Low', 
    description: 'No rush - within 5-7 business days',
    urgencyFee: 0,
    color: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
  },
  { 
    value: 'NORMAL', 
    label: 'Normal', 
    description: 'Standard - within 2-3 business days',
    urgencyFee: 0,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  },
  { 
    value: 'HIGH', 
    label: 'High', 
    description: 'Priority - within 24 hours (+$50)',
    urgencyFee: 50,
    color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  },
  { 
    value: 'URGENT', 
    label: 'Urgent', 
    description: 'ASAP - same day if possible (+$100)',
    urgencyFee: 100,
    color: 'text-red-400 border-red-500/30 bg-red-500/10',
  },
];

// Helper to get total available hours from HoursBalanceData
// Handles unlimited hours (represented as -1)
function getTotalAvailable(hoursBalance: HoursBalanceData | null): number {
  if (!hoursBalance) return 0;
  if (hoursBalance.totalAvailable === -1) return 999999;
  return hoursBalance.totalAvailable;
}

function getMonthlyRemaining(hoursBalance: HoursBalanceData | null): number {
  if (!hoursBalance) return 0;
  if (hoursBalance.monthlyRemaining === -1) return 999999;
  return hoursBalance.monthlyRemaining;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatHours(hours: number | undefined | null): string {
  if (hours === undefined || hours === null || isNaN(hours)) return '0';
  if (Number.isInteger(hours)) return hours.toString();
  return hours.toFixed(1);
}

// =============================================================================
// COMPONENTS
// =============================================================================

function HoursEstimator({ 
  estimatedHours, 
  onChange,
  hoursBalance,
}: { 
  estimatedHours: number | null; 
  onChange: (hours: number) => void;
  hoursBalance: HoursBalanceData | null;
}) {
  const presets = [0.5, 1, 2, 3, 5];
  // Initialize state: if estimatedHours matches a preset, use preset; otherwise use custom
  const initialPreset = estimatedHours !== null && presets.includes(estimatedHours) ? estimatedHours : null;
  const [customValue, setCustomValue] = useState<string>(initialPreset === null && estimatedHours ? estimatedHours.toString() : '');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(initialPreset);
  
  const totalAvailable = getTotalAvailable(hoursBalance);
  const willExceedBalance = estimatedHours !== null && estimatedHours > totalAvailable;
  const willRequireOverage = willExceedBalance && (hoursBalance?.onDemandEnabled ?? false);
  const willBeBlocked = willExceedBalance && !(hoursBalance?.onDemandEnabled ?? false);
  
  // Handle preset button click
  const handlePresetClick = (hours: number) => {
    setSelectedPreset(hours);
    setCustomValue(''); // Clear custom input when preset is selected
    onChange(hours);
  };
  
  // Handle custom input change
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomValue(value);
    setSelectedPreset(null); // Clear preset selection when typing custom value
    if (value === '') {
      onChange(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        onChange(numValue);
      }
    }
  };
  
  // Reset state when value is cleared externally
  useEffect(() => {
    if (estimatedHours === null || estimatedHours === 0) {
      setCustomValue('');
      setSelectedPreset(null);
    }
  }, [estimatedHours]);
  
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-white">
        Estimated Hours
        <span className="text-gray-400 font-normal ml-2">(Optional - we'll confirm before starting)</span>
      </label>
      
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((hours) => (
          <button
            key={hours}
            type="button"
            onClick={() => handlePresetClick(hours)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPreset === hours
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {hours}h
          </button>
        ))}
        <input
          type="number"
          min="0.5"
          step="0.5"
          value={selectedPreset !== null ? '' : customValue}
          onChange={handleCustomChange}
          placeholder="Custom"
          className="w-24 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>
      
      {/* Balance indicator */}
      {estimatedHours !== null && estimatedHours > 0 && (
        <div className={`p-3 rounded-lg border ${
          willBeBlocked 
            ? 'bg-red-500/10 border-red-500/30' 
            : willRequireOverage 
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-green-500/10 border-green-500/30'
        }`}>
          <div className="flex items-start gap-2">
            {willBeBlocked ? (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            ) : willRequireOverage ? (
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              {willBeBlocked ? (
                <>
                  <p className="text-sm font-medium text-red-400">Exceeds Available Hours</p>
                  <p className="text-xs text-red-300/80 mt-1">
                    You need {formatHours(estimatedHours - totalAvailable)} more hours. 
                    <Link href="/client/hours" className="underline ml-1">Purchase an hour pack</Link>
                  </p>
                </>
              ) : willRequireOverage ? (
                <>
                  <p className="text-sm font-medium text-yellow-400">Will Use On-Demand Hours</p>
                  <p className="text-xs text-yellow-300/80 mt-1">
                    {formatHours(estimatedHours - totalAvailable)} hours will be billed at $75/hour overage rate
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-green-400">Within Your Balance</p>
                  <p className="text-xs text-green-300/80 mt-1">
                    You'll have {formatHours(totalAvailable - estimatedHours)} hours remaining after this request
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySelector({ 
  selected, 
  onChange 
}: { 
  selected: string; 
  onChange: (value: string) => void 
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white">
        Category <span className="text-red-400">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected === category.value
                ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-sm font-medium text-white">{category.label}</p>
            <p className="text-xs text-gray-400 mt-1">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function PrioritySelector({ 
  selected, 
  onChange 
}: { 
  selected: string; 
  onChange: (value: string) => void 
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white">
        Priority <span className="text-red-400">*</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {PRIORITIES.map((priority) => (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected === priority.value
                ? `${priority.color} ring-2 ring-current/30`
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${selected === priority.value ? 'text-current' : 'text-white'}`}>
                {priority.label}
              </p>
              {priority.urgencyFee > 0 && (
                <span className="text-xs text-yellow-400 font-medium">+${priority.urgencyFee}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{priority.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function FileUpload({ 
  files, 
  onChange 
}: { 
  files: File[]; 
  onChange: (files: File[]) => void 
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    onChange([...files, ...newFiles]);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange([...files, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white">
        Attachments <span className="text-gray-400 font-normal">(Optional)</span>
      </label>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors"
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-300 mb-1">
          Drag & drop files here, or{' '}
          <label className="text-cyan-400 cursor-pointer hover:underline">
            browse
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-xs text-gray-500">
          Screenshots, documents, or any reference files (max 10MB each)
        </p>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)}KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function NewChangeRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoursBalance, setHoursBalance] = useState<HoursBalanceData | null>(null);
  const [loadingHours, setLoadingHours] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    priority: 'NORMAL',
    estimatedHours: null,
    attachments: [],
    agreeToTerms: false,
  });
  
  // Fetch hours balance and check subscription status on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch hours balance
      try {
        const response = await fetch('/api/client/hours');
        if (response.ok) {
          const data = await response.json();
          setHoursBalance(data);
        }
      } catch (err) {
        console.error('Failed to fetch hours balance:', err);
      } finally {
        setLoadingHours(false);
      }

      // Check for active subscription
      try {
        const subscriptionsResponse = await fetch('/api/client/subscriptions');
        if (subscriptionsResponse.ok) {
          const subData = await subscriptionsResponse.json();
          // Check both subscriptions and maintenance plans
          const hasActiveSub = subData.subscriptions?.some((s: any) => 
            s.status === 'active' || s.status === 'trialing'
          ) || false;
          const hasActivePlan = subData.maintenancePlans?.some((p: any) => 
            p.status === 'ACTIVE'
          ) || false;
          setHasActiveSubscription(hasActiveSub || hasActivePlan);
        }
      } catch (err) {
        console.error('Failed to check subscription status:', err);
        // Don't set to false on error - might just be a network issue
      }
    };
    
    fetchData();
  }, []);
  
  const selectedPriority = PRIORITIES.find(p => p.value === formData.priority);
  const urgencyFee = selectedPriority?.urgencyFee ?? 0;
  
  const canSubmit = formData.title.trim() && 
    formData.description.trim() && 
    formData.category && 
    formData.priority && 
    formData.agreeToTerms;
  
  const totalAvailable = getTotalAvailable(hoursBalance);
  const willRequireOverage = formData.estimatedHours !== null && 
    formData.estimatedHours > totalAvailable && 
    (hoursBalance?.onDemandEnabled ?? false);
  
  const willBeBlocked = formData.estimatedHours !== null && 
    formData.estimatedHours > totalAvailable && 
    !(hoursBalance?.onDemandEnabled ?? false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || willBeBlocked) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload attachments first if any
      const attachmentUrls: string[] = [];
      
      if (formData.attachments.length > 0) {
        // For now, we'll skip file uploads and just store file names
        // In production, you'd upload to storage (S3, uploadthing, etc.) here
        // For now, we'll use placeholder URLs
        attachmentUrls.push(...formData.attachments.map(f => `placeholder://${f.name}`));
      }
      
      // Validate form data before sending
      if (!formData.title?.trim() || !formData.description?.trim() || !formData.category || !formData.priority) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Map category from form to schema enum
      const categoryMap: Record<string, string> = {
        'CONTENT': 'CONTENT',
        'DESIGN': 'DESIGN',
        'FUNCTIONALITY': 'FEATURE',
        'BUG_FIX': 'BUG',
        'PERFORMANCE': 'OTHER', // Map to OTHER for now
        'SEO': 'SEO',
        'SECURITY': 'SECURITY',
        'OTHER': 'OTHER',
      };
      
      const mappedCategory = categoryMap[formData.category] || 'OTHER';
      
      // Validate mapped category
      const validCategories = ['CONTENT', 'BUG', 'FEATURE', 'DESIGN', 'SEO', 'SECURITY', 'OTHER'];
      if (!validCategories.includes(mappedCategory)) {
        setError(`Invalid category: ${formData.category}`);
        setIsSubmitting(false);
        return;
      }

      // Validate priority
      const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY'];
      if (!validPriorities.includes(formData.priority)) {
        setError(`Invalid priority: ${formData.priority}`);
        setIsSubmitting(false);
        return;
      }

      // Prepare request payload
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: mappedCategory,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours,
        attachments: attachmentUrls,
        urgencyFee: urgencyFee * 100, // Convert to cents
      };

      console.log('[Change Request Form] Submitting payload:', payload);
      
      // Call the API
      const response = await fetch('/api/client/change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        
        console.error('[Change Request Form] API error:', errorData);
        
        const errorMessage = errorData.error || 'Failed to submit request';
        
        // Check if it's a subscription-related error
        if (errorMessage.includes('No active subscription') || errorMessage.includes('maintenance plan')) {
          setError('SUBSCRIPTION_REQUIRED');
          setIsSubmitting(false);
          return;
        }
        
        // Show detailed error message
        let displayError = errorMessage;
        if (errorData.received) {
          displayError += ` (received: ${JSON.stringify(errorData.received)})`;
        }
        if (errorData.validCategories || errorData.validPriorities) {
          displayError += ` (valid values: ${errorData.validCategories?.join(', ') || errorData.validPriorities?.join(', ')})`;
        }
        
        setError(displayError);
        setIsSubmitting(false);
        return;
      }
      
      const result = await response.json();
      
      // Redirect to success page
      if (result.changeRequest?.id) {
        router.push(`/client/requests/success?id=${result.changeRequest.id}`);
      } else {
        router.push('/client/requests?success=created');
      }
    } catch (err: any) {
      // Only log unexpected errors, not subscription errors we've already handled
      if (err.message !== 'SUBSCRIPTION_REQUIRED') {
        console.error('Failed to submit request:', err);
      }
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/requests"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Requests
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <FileText className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">New Change Request</h1>
              <p className="text-gray-400">Describe what you need and we'll get started</p>
            </div>
          </div>
        </div>
        
        {/* Subscription Warning Banner */}
        {hasActiveSubscription === false && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-400 mb-2">
                  Maintenance Plan Required
                </p>
                <p className="text-sm text-yellow-300/80 mb-3">
                  You need an active maintenance subscription to submit change requests. 
                  Set up your maintenance plan to get started.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/client/subscriptions"
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Set Up Maintenance Plan
                  </Link>
                  <Link
                    href="/client/billing"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View Billing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hours Balance Banner */}
        {loadingHours ? (
          <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
            <div className="text-sm text-gray-400">Loading hours balance...</div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm text-white">
                  <strong>{formatHours(getTotalAvailable(hoursBalance))}</strong> hours available
                </p>
                <p className="text-xs text-gray-400">
                  {formatHours(getMonthlyRemaining(hoursBalance))} monthly + {formatHours(hoursBalance?.rolloverTotal ?? 0)} rollover + {formatHours(hoursBalance?.packHoursTotal ?? 0)} packs
                </p>
              </div>
            </div>
            <Link
              href="/client/hours"
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Buy more <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400 mb-2">
                  {error === 'SUBSCRIPTION_REQUIRED' 
                    ? 'Maintenance Plan Required'
                    : error}
                </p>
                {error === 'SUBSCRIPTION_REQUIRED' && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-300/80">
                      You need an active maintenance subscription to submit change requests. 
                      This ensures your website stays updated and secure.
                    </p>
                    <div className="flex gap-3 pt-2">
                      <Link
                        href="/client/subscriptions"
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Set Up Maintenance Plan
                      </Link>
                      <Link
                        href="/client/billing"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        View Billing
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Request Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Update homepage hero image"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>
          
          {/* Category */}
          <CategorySelector
            selected={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
          />
          
          {/* Priority */}
          <PrioritySelector
            selected={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value })}
          />
          
          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe the changes you need in detail. Include any specific requirements, references, or examples..."
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
            />
          </div>
          
          {/* Hours Estimator */}
          <HoursEstimator
            estimatedHours={formData.estimatedHours}
            onChange={(hours) => setFormData({ ...formData, estimatedHours: hours })}
            hoursBalance={hoursBalance}
          />
          
          {/* File Upload */}
          <FileUpload
            files={formData.attachments}
            onChange={(files) => setFormData({ ...formData, attachments: files })}
          />
          
          {/* Cost Summary */}
          {(urgencyFee > 0 || willRequireOverage) && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Additional Charges Apply
              </h4>
              <div className="space-y-2 text-sm">
                {urgencyFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Priority Urgency Fee</span>
                    <span className="text-white">${urgencyFee}</span>
                  </div>
                )}
                {willRequireOverage && formData.estimatedHours && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Estimated Overage ({formatHours(formData.estimatedHours - totalAvailable)} hrs @ $75/hr)</span>
                    <span className="text-white">${((formData.estimatedHours - totalAvailable) * 75).toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Terms Agreement */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
            />
            <label htmlFor="terms" className="text-sm text-gray-400">
              I understand this request will be reviewed and may require additional hours beyond my estimate. 
              Final hours will be confirmed before work begins, and I agree to the{' '}
              <Link href="/terms" className="text-cyan-400 hover:underline">terms of service</Link>.
            </label>
          </div>
          
          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/client/requests"
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || willBeBlocked || isSubmitting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
