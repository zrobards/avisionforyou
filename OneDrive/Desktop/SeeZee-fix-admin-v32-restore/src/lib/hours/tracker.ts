/**
 * Hours Tracking Library
 * 
 * Core functions for calculating and managing hours across:
 * - Monthly included hours
 * - Rollover hours (FIFO expiration)
 * - Purchased hour packs
 * 
 * IMPORTANT: This library requires the following database migrations to be run:
 * - prisma/schema.prisma updates for MaintenancePlan fields
 * - New models: HourPack, RolloverHours, OverageNotification
 * 
 * Run `npx prisma generate && npx prisma db push` to apply schema changes.
 * Until migrations are run, some TypeScript errors will show due to
 * missing Prisma client types.
 */

import db from '@/lib/db';
import { getTier, NONPROFIT_TIERS, ON_DEMAND_SETTINGS, GRACE_PERIOD } from '@/lib/config/tiers';

// =============================================================================
// TYPES
// =============================================================================

export interface HoursBalance {
  // Monthly hours
  monthlyIncluded: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  
  // Rollover hours
  rolloverTotal: number;
  rolloverExpiringSoon: Array<{
    hours: number;
    expiresAt: Date;
    daysUntilExpiry: number;
  }>;
  
  // Hour packs
  packHoursTotal: number;
  packHoursExpiringSoon: Array<{
    packId: string;
    packName: string;
    hours: number;
    expiresAt: Date | null;
    daysUntilExpiry: number | null;
  }>;
  
  // Totals
  totalAvailable: number;         // All sources combined
  totalUsedThisMonth: number;
  
  // Status
  isUnlimited: boolean;
  atLimit: boolean;
  isOverage: boolean;
  overageHours: number;
  
  // Change requests
  changeRequestsIncluded: number;
  changeRequestsUsed: number;
  changeRequestsRemaining: number;
}

