/**
 * SeeZee Studios - Centralized Tier & Billing Configuration
 * 
 * This file contains all pricing, hours, and limits for the nonprofit tier system.
 * Import from here instead of hardcoding values throughout the codebase.
 */

// =============================================================================
// NONPROFIT TIERS - Main service tiers
// =============================================================================

export const NONPROFIT_TIERS = {
  ESSENTIALS: {
    id: 'ESSENTIALS',
    name: 'Nonprofit Essentials',
    shortName: 'Tier 1',
    description: 'Best for small sites that just need stability and fixes. We keep your site safe, fast, and running.',
    
    // Pricing
    buildPrice: 600000,           // $6,000 in cents
    monthlyPrice: 50000,          // $500/month in cents
    annualPrice: 510000,          // $5,100/year (15% discount) in cents
    annualDiscount: 0.15,         // 15% off annual
    
    // Hours & Requests
    supportHoursIncluded: 8,      // Monthly support hours (doubled from 4)
    changeRequestsIncluded: 3,    // Change requests per month
    
    // Subscription Limits
    subscriptionsIncluded: 2,     // Included in base price
    maxSubscriptions: 3,          // Hard cap
    addonCost: 20000,             // $200/month per additional subscription
    addonHours: 2,                // Additional hours per addon
    
    // Rollover Settings
    rolloverEnabled: true,
    rolloverCap: 16,              // 2x monthly hours (doubled from 8)
    rolloverExpiryDays: 60,       // Days until rollover expires
    
    // Warnings
    warningDays: [30, 14, 7],     // Days before expiry to warn
    
    // Stripe
    stripePriceId: process.env.STRIPE_PRICE_NONPROFIT_T1,
    stripeAnnualPriceId: process.env.STRIPE_PRICE_NONPROFIT_T1_ANNUAL,
  },
  
  DIRECTOR: {
    id: 'DIRECTOR',
    name: 'Digital Director Platform',
    shortName: 'Tier 2',
    description: 'Best for orgs that update content often and want real momentum. We actively manage and improve your digital presence.',
    
    // Pricing
    buildPrice: 750000,           // $7,500 in cents
    monthlyPrice: 75000,          // $750/month in cents
    annualPrice: 765000,          // $7,650/year (15% discount) in cents
    annualDiscount: 0.15,
    
    // Hours & Requests
    supportHoursIncluded: 16,     // Monthly support hours (16 hours for better value)
    changeRequestsIncluded: 5,    // Change requests per month
    
    // Subscription Limits
    subscriptionsIncluded: 3,
    maxSubscriptions: 6,
    addonCost: 20000,             // $200/month
    addonHours: 3,                // Hours per addon
    
    // Rollover Settings
    rolloverEnabled: true,
    rolloverCap: 32,              // 2x monthly hours (2x 16 = 32)
    rolloverExpiryDays: 90,
    
    // Warnings
    warningDays: [60, 30, 14, 7],
    
    // Stripe
    stripePriceId: process.env.STRIPE_PRICE_NONPROFIT_T2,
    stripeAnnualPriceId: process.env.STRIPE_PRICE_NONPROFIT_T2_ANNUAL,
  },
  
  COO: {
    id: 'COO',
    name: 'Digital COO System',
    shortName: 'Tier 3',
    description: 'Best for serious organizations that want you as their tech lead. Your outsourced digital leadership.',
    
    // Pricing
    buildPrice: 1250000,          // $12,500 in cents
    monthlyPrice: 200000,         // $2,000/month in cents
    annualPrice: 2040000,         // $20,400/year (15% discount) in cents
    annualDiscount: 0.15,
    
    // Hours & Requests - UNLIMITED (fair-use policy applies)
    // Fair-use definition: Unlimited requests, worked on continuously. 
    // Large rebuilds, migrations, or major new systems scoped separately.
    supportHoursIncluded: -1,     // -1 = unlimited
    changeRequestsIncluded: -1,   // -1 = unlimited
    
    // Subscription Limits - UNLIMITED
    subscriptionsIncluded: -1,    // -1 = unlimited
    maxSubscriptions: -1,
    addonCost: 0,                 // No addon fees
    addonHours: 0,
    
    // Rollover Settings - N/A for unlimited
    rolloverEnabled: false,
    rolloverCap: 0,
    rolloverExpiryDays: 0,
    
    // Warnings - N/A
    warningDays: [],
    
    // Stripe
    stripePriceId: process.env.STRIPE_PRICE_NONPROFIT_T3,
    stripeAnnualPriceId: process.env.STRIPE_PRICE_NONPROFIT_T3_ANNUAL,
  },
} as const;

