// =============================================================================
// SERVER ACTIONS FOR HOURS BALANCE
// =============================================================================

'use server';

import { auth } from '@/auth';
import db from '@/lib/db';

export interface HoursBalanceData {
  // Monthly hours
  monthlyIncluded: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  
  // Rollover hours
  rolloverTotal: number;
  rolloverExpiringSoon: {
    hours: number;
    expiresAt: string;
    daysUntilExpiry: number;
  }[];
  
  // Hour packs
  packHoursTotal: number;
  packHoursExpiringSoon: {
    packId: string;
    packName: string;
    hours: number;
    expiresAt: string | null;
    daysUntilExpiry: number | null;
  }[];
  
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
  onDemandEnabled: boolean;
}

// Import tier configuration from centralized config
import { NONPROFIT_TIERS } from '@/lib/config/tiers';

// Tier configuration - hours and features per tier
// Use centralized config for consistency
const TIER_CONFIG: Record<string, { hours: number; requests: number; name: string }> = {
  ESSENTIALS: { 
    hours: NONPROFIT_TIERS.ESSENTIALS.supportHoursIncluded, 
    requests: NONPROFIT_TIERS.ESSENTIALS.changeRequestsIncluded, 
    name: NONPROFIT_TIERS.ESSENTIALS.name 
  },
  DIRECTOR: { 
    hours: NONPROFIT_TIERS.DIRECTOR.supportHoursIncluded, 
    requests: NONPROFIT_TIERS.DIRECTOR.changeRequestsIncluded, 
    name: NONPROFIT_TIERS.DIRECTOR.name 
  },
  COO: { 
    hours: NONPROFIT_TIERS.COO.supportHoursIncluded, 
    requests: NONPROFIT_TIERS.COO.changeRequestsIncluded, 
    name: NONPROFIT_TIERS.COO.name 
  },
};

/**
 * Fetches the hours balance for the current user's maintenance plan
 * @param projectId Optional - if provided, returns balance for that specific project's plan
 * Uses tier defaults if database columns haven't been migrated yet
 */
