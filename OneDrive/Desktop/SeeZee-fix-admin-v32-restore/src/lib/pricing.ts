/**
 * Pricing calculation logic for SeeZee project estimates
 * Based on project types, features, timeline, and content needs
 */

export interface QuestionnaireInput {
  projectTypes: string[];
  needsEcommerce?: boolean;
  needsAuth?: boolean;
  integrations?: string[];
  contentStatus?: string;
  deadline?: string | Date;
  [key: string]: any;
}

export interface PricingResult {
  estimate: number;    // Total estimate in cents
  deposit: number;     // Required deposit in cents
  breakdown: {
    base: number;
    addons: number;
    rush: number;
    total: number;
  };
}

/**
 * Check if a deadline is considered "rush" (< 3 weeks from now)
 */
function isRush(deadline?: string | Date): boolean {
  if (!deadline) return false;
  
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const threeWeeksFromNow = new Date();
  threeWeeksFromNow.setDate(threeWeeksFromNow.getDate() + 21);
  
  return deadlineDate < threeWeeksFromNow;
}

/**
 * Compute project pricing based on questionnaire responses
 * 
 * Base pricing:
 * - Website: $2,000
 * - App: $4,000
 * 
 * Add-ons:
 * - AI Integration: +$800
 * - Branding: +$400
 * - E-commerce: +$1,000
 * - Content creation: +$500
 * - Stripe integration: included with e-commerce
 * - Rush fee (<3 weeks): +15%
 * 
 * Deposit: 25% of estimate or $250 minimum
 */
export function computePrice(input: QuestionnaireInput): PricingResult {
  let base = 0;
  let addons = 0;

  // Base type (pick primary)
  if (input.projectTypes.includes('Website')) {
    base += 200000; // $2,000 in cents
  } else if (input.projectTypes.includes('App')) {
    base += 400000; // $4,000 in cents
  }

  // Add-ons
  if (input.projectTypes.includes('AI Integration') || input.projectTypes.includes('AI_DATA')) {
    addons += 80000; // $800
  }
  
  if (input.projectTypes.includes('Branding') || input.projectTypes.includes('BRANDING')) {
    addons += 40000; // $400
  }
  
  if (input.needsEcommerce || input.projectTypes.includes('ECOMMERCE')) {
    addons += 100000; // $1,000
  }
  
  if (input.contentStatus === 'need creation') {
    addons += 50000; // $500
  }

  // Stripe integration is included in e-commerce, no additional charge
  
  // Calculate subtotal before rush fee
  const subtotal = base + addons;
  
  // Rush fee
  let rushFee = 0;
  if (isRush(input.deadline)) {
    rushFee = Math.round(subtotal * 0.15); // 15% rush fee
  }
  
  const total = subtotal + rushFee;
  
  // Deposit: 25% or $250 minimum
  const deposit = Math.max(25000, Math.round(total * 0.25));

  return {
    estimate: total,
    deposit,
    breakdown: {
      base,
      addons,
      rush: rushFee,
      total
    }
  };
}

/**
 * Format price in cents to display string (e.g., "$2,500.00")
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Get pricing breakdown as human-readable text
 */
export function getPricingBreakdown(result: PricingResult): string[] {
  const lines: string[] = [];
  
  if (result.breakdown.base > 0) {
    lines.push(`Base project: ${formatPrice(result.breakdown.base)}`);
  }
  
  if (result.breakdown.addons > 0) {
    lines.push(`Add-ons & features: ${formatPrice(result.breakdown.addons)}`);
  }
  
  if (result.breakdown.rush > 0) {
    lines.push(`Rush fee (15%): ${formatPrice(result.breakdown.rush)}`);
  }
  
  lines.push(`Total estimate: ${formatPrice(result.breakdown.total)}`);
  lines.push(`Required deposit (25%): ${formatPrice(result.deposit)}`);
  
  return lines;
}

// ============================================================================
// NEW V2 PRICING UTILITIES FOR MANUAL PRICING WORKFLOW
// ============================================================================

import { Decimal } from "@prisma/client/runtime/library";

export interface InvoiceSplits {
  depositAmount: number;
  finalAmount: number;
  depositPercent: number;
  finalPercent: number;
}

/**
 * Calculates deposit and final invoice amounts based on project budget and percentages
 * @param budget - Total project budget as Decimal or number
 * @param depositPercent - Percentage for deposit (default 50)
 * @param finalPercent - Percentage for final payment (default 50)
 * @returns Object with deposit and final amounts
 */
export function calculateInvoiceSplits(
  budget: Decimal | number,
  depositPercent: number = 50,
  finalPercent: number = 50
): InvoiceSplits {
  // Validate percentages
  if (depositPercent + finalPercent !== 100) {
    throw new Error("Deposit and final percentages must sum to 100");
  }

  if (depositPercent < 0 || finalPercent < 0) {
    throw new Error("Percentages must be positive");
  }

  // Convert Decimal to number if needed
  const budgetAmount = typeof budget === "number" 
    ? budget 
    : Number(budget.toString());

  if (budgetAmount <= 0) {
    throw new Error("Budget must be greater than 0");
  }

  const depositAmount = Math.round((budgetAmount * depositPercent) / 100 * 100) / 100;
  const finalAmount = Math.round((budgetAmount * finalPercent) / 100 * 100) / 100;

  return {
    depositAmount,
    finalAmount,
    depositPercent,
    finalPercent,
  };
}

/**
 * Formats a price as USD currency
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | Decimal): string {
  const numAmount = typeof amount === "number" 
    ? amount 
    : Number(amount.toString());

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numAmount);
}

/**
 * Converts cents to dollars
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

/**
 * Converts dollars to cents
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Calculates tax amount based on subtotal and tax rate
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Tax amount
 */
export function calculateTax(subtotal: number | Decimal, taxRate: number): number {
  const subtotalAmount = typeof subtotal === "number" 
    ? subtotal 
    : Number(subtotal.toString());

  return Math.round(subtotalAmount * taxRate * 100) / 100;
}

/**
 * Validates if pricing data is set for a project
 * @param budget - Project budget
 * @returns True if budget is set and valid
 */
export function hasValidPricing(budget: Decimal | number | null | undefined): boolean {
  if (!budget) return false;
  
  const amount = typeof budget === "number" 
    ? budget 
    : Number(budget.toString());
  
  return amount > 0;
}

/**
 * Gets pricing metadata from project metadata JSON
 * @param metadata - Project metadata object
 * @returns Pricing configuration or defaults
 */
export function getPricingFromMetadata(metadata: any): {
  depositPercent: number;
  finalPercent: number;
} {
  const defaults = { depositPercent: 50, finalPercent: 50 };
  
  if (!metadata || !metadata.pricing) {
    return defaults;
  }

  return {
    depositPercent: metadata.pricing.depositPercent || defaults.depositPercent,
    finalPercent: metadata.pricing.finalPercent || defaults.finalPercent,
  };
}

/**
 * Creates pricing metadata for storing in project
 * @param depositPercent - Deposit percentage
 * @param finalPercent - Final percentage
 * @returns Metadata object
 */
export function createPricingMetadata(
  depositPercent: number,
  finalPercent: number
): { pricing: { depositPercent: number; finalPercent: number } } {
  return {
    pricing: {
      depositPercent,
      finalPercent,
    },
  };
}
