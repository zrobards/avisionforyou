import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientAccessContext } from "@/lib/client-access";
import { NONPROFIT_TIERS, getTier } from "@/lib/config/tiers";

/**
 * GET /api/client/hours
 * Get current maintenance plan and hour pack information
 */
export async function GET(req: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:11',message:'API GET entry',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:15',message:'Unauthorized',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identity = {
      userId: session.user.id,
      email: session.user.email!,
    };
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:22',message:'User authenticated',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Get user's accessible projects
    const access = await getClientAccessContext(identity);
    
    if (access.organizationIds.length === 0 && access.leadProjectIds.length === 0) {
      return NextResponse.json({
        tier: null,
        monthlyHours: 0,
        totalHours: 0,
        hourPacks: 0,
        rolloverHours: 0,
        hourPacksList: [],
      });
    }

    // Get the most recent active project with maintenance plan
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { organizationId: { in: access.organizationIds } },
          { id: { in: access.leadProjectIds } },
        ],
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
      include: {
        maintenancePlanRel: {
          include: {
            hourPacks: {
              where: {
                isActive: true,
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
                OR: [
                  { usedAt: null },
                ],
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!project || !project.maintenancePlanRel) {
      return NextResponse.json({
        tier: null,
        monthlyHours: 0,
        totalHours: 0,
        hourPacks: 0,
        rolloverHours: 0,
        hourPacksList: [],
      });
    }

    const plan = project.maintenancePlanRel;

    // Get tier config for proper names and defaults (even if not paid)
    const tierKey = (plan.tier || 'ESSENTIALS').toUpperCase() as keyof typeof NONPROFIT_TIERS;
    const tierConfig = getTier(tierKey) || NONPROFIT_TIERS.ESSENTIALS;

    // CRITICAL: Check if user has a paid subscription (Stripe subscription ID)
    // If no Stripe subscription, still show the hours they have (including hour packs)
    // but mark it as paymentRequired so they know they need to pay for monthly subscription
    const paymentRequired = !plan.stripeSubscriptionId;
    
    // Calculate hour packs even if payment is required (users can still have purchased packs)
    const packHoursTotal = plan.hourPacks?.reduce((sum, pack) => sum + pack.hoursRemaining, 0) || 0;
    
    if (paymentRequired) {
      // Still return the hours they have, including hour packs
      // This allows the UI to show what they have even if subscription payment is pending
      const monthlyIncluded = tierConfig.supportHoursIncluded;
      const isUnlimited = monthlyIncluded === -1;
      const totalAvailable = isUnlimited ? -1 : (monthlyIncluded + packHoursTotal);
      
      // Format hour packs list
      const hourPacksList = plan.hourPacks?.map(pack => ({
        id: pack.id,
        packType: pack.packType,
        hours: pack.hours,
        hoursRemaining: pack.hoursRemaining,
        expiresAt: pack.expiresAt,
        neverExpires: pack.neverExpires,
        purchasedAt: pack.purchasedAt,
        cost: pack.cost ? Number(pack.cost) : 0,
      })) || [];
      
      return NextResponse.json({
        // Monthly hours
        monthlyIncluded,
        monthlyUsed: 0,
        monthlyRemaining: isUnlimited ? -1 : monthlyIncluded,
        
        // Rollover hours
        rolloverTotal: 0,
        rolloverExpiringSoon: [],
        
        // Hour packs - SHOW THEM EVEN IF PAYMENT REQUIRED
        packHoursTotal,
        packHoursExpiringSoon: [],
        
        // Totals
        totalAvailable,
        
        // Status
        isUnlimited,
        atLimit: false,
        isOverage: false,
        overageHours: 0,
        
        // Change requests
        changeRequestsIncluded: tierConfig.changeRequestsIncluded,
        changeRequestsUsed: 0,
        changeRequestsRemaining: tierConfig.changeRequestsIncluded === -1 ? -1 : tierConfig.changeRequestsIncluded,
        
        // Plan info
        tierName: tierConfig.name,
        periodEnd: plan.currentPeriodEnd?.toISOString(),
        onDemandEnabled: false,
        
        // Legacy fields
        tier: tierConfig.id,
        monthlyHours: monthlyIncluded,
        hourPacks: packHoursTotal,
        rolloverHours: 0,
        totalHours: totalAvailable,
        hourPacksList,
        totalSpentOnPacks: plan.hourPacks?.reduce((sum, pack) => sum + (pack.cost ? Number(pack.cost) : 0), 0) || 0,
        changeRequestsAllowed: tierConfig.changeRequestsIncluded,
        
        // Payment status
        paymentRequired: true,
        hasCheckoutSession: !!plan.stripeCheckoutSessionId,
        message: "Payment required. Please complete your subscription payment to access monthly hours.",
      });
    }

    // Tier config already retrieved above if payment required

    // Always use tier config values as source of truth
    // Database values may be incorrect if plans were created before tier values were set
    // For COO tier specifically, it should always be unlimited (-1)
    // This ensures consistency - tier config is the single source of truth
    const monthlyIncluded = tierConfig.supportHoursIncluded;
    const changeRequestsAllowed = tierConfig.changeRequestsIncluded;

    const now = new Date();
    
    // Check if we're in a new billing period (currentPeriodEnd has passed)
    // If so, monthly hours reset, but rollover and pack hours persist
    const isNewBillingPeriod = plan.currentPeriodEnd && plan.currentPeriodEnd < now;
    
    const isUnlimited = monthlyIncluded === -1;
    
    // Calculate monthly used hours from maintenance logs for the current billing period
    // This ensures we show accurate usage regardless of which source hours came from
    let monthlyUsed = 0;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:174',message:'Before monthlyUsed calc',data:{isUnlimited,planId:plan.id,currentPeriodStart:plan.currentPeriodStart?.toISOString(),currentPeriodEnd:plan.currentPeriodEnd?.toISOString(),supportHoursUsed:plan.supportHoursUsed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!isUnlimited) {
      try {
        // Determine the billing period start date
        const periodStart = plan.currentPeriodStart || plan.createdAt;
        const periodEnd = plan.currentPeriodEnd || now;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:180',message:'Querying MaintenanceLog',data:{planId:plan.id,periodStart:periodStart.toISOString(),periodEnd:periodEnd.toISOString(),isNewBillingPeriod},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // Sum all hours from maintenance logs in the current billing period
        const logs = await prisma.maintenanceLog.findMany({
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
            performedAt: true,
            description: true,
          },
        });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:195',message:'MaintenanceLog query result',data:{logCount:logs.length,logHours:logs.map(l=>({hours:l.hoursSpent,date:l.performedAt?.toISOString(),desc:l.description})),periodStart:periodStart.toISOString(),periodEnd:periodEnd.toISOString(),isNewBillingPeriod},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        monthlyUsed = logs.reduce((sum, log) => sum + log.hoursSpent, 0);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:197',message:'After monthlyUsed calc',data:{monthlyUsed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        // Fallback to database field if query fails
        console.warn('Could not calculate monthly used from logs, using database field:', error);
        monthlyUsed = plan.supportHoursUsed ?? 0;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:201',message:'MonthlyUsed calc error fallback',data:{error:String(error),monthlyUsed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }
    } else {
      // For unlimited plans, still track usage for display
      monthlyUsed = plan.supportHoursUsed ?? 0;
    }
    
    // If we're in a new billing period, monthly hours reset (monthlyUsed = 0 for new period)
    const effectiveMonthlyUsed = isNewBillingPeriod ? 0 : monthlyUsed;
    const monthlyRemaining = isUnlimited ? -1 : Math.max(0, monthlyIncluded - effectiveMonthlyUsed);

    // Calculate rollover hours from records (these persist across billing periods)
    const rolloverTotal = plan.rolloverRecords?.reduce((sum, record) => sum + record.hoursRemaining, 0) || (plan.rolloverHours ?? 0);
    
    // Calculate total available hours - handle unlimited (-1)
    // Note: packHoursTotal is already calculated above (line 111)
    // Total includes: monthly (resets each period) + rollover (persists) + pack (persists)
    let totalAvailable: number;
    if (isUnlimited) {
      totalAvailable = -1;
    } else {
      // Total = monthly remaining + rollover hours (persist) + pack hours (persist)
      // This ensures rollover and pack hours don't reset when monthly hours reset
      totalAvailable = monthlyRemaining + rolloverTotal + packHoursTotal;
    }

    // Calculate estimated hours from pending project requests AND change requests
    // These are "reserved" hours that will be deducted when requests are approved/completed
    let estimatedHoursPending = 0;
    let estimatedRemaining = totalAvailable;
    
    try {
      // 1. Fetch pending ProjectRequests for this user
      // Don't use select to avoid schema mismatch issues - get all fields
      const pendingProjectRequests = await prisma.projectRequest.findMany({
        where: {
          userId: session.user.id,
          status: {
            in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO', 'APPROVED'],
          },
        },
      });

      // 2. Fetch pending ChangeRequests for this project
      const pendingChangeRequests = await prisma.changeRequest.findMany({
        where: {
          projectId: project.id,
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:270',message:'Estimated hours calculated',data:{projectRequestHours,changeRequestHours,estimatedHoursPending,totalAvailable},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // Calculate estimated remaining (what will be left after pending requests)
      // For unlimited plans, estimated remaining is still unlimited
      estimatedRemaining = isUnlimited 
        ? -1 
        : Math.max(0, totalAvailable - estimatedHoursPending);
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:277',message:'Estimated hours calc error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
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

    // Format hour packs list with all details including cost
    const hourPacksList = plan.hourPacks.map(pack => ({
      id: pack.id,
      packType: pack.packType,
      hours: pack.hours,
      hoursRemaining: pack.hoursRemaining,
      expiresAt: pack.expiresAt,
      neverExpires: pack.neverExpires,
      purchasedAt: pack.purchasedAt,
      cost: pack.cost ? Number(pack.cost) : 0, // Cost in cents
    }));
    
    // Calculate total amount spent on hour packs
    const totalSpentOnPacks = plan.hourPacks.reduce((sum, pack) => sum + (pack.cost ? Number(pack.cost) : 0), 0);

    // Format rollover expiring soon
    const rolloverExpiringSoon: Array<{ hours: number; expiresAt: string; daysUntilExpiry: number }> = [];
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
    }

    // Format pack hours expiring soon
    const packHoursExpiringSoon: Array<{ packId: string; packName: string; hours: number; expiresAt: string | null; daysUntilExpiry: number | null }> = [];
    if (plan.hourPacks && plan.hourPacks.length > 0) {
      const packNames: Record<string, string> = {
        SMALL: 'Starter Pack',
        MEDIUM: 'Growth Pack',
        LARGE: 'Scale Pack',
        PREMIUM: 'Premium Reserve',
      };
      
      plan.hourPacks.forEach((pack) => {
        if (pack.expiresAt && !pack.neverExpires) {
          const daysUntilExpiry = Math.ceil((pack.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
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

    // Return full HoursBalanceData format
    const responseData: any = {
      // Monthly hours
      monthlyIncluded,
      monthlyUsed,
      monthlyRemaining,
      
      // Rollover hours
      rolloverTotal,
      rolloverExpiringSoon,
      
      // Hour packs
      packHoursTotal,
      packHoursExpiringSoon,
      
      // Totals
      totalAvailable,
      estimatedHoursPending, // Hours estimated in pending project requests
      estimatedRemaining, // Hours remaining after pending requests are completed
      
      // Status
      isUnlimited,
      atLimit: !isUnlimited && totalAvailable <= 0,
      isOverage: plan.gracePeriodUsed ?? false,
      overageHours: 0,
      
      // Change requests
      changeRequestsIncluded: changeRequestsAllowed,
      changeRequestsUsed: plan.changeRequestsUsed || 0,
      changeRequestsRemaining: changeRequestsAllowed === -1 
        ? -1 
        : Math.max(0, changeRequestsAllowed - (plan.changeRequestsUsed || 0)),
      
      // Plan info
      tierName: tierConfig.name,
      periodEnd: plan.currentPeriodEnd?.toISOString(),
      onDemandEnabled: plan.onDemandEnabled ?? false,
      
      // Legacy fields for backward compatibility
      tier: tierConfig.id,
      monthlyHours: monthlyIncluded,
      hourPacks: packHoursTotal,
      rolloverHours: rolloverTotal,
      totalHours: totalAvailable,
      hourPacksList,
      totalSpentOnPacks, // Total amount spent on all hour packs (in cents)
      changeRequestsAllowed,
    };
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:447',message:'API response data',data:{monthlyUsed:responseData.monthlyUsed,monthlyIncluded:responseData.monthlyIncluded,totalAvailable:responseData.totalAvailable,estimatedHoursPending:responseData.estimatedHoursPending},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(responseData);
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hours/route.ts:451',message:'API error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("[GET /api/client/hours]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch hours information" },
      { status: 500 }
    );
  }
}
