/**
 * Maintenance Requests and Plans Management
 */

import { getMaintenanceSchedules, getMaintenanceClients, getMaintenanceStats } from "@/server/actions";
import { MaintenanceClient } from "@/components/admin/MaintenanceClient";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  // Auth check is handled in layout.tsx to prevent flash

  const [schedulesResult, clientsResult, statsResult] = await Promise.all([
    getMaintenanceSchedules(),
    getMaintenanceClients(),
    getMaintenanceStats(),
  ]);

  const schedules = schedulesResult.success ? schedulesResult.schedules : [];
  const clients = clientsResult.success ? clientsResult.clients : [];
  const maintenanceStats = statsResult.success ? statsResult.stats : {
    total: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0,
    active: 0,
    avgResponseTime: "N/A"
  };

  // Calculate stats
  const stats = {
    activePlans: clients.filter((c: any) => c.maintenanceSchedules?.some((s: any) => s.status === "ACTIVE")).length,
    pending: maintenanceStats.upcoming + maintenanceStats.overdue,
    resolvedThisWeek: schedules.filter((s: any) => {
      if (s.status !== "COMPLETED" || !s.completedAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(s.completedAt) > weekAgo;
    }).length,
    avgResponseTime: maintenanceStats.avgResponseTime,
  };

  return (
    <MaintenanceClient initialSchedules={schedules} clients={clients} stats={stats} />
  );
}


