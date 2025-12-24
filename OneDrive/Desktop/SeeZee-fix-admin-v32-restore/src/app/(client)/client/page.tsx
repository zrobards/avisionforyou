import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import WelcomeScreen from "@/components/client/dashboard/WelcomeScreen";
import ActionPanel from "@/components/client/dashboard/ActionPanel";
import ActivityFeed from "@/components/client/dashboard/ActivityFeed";
import StatusBadge from "@/components/ui/StatusBadge";
import { getComprehensiveDashboardData } from "@/lib/dashboard-helpers";
import { getHoursBalanceAction } from "./actions/hours";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { 
  FiArrowRight, 
  FiFolder, 
  FiFileText, 
  FiMessageSquare, 
  FiCheckCircle,
  FiPlus,
} from "react-icons/fi";
import ComprehensiveDashboardClient from "./components/ComprehensiveDashboardClient";
import DashboardClient from "./components/DashboardClient";

export default async function ClientDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?returnUrl=/client");
  }
  
  const { id: userId, email } = session.user;
  
  if (!userId || !email) {
    return (
      <div className="rounded-xl border border-red-700 bg-red-900/30 p-6 text-center">
        <p className="text-red-300">Invalid session. Please log in again.</p>
      </div>
    );
  }

  // Check onboarding status - session has fresh data from JWT callback
  // If onboarding not complete, redirect to appropriate step
  if (!session.user.tosAcceptedAt) {
    redirect("/onboarding/tos");
  }
  
  if (!session.user.profileDoneAt) {
    redirect("/onboarding/profile");
  }
  
  // CRITICAL: First check if user has projects or project requests
  // Users must create a project before accessing the client dashboard
  const { prisma } = await import('@/lib/prisma');
  const { getClientAccessContext } = await import('@/lib/client-access');
  
  const identity = {
    userId: userId,
    email: email,
  };
  const access = await getClientAccessContext(identity);
  
  // Quick check for projects or project requests
  const hasProjects = await prisma.project.findFirst({
    where: {
      OR: [
        { organizationId: { in: access.organizationIds } },
        { id: { in: access.leadProjectIds } },
      ],
    },
    select: { id: true },
  });
  
  const hasProjectRequests = await prisma.projectRequest.findFirst({
    where: {
      contactEmail: email,
      status: {
        in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO', 'APPROVED'],
      },
    },
    select: { id: true },
  });
  
  // CRITICAL: If no projects and no project requests, redirect to /start to create a project
  // This must happen BEFORE any subscription checks to prevent redirect loops
  if (!hasProjects && !hasProjectRequests) {
    redirect("/start");
  }
  
  // Only check subscriptions if user has projects or project requests
  // Now check if user has an active paid subscription before allowing access
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client/page.tsx:56',message:'Checking subscription access',data:{email:email,userId:userId,organizationIds:access.organizationIds,leadProjectIds:access.leadProjectIds},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Check for active maintenance plan - allow access if:
  // 1. Has active plan with paid subscription, OR
  // 2. Has active plan with hour packs (even if subscription not paid yet)
  const hasActivePlan = await prisma.maintenancePlan.findFirst({
    where: {
      project: {
        OR: [
          { organizationId: { in: access.organizationIds } },
          { id: { in: access.leadProjectIds } },
        ],
      },
      status: 'ACTIVE',
    },
    include: {
      project: {
        include: {
          organization: true,
        },
      },
      hourPacks: {
        where: {
          isActive: true,
          hoursRemaining: { gt: 0 },
        },
        take: 1,
      },
    },
  });

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client/page.tsx:78',message:'Subscription check result',data:{email:email,hasActivePlan:!!hasActivePlan,planId:hasActivePlan?.id||null,stripeSubscriptionId:hasActivePlan?.stripeSubscriptionId||null,hasHourPacks:hasActivePlan?.hourPacks?.length||0},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Check if they have either paid subscription OR hour packs
  const hasPaidSubscription = hasActivePlan?.stripeSubscriptionId !== null;
  const hasHourPacks = (hasActivePlan?.hourPacks?.length || 0) > 0;
  
  // If no active plan, or no subscription AND no hour packs, redirect to subscription setup
  if (!hasActivePlan || (!hasPaidSubscription && !hasHourPacks)) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client/page.tsx:81',message:'BLOCKED - redirecting to subscriptions',data:{email:email,userId:userId,hasActivePlan:!!hasActivePlan,hasPaidSubscription,hasHourPacks,redirectingTo:'/client/subscriptions?payment_required=true'},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    redirect("/client/subscriptions?payment_required=true");
  }

  // Fetch comprehensive dashboard data with error handling
  let data;
  try {
    data = await getComprehensiveDashboardData(userId, email);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return (
      <div className="rounded-xl border border-red-700 bg-red-900/30 p-6 text-center">
        <p className="text-red-300 mb-2">Error loading dashboard</p>
        <p className="text-sm text-red-400">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
        <Link 
          href="/client" 
          className="mt-4 inline-block text-blue-400 hover:text-blue-300"
        >
          Try Again
        </Link>
      </div>
    );
  }
  
  // Check if user has no projects and no project requests (fallback check using dashboard data)
  const hasNoProjects = !data || data.projects.length === 0;
  const hasActiveProjectRequests = data && (data.stats.activeRequests > 0 || (data.recentRequests && data.recentRequests.length > 0));
  
  // If no projects and no project requests, redirect to /start
  if (hasNoProjects && !hasActiveProjectRequests) {
    redirect("/start");
  }
  
  // If no projects but has project requests, use DashboardClient which handles pre-client state
  if (hasNoProjects && hasActiveProjectRequests) {
    return <DashboardClient />;
  }
  
  // User has projects, show the comprehensive dashboard
  const activeProjects = data.projects.filter((p) => {
    const status = String(p.status || '').toUpperCase();
    return ['ACTIVE', 'IN_PROGRESS', 'DESIGN', 'BUILD', 'REVIEW', 'PLANNING', 'LAUNCH'].includes(status);
  });
  
  // Fetch hours balance if user has a maintenance plan
  // Always fetch fresh data (no caching) to ensure hours are up-to-date
  const hoursBalance = await getHoursBalanceAction();
  
  return (
    <ComprehensiveDashboardClient 
      data={data}
      userName={session.user.name || undefined}
      hoursBalance={hoursBalance}
    />
  );
}
