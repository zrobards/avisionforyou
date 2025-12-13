import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import WelcomeScreen from "@/components/client/dashboard/WelcomeScreen";
import ActionPanel from "@/components/client/dashboard/ActionPanel";
import ActivityFeed from "@/components/client/dashboard/ActivityFeed";
import StatusBadge from "@/components/ui/StatusBadge";
import { getComprehensiveDashboardData } from "@/lib/dashboard-helpers";
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
  
  // Check if user has no projects and no project requests
  const hasNoProjects = !data || data.projects.length === 0;
  const hasProjectRequests = data && (data.stats.activeRequests > 0 || (data.recentRequests && data.recentRequests.length > 0));
  
  // If no projects and no project requests, redirect to /start
  if (hasNoProjects && !hasProjectRequests) {
    redirect("/start");
  }
  
  // If no projects but has project requests, use DashboardClient which handles pre-client state
  if (hasNoProjects && hasProjectRequests) {
    return <DashboardClient />;
  }
  
  // User has projects, show the comprehensive dashboard
  const activeProjects = data.projects.filter((p) => {
    const status = String(p.status || '').toUpperCase();
    return ['ACTIVE', 'IN_PROGRESS', 'DESIGN', 'BUILD', 'REVIEW', 'PLANNING', 'LAUNCH'].includes(status);
  });
  
  return (
    <ComprehensiveDashboardClient 
      data={data}
      userName={session.user.name || undefined}
    />
  );
}