export async function getHoursBalanceAction(projectId?: string): Promise<HoursBalanceData | null> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }
  
  try {
    // Find user's organizations
    const orgMemberships = await db.organizationMember.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        organizationId: true,
      },
    });
    
    if (orgMemberships.length === 0) {
      return null;
    }
    
    const orgIds = orgMemberships.map(m => m.organizationId);
    
    // Build where clause
    const where: any = {
      organizationId: { in: orgIds },
      maintenancePlanRel: {
        status: 'ACTIVE',
      },
    };
    
    // If projectId is provided, filter by that specific project
    if (projectId) {
      where.id = projectId;
    }
    
    // Find projects in those organizations with active maintenance plans
    const projects = await db.project.findMany({
      where,
      include: {
        maintenancePlanRel: {
          include: {
            hourPacks: {
              where: {
                isActive: true,
                hoursRemaining: { gt: 0 },
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } },
                ],
              },
              orderBy: {
                expiresAt: 'asc', // Expiring soon first
              },
            },
            rolloverRecords: {
              where: {
                isExpired: false,
                hoursRemaining: { gt: 0 },
                OR: [
                  { usedAt: null },
                ],
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: projectId ? 1 : 1, // If projectId provided, we only want that one
    });
    
    if (projects.length === 0 || !projects[0].maintenancePlanRel) {
      return null;
    }
    
    const plan = projects[0].maintenancePlanRel;
    
    // Get tier config, defaulting to ESSENTIALS
    const tierKey = (plan.tier || 'ESSENTIALS').toUpperCase();
    const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.ESSENTIALS;
    
    // Always use tier config values as source of truth
    // Database values may be incorrect if plans were created before tier values were set
    // For COO tier specifically, it should always be unlimited (-1)
    const supportHoursIncluded = tierConfig.hours;
    const changeRequestsIncluded = tierConfig.requests;
    
    const changeRequestsUsed = plan.changeRequestsUsed ?? 0;
    const rolloverHours = plan.rolloverHours ?? 0;
    const gracePeriodUsed = plan.gracePeriodUsed ?? false;
    const onDemandEnabled = plan.onDemandEnabled ?? false;
    
    // Check if unlimited tier
    const isUnlimited = supportHoursIncluded === -1;
    
    // Calculate monthly hours
    const monthlyIncluded = supportHoursIncluded;
    
    // Calculate monthly used hours from maintenance logs for the current billing period
    // This ensures we show accurate usage regardless of which source hours came from
    let monthlyUsed = 0;
    if (!isUnlimited) {
      try {
        // Determine the billing period start date
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
    
    // Rollover hours - calculate from rolloverRecords
    const now = new Date();
    const rolloverTotal = plan.rolloverRecords?.reduce((sum, record) => sum + record.hoursRemaining, 0) || rolloverHours;
    const rolloverExpiringSoon: HoursBalanceData['rolloverExpiringSoon'] = [];
    
    if (plan.rolloverRecords && plan.rolloverRecords.length > 0) {
      plan.rolloverRecords.forEach((record) => {
        if (record.expiresAt) {
          const daysUntilExpiry = Math.ceil((record.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
            rolloverExpiringSoon.push({
              hours: record.hoursRemaining,
              expiresAt: record.expiresAt.toISOString(),
              daysUntilExpiry,
            });
          }
        }
      });
    } else if (rolloverTotal > 0) {
      // Fallback: estimate expiry if no records
      const expiryDays = tierKey === 'ESSENTIALS' ? 60 : 90;
      const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
      
      rolloverExpiringSoon.push({
        hours: rolloverTotal,
        expiresAt: expiresAt.toISOString(),
        daysUntilExpiry: expiryDays,
      });
    }
    
    // Hour packs - calculate from actual hour packs
    const packHoursTotal = plan.hourPacks?.reduce((sum, pack) => sum + pack.hoursRemaining, 0) || 0;
    const packHoursExpiringSoon: HoursBalanceData['packHoursExpiringSoon'] = [];
    
    if (plan.hourPacks && plan.hourPacks.length > 0) {
      plan.hourPacks.forEach((pack) => {
        if (pack.expiresAt && !pack.neverExpires) {
          const daysUntilExpiry = Math.ceil((pack.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
            const packNames: Record<string, string> = {
              SMALL: 'Starter Pack',
              MEDIUM: 'Growth Pack',
              LARGE: 'Scale Pack',
              PREMIUM: 'Premium Reserve',
            };
            
            packHoursExpiringSoon.push({
              packId: pack.id,
              packName: packNames[pack.packType as keyof typeof packNames] || pack.packType,
              hours: pack.hoursRemaining,
              expiresAt: pack.expiresAt.toISOString(),
              daysUntilExpiry,
            });
          }
        }
      });
    }
    
    // Calculate totals
    const totalAvailable = isUnlimited ? -1 : monthlyRemaining + rolloverTotal + packHoursTotal;
    
    // Calculate estimated hours from pending project requests AND change requests
    // These are "reserved" hours that will be deducted when requests are approved/completed
    let estimatedHoursPending = 0;
    let estimatedRemaining = totalAvailable;
    
    try {
      const projectId = projects[0].id;
      
      // 1. Fetch pending ProjectRequests for this user
      // Don't use select to avoid schema mismatch issues - get all fields
      const pendingProjectRequests = await db.projectRequest.findMany({
        where: {
          userId: session.user.id,
          status: {
            in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO', 'APPROVED'],
          },
        },
      });

      // 2. Fetch pending ChangeRequests for this project
      const pendingChangeRequests = await db.changeRequest.findMany({
        where: {
          projectId: projectId,
          status: {
            in: ['pending', 'approved', 'in_progress'],
          },
        },
      });

      // Sum estimated hours from ProjectRequests (only if not deducted)
      // Safely access fields that might not exist in schema
      const projectRequestHours = pendingProjectRequests.reduce((sum, req: any) => {
        const estimatedHours = 'estimatedHours' in req ? req.estimatedHours : null;
        const hoursDeducted = 'hoursDeducted' in req ? req.hoursDeducted : null;
        
        if (estimatedHours != null && estimatedHours > 0) {
          // Only count if hours haven't been deducted yet
          if (!hoursDeducted || hoursDeducted === 0) {
            return sum + Number(estimatedHours);
          }
        }
        return sum;
      }, 0);

      // Sum estimated hours from ChangeRequests (use actualHours if set, otherwise estimatedHours)
      // Only count if hours haven't been deducted yet
      const changeRequestHours = pendingChangeRequests.reduce((sum, req: any) => {
        const actualHours = 'actualHours' in req ? req.actualHours : null;
        const estimatedHours = 'estimatedHours' in req ? req.estimatedHours : null;
        const hoursDeducted = 'hoursDeducted' in req ? req.hoursDeducted : null;
        
        // Use actualHours if set (admin has updated it), otherwise use estimatedHours
        const hours = actualHours != null && actualHours > 0 
          ? Number(actualHours) 
          : (estimatedHours != null ? Number(estimatedHours) : 0);
        
        if (hours > 0) {
          // Only count if hours haven't been deducted yet
          if (!hoursDeducted || hoursDeducted === 0) {
            return sum + hours;
          }
        }
        return sum;
      }, 0);

      estimatedHoursPending = projectRequestHours + changeRequestHours;

      // Calculate estimated remaining (what will be left after pending requests)
      // For unlimited plans, estimated remaining is still unlimited
      estimatedRemaining = isUnlimited 
        ? -1 
        : Math.max(0, totalAvailable - estimatedHoursPending);
    } catch (error: any) {
      // If the query fails (schema not migrated), just use totalAvailable
      if (error?.message?.includes('estimatedHours') || error?.message?.includes('Unknown argument') || error?.code === 'P2009') {
        // Schema not migrated yet - this is expected, silently continue
        estimatedHoursPending = 0;
        estimatedRemaining = totalAvailable;
      } else {
        // Other errors - log but don't fail
        console.warn('Could not fetch estimated hours from requests:', error?.message || error);
        estimatedHoursPending = 0;
        estimatedRemaining = totalAvailable;
      }
    }
    
    // Status flags
    const atLimit = !isUnlimited && totalAvailable <= 0;
    const isOverage = gracePeriodUsed;
    const overageHours = 0;
    
    // Change requests
    const changeRequestsRemaining = changeRequestsIncluded === -1 
      ? -1 
      : Math.max(0, changeRequestsIncluded - changeRequestsUsed);
    
    return {
      monthlyIncluded,
      monthlyUsed,
      monthlyRemaining,
      rolloverTotal,
      rolloverExpiringSoon,
      packHoursTotal,
      packHoursExpiringSoon,
      totalAvailable,
      estimatedHoursPending, // Hours estimated in pending project requests
      estimatedRemaining, // Hours remaining after pending requests are completed
      isUnlimited,
      atLimit,
      isOverage,
      overageHours,
      changeRequestsIncluded,
      changeRequestsUsed,
      changeRequestsRemaining,
      tierName: tierConfig.name,
      periodEnd: plan.currentPeriodEnd?.toISOString(),
      onDemandEnabled,
    };
  } catch (error) {
    console.error('Error fetching hours balance:', error);
    return null;
  }
}