export interface DeductionResult {
  success: boolean;
  hoursDeducted: number;
  source: 'monthly' | 'rollover' | 'pack';
  sourceId?: string;              // For pack deductions
  isOverage: boolean;
  overageHours: number;
  remainingHours: number;
  error?: string;
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Get complete hours balance for a maintenance plan
 */
export async function getHoursBalance(planId: string): Promise<HoursBalance | null> {
  const plan = await db.maintenancePlan.findUnique({
    where: { id: planId },
    include: {
      hourPacks: {
        where: { isActive: true },
        orderBy: { expiresAt: 'asc' }, // Expire soonest first
      },
      rolloverRecords: {
        where: { 
          isExpired: false,
          hoursRemaining: { gt: 0 },
        },
        orderBy: { expiresAt: 'asc' }, // FIFO - oldest expires first
      },
    },
  });
  
  if (!plan) return null;
  
  const tier = getTier(plan.tier);
  const isUnlimited = tier?.supportHoursIncluded === -1;
  
  // Monthly hours
  const monthlyIncluded = tier?.supportHoursIncluded ?? 0;
  
  // Calculate monthly used hours from maintenance logs for the current billing period
  // This ensures we show accurate usage regardless of which source hours came from
  let monthlyUsed = 0;
  if (!isUnlimited) {
    try {
      const now = new Date();
      const periodStart = plan.currentPeriodStart || plan.createdAt;
      const periodEnd = plan.currentPeriodEnd || now;
      const isNewBillingPeriod = plan.currentPeriodEnd && plan.currentPeriodEnd < now;
      
      // Sum all hours from maintenance logs in the current billing period
      const logs = await db.maintenanceLog.findMany({
        where: {
          planId: plan.id,
          performedAt: {
            gte: isNewBillingPeriod ? now : periodStart,
            lte: isNewBillingPeriod ? now : periodEnd,
          },
          billable: true,
        },
        select: {
          hoursSpent: true,
        },
      });
      
      monthlyUsed = logs.reduce((sum, log) => sum + log.hoursSpent, 0);
    } catch (error) {
      // Fallback to database field if query fails
      console.warn('Could not calculate monthly used from logs, using database field:', error);
      monthlyUsed = plan.supportHoursUsed ?? 0;
    }
  } else {
    // For unlimited plans, still track usage for display
    monthlyUsed = plan.supportHoursUsed ?? 0;
  }
  
  const monthlyRemaining = isUnlimited ? -1 : Math.max(0, monthlyIncluded - monthlyUsed);
  
  // Rollover hours (with expiration info)
  const now = new Date();
  const rolloverExpiringSoon = plan.rolloverRecords
    .filter(r => r.hoursRemaining > 0)
    .map(r => ({
      hours: r.hoursRemaining,
      expiresAt: r.expiresAt,
      daysUntilExpiry: Math.ceil((r.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .filter(r => r.daysUntilExpiry <= 30); // Only show if expiring in 30 days
  
  const rolloverTotal = plan.rolloverRecords.reduce((sum, r) => sum + r.hoursRemaining, 0);
  
  // Hour packs
  const packHoursExpiringSoon = plan.hourPacks
    .filter(p => p.hoursRemaining > 0)
    .map(p => {
      const daysUntilExpiry = p.expiresAt 
        ? Math.ceil((p.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      return {
        packId: p.id,
        packName: p.packType,
        hours: p.hoursRemaining,
        expiresAt: p.expiresAt,
        daysUntilExpiry,
      };
    })
    .filter(p => p.daysUntilExpiry === null || p.daysUntilExpiry <= 30);
  
  const packHoursTotal = plan.hourPacks.reduce((sum, p) => sum + p.hoursRemaining, 0);
  
  // Calculate totals
  const totalAvailable = isUnlimited 
    ? -1 
    : monthlyRemaining + rolloverTotal + packHoursTotal;
  
  const totalUsedThisMonth = monthlyUsed;
  
  // Status checks
  const atLimit = !isUnlimited && totalAvailable <= 0;
  const isOverage = !isUnlimited && monthlyUsed > monthlyIncluded;
  const overageHours = isOverage ? monthlyUsed - monthlyIncluded : 0;
  
  // Change requests
  const changeRequestsIncluded = tier?.changeRequestsIncluded ?? 3;
  const changeRequestsUsed = plan.changeRequestsUsed;
  const changeRequestsRemaining = changeRequestsIncluded === -1 
    ? -1 
    : Math.max(0, changeRequestsIncluded - changeRequestsUsed);
  
  return {
    monthlyIncluded: isUnlimited ? -1 : monthlyIncluded,
    monthlyUsed,
    monthlyRemaining,
    rolloverTotal,
    rolloverExpiringSoon,
    packHoursTotal,
    packHoursExpiringSoon,
    totalAvailable,
    totalUsedThisMonth,
    isUnlimited,
    atLimit,
    isOverage,
    overageHours,
    changeRequestsIncluded: changeRequestsIncluded === -1 ? -1 : changeRequestsIncluded,
    changeRequestsUsed,
    changeRequestsRemaining,
  };
}

/**
 * Deduct hours from the plan using FIFO order:
 * 1. Expiring rollover hours (oldest first)
 * 2. Monthly included hours (before packs)
 * 3. Expiring hour packs (soonest first)
 * 4. Never-expire packs
 * 5. Overage (if on-demand enabled)
 */
export async function deductHours(
  planId: string,
  hours: number,
  description: string,
  performedBy?: string,
): Promise<DeductionResult> {
  const plan = await db.maintenancePlan.findUnique({
    where: { id: planId },
    include: {
      hourPacks: {
        where: { isActive: true, hoursRemaining: { gt: 0 } },
        orderBy: [
          { neverExpires: 'asc' },  // Expiring packs first
          { expiresAt: 'asc' },     // Soonest expiry first
        ],
      },
      rolloverRecords: {
        where: { isExpired: false, hoursRemaining: { gt: 0 } },
        orderBy: { expiresAt: 'asc' }, // FIFO
      },
    },
  });
  
  if (!plan) {
    return {
      success: false,
      hoursDeducted: 0,
      source: 'monthly',
      isOverage: false,
      overageHours: 0,
      remainingHours: 0,
      error: 'Plan not found',
    };
  }
  
  const tier = getTier(plan.tier);
  const isUnlimited = tier?.supportHoursIncluded === -1;
  
  // Unlimited tier - just log it
  if (isUnlimited) {
    await db.maintenanceLog.create({
      data: {
        planId,
        hoursSpent: hours,
        description,
        performedBy,
        billable: true,
        overage: false,
      },
    });
    
    await db.maintenancePlan.update({
      where: { id: planId },
      data: { supportHoursUsed: { increment: hours } },
    });
    
    return {
      success: true,
      hoursDeducted: hours,
      source: 'monthly',
      isOverage: false,
      overageHours: 0,
      remainingHours: -1, // Unlimited
    };
  }
  
  let remainingToDeduct = hours;
  let source: 'monthly' | 'rollover' | 'pack' = 'monthly';
  let sourceId: string | undefined;
  
  // 1. Try expiring rollover hours first (FIFO)
  for (const rollover of plan.rolloverRecords) {
    if (remainingToDeduct <= 0) break;
    
    const deductFromRollover = Math.min(remainingToDeduct, rollover.hoursRemaining);
    if (deductFromRollover > 0) {
      await db.rolloverHours.update({
        where: { id: rollover.id },
        data: {
          hoursRemaining: { decrement: deductFromRollover },
          usedAt: rollover.hoursRemaining - deductFromRollover <= 0 ? new Date() : null,
        },
      });
      
      remainingToDeduct -= deductFromRollover;
      source = 'rollover';
      sourceId = rollover.id;
    }
  }
  
  // 2. Use monthly included hours (before packs)
  const monthlyIncluded = tier?.supportHoursIncluded ?? 0;
  const monthlyRemaining = Math.max(0, monthlyIncluded - plan.supportHoursUsed);
  
  if (remainingToDeduct > 0 && monthlyRemaining > 0) {
    const deductFromMonthly = Math.min(remainingToDeduct, monthlyRemaining);
    await db.maintenancePlan.update({
      where: { id: planId },
      data: { supportHoursUsed: { increment: deductFromMonthly } },
    });
    
    remainingToDeduct -= deductFromMonthly;
    source = 'monthly';
  }
  
  // 3. Try expiring hour packs next (after monthly is exhausted)
  for (const pack of plan.hourPacks.filter(p => !p.neverExpires)) {
    if (remainingToDeduct <= 0) break;
    
    const deductFromPack = Math.min(remainingToDeduct, pack.hoursRemaining);
    if (deductFromPack > 0) {
      await db.hourPack.update({
        where: { id: pack.id },
        data: {
          hoursRemaining: { decrement: deductFromPack },
          usedAt: pack.hoursRemaining - deductFromPack <= 0 ? new Date() : null,
          isActive: pack.hoursRemaining - deductFromPack > 0,
        },
      });
      
      remainingToDeduct -= deductFromPack;
      source = 'pack';
      sourceId = pack.id;
    }
  }
  
  // 4. Try never-expire packs
  for (const pack of plan.hourPacks.filter(p => p.neverExpires)) {
    if (remainingToDeduct <= 0) break;
    
    const deductFromPack = Math.min(remainingToDeduct, pack.hoursRemaining);
    if (deductFromPack > 0) {
      await db.hourPack.update({
        where: { id: pack.id },
        data: {
          hoursRemaining: { decrement: deductFromPack },
          usedAt: pack.hoursRemaining - deductFromPack <= 0 ? new Date() : null,
          isActive: pack.hoursRemaining - deductFromPack > 0,
        },
      });
      
      remainingToDeduct -= deductFromPack;
      source = 'pack';
      sourceId = pack.id;
    }
  }
  
  // 5. Handle overage
  const isOverage = remainingToDeduct > 0;
  const overageHours = remainingToDeduct;
  
  if (isOverage) {
    // Check if on-demand is enabled or grace period available
    if (plan.onDemandEnabled || (!plan.gracePeriodUsed && overageHours <= GRACE_PERIOD.maxFirstTimeOverage)) {
      // Allow overage
      await db.maintenancePlan.update({
        where: { id: planId },
        data: {
          supportHoursUsed: { increment: overageHours },
          gracePeriodUsed: !plan.onDemandEnabled ? true : plan.gracePeriodUsed,
        },
      });
      remainingToDeduct = 0;
    }
  }
  
  // Log the work
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tracker.ts:358',message:'Creating MaintenanceLog',data:{planId,hours,description,performedBy,isOverage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  const logEntry = await db.maintenanceLog.create({
    data: {
      planId,
      hoursSpent: hours,
      description,
      performedBy,
      billable: true,
      overage: isOverage,
    },
  });
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tracker.ts:368',message:'MaintenanceLog created',data:{logId:logEntry.id,hoursSpent:logEntry.hoursSpent,performedAt:logEntry.performedAt?.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  // Calculate remaining
  const balance = await getHoursBalance(planId);
  
  return {
    success: remainingToDeduct === 0,
    hoursDeducted: hours - remainingToDeduct,
    source,
    sourceId,
    isOverage,
    overageHours: isOverage ? overageHours : 0,
    remainingHours: balance?.totalAvailable ?? 0,
    error: remainingToDeduct > 0 ? 'Insufficient hours available' : undefined,
  };
}

/**
 * Process monthly rollover at end of billing period
 */
export async function processMonthlyRollover(planId: string): Promise<{
  hoursRolledOver: number;
  hoursExpired: number;
}> {
  const plan = await db.maintenancePlan.findUnique({
    where: { id: planId },
    include: {
      rolloverRecords: {
        where: { isExpired: false },
      },
    },
  });
  
  if (!plan) return { hoursRolledOver: 0, hoursExpired: 0 };
  
  const tier = getTier(plan.tier);
  
  // Skip if rollover not enabled or unlimited tier
  if (!plan.rolloverEnabled || tier?.supportHoursIncluded === -1) {
    return { hoursRolledOver: 0, hoursExpired: 0 };
  }
  
  const now = new Date();
  
  // Mark expired rollover hours
  const expiredRecords = plan.rolloverRecords.filter(r => r.expiresAt < now);
  let hoursExpired = 0;
  
  for (const record of expiredRecords) {
    hoursExpired += record.hoursRemaining;
    await db.rolloverHours.update({
      where: { id: record.id },
      data: { isExpired: true, hoursRemaining: 0 },
    });
  }
  
  // Calculate current rollover total
  const currentRollover = plan.rolloverRecords
    .filter(r => !expiredRecords.includes(r))
    .reduce((sum, r) => sum + r.hoursRemaining, 0);
  
  // Calculate unused hours from this period
  const monthlyIncluded = tier?.supportHoursIncluded ?? 0;
  const monthlyUsed = plan.supportHoursUsed;
  const unusedHours = Math.max(0, monthlyIncluded - monthlyUsed);
  
  // Calculate how much we can roll over (respecting cap)
  const rolloverCap = plan.rolloverCap;
  const availableCapacity = Math.max(0, rolloverCap - currentRollover);
  const hoursToRollover = Math.min(unusedHours, availableCapacity);
  
  // Create new rollover record if there are hours to roll over
  if (hoursToRollover > 0) {
    const expiryDays = tier?.rolloverExpiryDays ?? 60;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    await db.rolloverHours.create({
      data: {
        planId,
        hours: hoursToRollover,
        hoursRemaining: hoursToRollover,
        sourceMonth: now,
        expiresAt,
      },
    });
  }
  
  // Update rollover total on plan
  await db.maintenancePlan.update({
    where: { id: planId },
    data: {
      rolloverHours: currentRollover + hoursToRollover - hoursExpired,
    },
  });
  
  return {
    hoursRolledOver: hoursToRollover,
    hoursExpired,
  };
}

/**
 * Reset plan for new billing period
 */
export async function resetBillingPeriod(planId: string): Promise<void> {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  await db.maintenancePlan.update({
    where: { id: planId },
    data: {
      supportHoursUsed: 0,
      changeRequestsUsed: 0,
      urgentRequestsUsed: 0,
      requestsToday: 0,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
    },
  });
}

/**
 * Check if client can submit a change request
 */
export async function canSubmitChangeRequest(planId: string): Promise<{
  allowed: boolean;
  reason?: string;
  hoursRemaining: number;
  requestsRemaining: number;
  requiresApproval?: boolean;
  requiresPayment?: boolean;
}> {
  const balance = await getHoursBalance(planId);
  
  if (!balance) {
    return {
      allowed: false,
      reason: 'Plan not found',
      hoursRemaining: 0,
      requestsRemaining: 0,
    };
  }
  
  const plan = await db.maintenancePlan.findUnique({
    where: { id: planId },
  });
  
  if (!plan) {
    return {
      allowed: false,
      reason: 'Plan not found',
      hoursRemaining: 0,
      requestsRemaining: 0,
    };
  }
  
  // Unlimited tier - always allowed
  if (balance.isUnlimited) {
    return {
      allowed: true,
      hoursRemaining: -1,
      requestsRemaining: -1,
    };
  }
  
  // Check change request limit
  if (balance.changeRequestsRemaining <= 0 && !plan.onDemandEnabled) {
    return {
      allowed: false,
      reason: 'Monthly change request limit reached',
      hoursRemaining: balance.totalAvailable,
      requestsRemaining: 0,
      requiresPayment: true,
    };
  }
  
  // Check hours limit
  if (balance.atLimit && !plan.onDemandEnabled) {
    // Check grace period
    if (!plan.gracePeriodUsed) {
      return {
        allowed: true,
        reason: 'One-time grace period will be used',
        hoursRemaining: 0,
        requestsRemaining: balance.changeRequestsRemaining,
        requiresApproval: true,
      };
    }
    
    return {
      allowed: false,
      reason: 'Monthly hours limit reached',
      hoursRemaining: 0,
      requestsRemaining: balance.changeRequestsRemaining,
      requiresPayment: true,
    };
  }
  
  // Check daily limit for on-demand
  if (plan.onDemandEnabled) {
    const today = new Date().toDateString();
    const lastRequestDate = plan.lastRequestDate?.toDateString();
    const requestsToday = today === lastRequestDate ? plan.requestsToday : 0;
    
    if (requestsToday >= plan.dailyRequestLimit) {
      return {
        allowed: false,
        reason: `Daily request limit (${plan.dailyRequestLimit}) reached`,
        hoursRemaining: balance.totalAvailable,
        requestsRemaining: balance.changeRequestsRemaining,
      };
    }
  }
  
  return {
    allowed: true,
    hoursRemaining: balance.totalAvailable,
    requestsRemaining: balance.changeRequestsRemaining,
  };
}

/**
 * Increment daily request counter
 */
export async function incrementDailyRequests(planId: string): Promise<void> {
  const plan = await db.maintenancePlan.findUnique({
    where: { id: planId },
  });
  
  if (!plan) return;
  
  const today = new Date().toDateString();
  const lastRequestDate = plan.lastRequestDate?.toDateString();
  
  // Reset counter if new day
  const requestsToday = today === lastRequestDate ? plan.requestsToday + 1 : 1;
  
  await db.maintenancePlan.update({
    where: { id: planId },
    data: {
      requestsToday,
      lastRequestDate: new Date(),
    },
  });
}
