/**
 * CEO Systems Overview
 */

import { db } from "@/server/db";
import { SystemsClient } from "@/components/admin/SystemsClient";
import { ProjectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CEOSystemsPage() {
  // Get accurate system stats from database
  const [
    activeUsers,
    totalOrganizations,
    activeProjects,
    totalProjects,
    activeMaintenancePlans,
    totalInvoices,
  ] = await Promise.all([
    // Active users (users with recent activity in last 30 days)
    db.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    // Total organizations
    db.organization.count(),
    // Active projects
    db.project.count({
      where: {
        status: { 
          in: [
            ProjectStatus.ACTIVE,
            ProjectStatus.REVIEW,
            ProjectStatus.DEPOSIT_PAID,
            ProjectStatus.QUOTED,
            ProjectStatus.MAINTENANCE
          ] 
        },
      },
    }),
    // Total projects
    db.project.count(),
    // Active maintenance plans
    db.maintenancePlan.count({
      where: { status: "ACTIVE" },
    }),
    // Total invoices
    db.invoice.count(),
  ]);

  // Calculate uptime (simplified - in production, track actual uptime)
  const uptime = "99.9%"; // This would be calculated from actual uptime monitoring

  // Check database connection
  let dbStatus = "Online";
  try {
    await db.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = "Error";
  }

  return (
    <SystemsClient
      uptime={uptime}
      dbStatus={dbStatus}
      activeUsers={activeUsers}
      totalOrganizations={totalOrganizations}
      activeProjects={activeProjects}
      totalProjects={totalProjects}
      activeMaintenancePlans={activeMaintenancePlans}
      totalInvoices={totalInvoices}
    />
  );
}

