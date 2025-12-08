/**
 * CEO Systems Overview
 */

import { prisma } from "@/lib/prisma";
import { SystemsClient } from "@/components/admin/SystemsClient";
import { ProjectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CEOSystemsPage() {
  // Get system stats from database
  const [sessionCount, projectCount] = await Promise.all([
    prisma.session.count(),
    prisma.project.count({
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
  ]);

  // Calculate uptime (simplified - in production, track actual uptime)
  const uptime = "99.9%"; // This would be calculated from actual uptime monitoring

  // Check database connection
  let dbStatus = "Online";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = "Error";
  }

  return (
    <SystemsClient
      uptime={uptime}
      dbStatus={dbStatus}
      activeSessions={sessionCount}
      activeProjects={projectCount}
    />
  );
}

