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
  
  // Fetch comprehensive dashboard data
  const data = await getComprehensiveDashboardData(userId, email);
  
  // No projects? Show welcome screen
  if (data.projects.length === 0) {
    return <WelcomeScreen userName={session.user.name || undefined} />;
  }
  
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