export type NonprofitTierId = keyof typeof NONPROFIT_TIERS;
export type NonprofitTier = typeof NONPROFIT_TIERS[NonprofitTierId];

// =============================================================================
// HOUR PACKS - Purchasable hour bundles
// =============================================================================

export const HOUR_PACKS = {
  SMALL: {
    id: 'SMALL',
    name: 'Quick Boost',
    hours: 5,
    cost: 35000,                  // $350 in cents
    pricePerHour: 7000,           // $70/hour
    expiryDays: 60,
    neverExpires: false,
    popular: false,
    savings: 0,
  },
  
  MEDIUM: {
    id: 'MEDIUM',
    name: 'Power Pack',
    hours: 10,
    cost: 65000,                  // $650 in cents
    pricePerHour: 6500,           // $65/hour
    expiryDays: 90,
    neverExpires: false,
    popular: true,                // "Most Popular" badge
    savings: 5000,                // Save $50
  },
  
  LARGE: {
    id: 'LARGE',
    name: 'Mega Pack',
    hours: 20,
    cost: 120000,                 // $1,200 in cents
    pricePerHour: 6000,           // $60/hour
    expiryDays: 120,
    neverExpires: false,
    popular: false,
    savings: 20000,               // Save $200
  },
  
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Never Expire Pack',
    hours: 10,
    cost: 85000,                  // $850 in cents
    pricePerHour: 8500,           // $85/hour (premium for no expiry)
    expiryDays: 0,
    neverExpires: true,
    popular: false,
    savings: 0,
  },
} as const;

export type HourPackId = keyof typeof HOUR_PACKS;
export type HourPack = typeof HOUR_PACKS[HourPackId];

// =============================================================================
// EXTENSION OPTIONS - Extend expiring hours/packs
// =============================================================================

export const EXTENSION_OPTIONS = {
  EXTEND_30_DAYS: {
    id: 'EXTEND_30_DAYS',
    name: 'Add 30 Days',
    cost: 5000,                   // $50 in cents
    additionalDays: 30,
  },
  
  EXTEND_60_DAYS: {
    id: 'EXTEND_60_DAYS',
    name: 'Add 60 Days',
    cost: 8500,                   // $85 in cents
    additionalDays: 60,
  },
  
  CONVERT_TO_NEVER_EXPIRE: {
    id: 'CONVERT_TO_NEVER_EXPIRE',
    name: 'Never Expire',
    costPerHour: 1500,            // $15/hour to convert
    additionalDays: -1,           // -1 = infinite
  },
} as const;

// =============================================================================
// ON-DEMAND BILLING SETTINGS
// =============================================================================

export const ON_DEMAND_SETTINGS = {
  // Hourly rate for overage
  hourlyRate: 7500,               // $75/hour in cents
  
  // Request limits
  defaultDailyLimit: 3,           // Default max requests per day
  minDailyLimit: 1,               // Client can set as low as 1
  maxDailyLimit: 10,              // Client can set as high as 10
  
  // Weekly limits
  defaultWeeklyLimit: 15,
  urgentRequestsPerWeek: 2,       // Max urgent requests per week
  
  // Spend caps
  defaultDailySpendCap: 50000,    // $500/day in cents
  defaultMonthlySpendCap: 200000, // $2,000/month in cents
  minMonthlySpendCap: 50000,      // $500 minimum
  maxMonthlySpendCap: 500000,     // $5,000 maximum
  
  // Time between requests
  minTimeBetweenRequests: 2,      // Hours between requests (prevents spam)
  
  // Auto-approval thresholds
  requireApprovalOver: 20000,     // Requests >$200 need approval
} as const;

// =============================================================================
// URGENCY FEES
// =============================================================================

export const URGENCY_FEES = {
  LOW: { fee: 0, days: '3-5 days', label: 'Low Priority' },
  NORMAL: { fee: 0, days: '2-3 days', label: 'Normal' },
  HIGH: { fee: 0, days: '1 day', label: 'High Priority' },
  URGENT: { fee: 5000, days: 'Same day', label: 'Urgent (+$50)' },     // $50 in cents
  EMERGENCY: { fee: 10000, days: 'Immediate', label: 'Emergency (+$100)' }, // $100, bypasses limits
} as const;

// =============================================================================
// GRACE PERIOD SETTINGS
// =============================================================================

export const GRACE_PERIOD = {
  // Allow finishing current in-progress request
  finishCurrentRequest: true,
  
  // One-time overage allowance
  firstTimeOverageAllowed: true,
  maxFirstTimeOverage: 1.0,       // 1 hour max grace
  
  // Failed payment grace periods
  paymentGraceDays: {
    warning1: 1,                  // Day 1: First warning
    warning2: 3,                  // Day 3: Second warning
    suspend: 7,                   // Day 7: Suspend account
    cancel: 14,                   // Day 14: Cancel subscription
  },
} as const;

