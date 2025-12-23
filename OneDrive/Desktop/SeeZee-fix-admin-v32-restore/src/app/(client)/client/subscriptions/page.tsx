import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import { SubscriptionsClient } from "@/components/client/SubscriptionsClient";
import { NONPROFIT_TIERS, getTier } from "@/lib/config/tiers";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<{ payment_required?: string; upgraded?: string; session_id?: string }> }) {
  const session = await requireAuth();
  const params = await searchParams;
  const paymentRequired = params.payment_required === 'true';
  const upgraded = params.upgraded === 'true';
  const sessionId = params.session_id;

  // CRITICAL: First check if user has projects or project requests
  // Users must create a project before accessing subscriptions
  const { getClientAccessContext } = await import('@/lib/client-access');
  const access = await getClientAccessContext({ 
    userId: session.user.id, 
    email: session.user.email 
  });

  // Quick check for projects or project requests
  const hasProjects = await db.project.findFirst({
    where: {
      OR: [
        { organizationId: { in: access.organizationIds } },
        { id: { in: access.leadProjectIds } },
      ],
    },
    select: { id: true },
  });
  
  const hasProjectRequests = await db.projectRequest.findFirst({
    where: {
      contactEmail: session.user.email ?? undefined,
      status: {
        in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO', 'APPROVED'],
      },
    },
    select: { id: true },
  });
  
  // If no projects and no project requests, redirect to /start to create a project
  if (!hasProjects && !hasProjectRequests) {
    const { redirect } = await import('next/navigation');
    redirect("/start");
  }

  // Get user's organization
  const orgMembership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: true,
    },
  });

  if (!orgMembership) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Organization Found</h2>
          <p className="text-gray-400">You are not associated with any organization.</p>
        </div>
      </div>
    );
  }

  // Get all projects for this organization with active maintenance plans
  const projects = await db.project.findMany({
    where: {
      organizationId: orgMembership.organizationId,
      maintenancePlanRel: {
        status: 'ACTIVE',
      },
    },
    include: {
      maintenancePlanRel: true,
      changeRequests: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      invoices: {
        where: {
          status: 'PAID',
        },
        orderBy: {
          paidAt: 'desc',
        },
        select: {
          id: true,
          total: true,
          paidAt: true,
          invoiceType: true,
        },
      },
      projectQuestionnaire: {
        select: {
          responses: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Serialize maintenance plans data - only use MaintenancePlan records
  const subscriptionsData: any[] = [];
  
  projects.forEach((project) => {
    if (!project.maintenancePlanRel) return;
    
    const plan = project.maintenancePlanRel;
    const tierKey = (plan.tier || 'ESSENTIALS').toUpperCase() as keyof typeof NONPROFIT_TIERS;
    const tierConfig = getTier(tierKey) || NONPROFIT_TIERS.ESSENTIALS;
    
    // Get change requests from project (they're related to project, not MaintenancePlan)
    const changeRequests = project.changeRequests || [];
    
    // Change requests are tied to hours - no separate limit
    // If hours are unlimited, change requests are unlimited
    const isUnlimitedHours = tierConfig.supportHoursIncluded === -1;
    
    subscriptionsData.push({
      id: plan.id,
      projectId: project.id,
      projectName: project.name,
      stripeId: plan.stripeSubscriptionId || '',
      priceId: '',
      status: plan.status === 'ACTIVE' ? 'active' : plan.status.toLowerCase(),
      planName: tierConfig.name, // Use proper tier name
      tier: tierConfig.id, // ESSENTIALS, DIRECTOR, COO
      tierName: tierConfig.name, // Full name like "Digital COO System"
      currentPeriodEnd: plan.currentPeriodEnd ? new Date(plan.currentPeriodEnd).toISOString() : null,
      changeRequestsAllowed: isUnlimitedHours ? -1 : -1, // Always unlimited - tied to hours
      changeRequestsUsed: 0, // Not tracked separately
      resetDate: plan.currentPeriodEnd ? new Date(plan.currentPeriodEnd).toISOString() : null,
      createdAt: plan.createdAt?.toISOString() || new Date().toISOString(),
      additionalCost: 0,
      isAddon: false,
      changeRequests: changeRequests.map((cr) => ({
        id: cr.id,
        description: cr.description,
        status: cr.status,
        createdAt: cr.createdAt.toISOString(),
        completedAt: cr.completedAt?.toISOString() || null,
      })),
      projectTotalPaid: project.invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
      projectPackage: project.projectQuestionnaire?.responses 
        ? (project.projectQuestionnaire.responses as any)?.package || null
        : null,
      projectFeatures: project.projectQuestionnaire?.responses
        ? (project.projectQuestionnaire.responses as any)?.selectedFeatures || []
        : [],
      monthlyPrice: Number(plan.monthlyPrice),
      isMaintenancePlan: true,
    });
  });

  // Calculate totals using tier config pricing
  const totalMonthlyCost = subscriptionsData
    .filter((s) => s.status === 'active')
    .reduce((sum, sub) => {
      const tierKey = (sub.tier || 'ESSENTIALS').toUpperCase() as keyof typeof NONPROFIT_TIERS;
      const tierConfig = getTier(tierKey) || NONPROFIT_TIERS.ESSENTIALS;
      return sum + tierConfig.monthlyPrice;
    }, 0);

  const totalAnnualCost = totalMonthlyCost * 12;

  const totalPaid = projects.reduce((sum, project) => 
    sum + project.invoices.reduce((invSum, inv) => invSum + Number(inv.total), 0), 0
  );

  return (
    <SubscriptionsClient 
      subscriptions={subscriptionsData}
      totalMonthlyCost={totalMonthlyCost}
      totalAnnualCost={totalAnnualCost}
      totalPaid={totalPaid}
      paymentRequired={paymentRequired}
      upgraded={upgraded}
      sessionId={sessionId}
    />
  );
}