// =============================================================================
// WARNING THRESHOLDS
// =============================================================================

export const WARNING_THRESHOLDS = {
  // Percentage-based
  AT_80_PERCENT: 0.8,             // Warn at 80% usage
  
  // Hours remaining
  AT_2_HOURS: 2,                  // Warn at 2 hours remaining
  
  // Days before expiry (for rollover/packs)
  EXPIRY_WARNING_DAYS: [60, 30, 14, 7, 3],
} as const;

// =============================================================================
// ANNUAL HOUR RESERVE (Bulk discount)
// =============================================================================

export const ANNUAL_HOUR_RESERVE = {
  hours: 120,                     // 120 hours for the year
  normalCost: 720000,             // $7,200 at $60/hour
  discountedCost: 600000,         // $6,000 (17% off)
  discount: 0.17,
  pricePerHour: 5000,             // $50/hour
  expiryDays: 365,
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get tier by ID
 */
export function getTier(tierId: string): NonprofitTier | null {
  const tier = NONPROFIT_TIERS[tierId as NonprofitTierId];
  return tier || null;
}

/**
 * Get hour pack by ID
 */
export function getHourPack(packId: string): HourPack | null {
  const pack = HOUR_PACKS[packId as HourPackId];
  return pack || null;
}

/**
 * Check if tier has unlimited hours
 */
export function hasUnlimitedHours(tierId: string): boolean {
  const tier = getTier(tierId);
  return tier?.supportHoursIncluded === -1;
}

/**
 * Check if tier has unlimited subscriptions
 */
export function hasUnlimitedSubscriptions(tierId: string): boolean {
  const tier = getTier(tierId);
  return tier?.maxSubscriptions === -1;
}

/**
 * Calculate monthly cost with addons
 */
export function calculateMonthlyCost(tierId: string, addonCount: number): number {
  const tier = getTier(tierId);
  if (!tier) return 0;
  
  const includedSubs = tier.subscriptionsIncluded === -1 ? Infinity : tier.subscriptionsIncluded;
  const addonsNeeded = Math.max(0, addonCount - includedSubs);
  
  return tier.monthlyPrice + (addonsNeeded * tier.addonCost);
}

/**
 * Calculate total hours available (base + addons)
 */
export function calculateTotalHours(tierId: string, addonCount: number): number {
  const tier = getTier(tierId);
  if (!tier) return 0;
  if (tier.supportHoursIncluded === -1) return -1; // Unlimited
  
  const includedSubs = tier.subscriptionsIncluded;
  const addonsNeeded = Math.max(0, addonCount - includedSubs);
  
  return tier.supportHoursIncluded + (addonsNeeded * tier.addonHours);
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  if (hours === -1) return 'Unlimited';
  if (hours === 0) return '0 hours';
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
}

/**
 * Get recommended tier based on usage
 */
export function getRecommendedTier(avgMonthlyHours: number, subscriptionCount: number): NonprofitTierId {
  // If consistently using more than 10 hours or need >6 subscriptions, recommend COO
  if (avgMonthlyHours > 10 || subscriptionCount > 6) {
    return 'COO';
  }
  
  // If using more than 4 hours or need >3 subscriptions, recommend Director
  if (avgMonthlyHours > 4 || subscriptionCount > 3) {
    return 'DIRECTOR';
  }
  
  // Otherwise, Essentials is sufficient
  return 'ESSENTIALS';
}

/**
 * Calculate savings from upgrading
 */
export function calculateUpgradeSavings(
  currentTier: NonprofitTierId,
  avgMonthlyOverageHours: number,
  avgMonthlyAddonCost: number
): { recommendedTier: NonprofitTierId; monthlySavings: number } | null {
  const current = NONPROFIT_TIERS[currentTier];
  if (!current) return null;
  
  // Current total cost
  const currentCost = current.monthlyPrice + avgMonthlyAddonCost + 
    (avgMonthlyOverageHours * ON_DEMAND_SETTINGS.hourlyRate);
  
  // Check each higher tier
  const tierOrder: NonprofitTierId[] = ['ESSENTIALS', 'DIRECTOR', 'COO'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  for (let i = currentIndex + 1; i < tierOrder.length; i++) {
    const higherTier = NONPROFIT_TIERS[tierOrder[i]];
    if (higherTier.monthlyPrice < currentCost) {
      return {
        recommendedTier: tierOrder[i],
        monthlySavings: currentCost - higherTier.monthlyPrice,
      };
    }
  }
  
  return null;
}
