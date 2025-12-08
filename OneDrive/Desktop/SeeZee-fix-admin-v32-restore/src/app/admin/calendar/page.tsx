/**
 * Global SeeZee Calendar
 * Shows all tasks, deadlines, and events across the organization
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { db } from "@/server/db";
import { CalendarClient } from "@/components/admin/CalendarClient";
import { AdminAppShell } from "@/components/admin/AdminAppShell";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Fetch all tasks across the organization (for CEO/CFO)
  // or just user's tasks (for staff)
  const isCEOorAdmin = user.role === ROLE.CEO || user.role === ROLE.CFO;

  const tasks = await db.todo.findMany({
    where: isCEOorAdmin ? {} : { assignedToId: user.id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { dueDate: "asc" },
      { priority: "desc" },
    ],
  });

  // Fetch maintenance schedules
  const maintenanceSchedules = await db.maintenanceSchedule.findMany({
    where: {
      status: {
        in: ["ACTIVE", "UPCOMING"],
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: {
      scheduledFor: "asc",
    },
  });

  // Fetch project deadlines with milestones
  const projects = await db.project.findMany({
    where: {
      status: {
        in: ["ACTIVE", "REVIEW"],
      },
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      milestones: {
        where: {
          completed: false,
        },
        orderBy: {
          dueDate: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize projects to convert Decimal budget to number
  // Explicitly construct objects to avoid passing Prisma Decimal objects
  const serializedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    budget: project.budget ? Number(project.budget) : null,
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    assigneeId: project.assigneeId,
    leadId: project.leadId,
    organizationId: project.organizationId,
    questionnaireId: project.questionnaireId,
    stripeCustomerId: project.stripeCustomerId,
    stripeSubscriptionId: project.stripeSubscriptionId,
    maintenancePlan: project.maintenancePlan,
    maintenanceStatus: project.maintenanceStatus,
    nextBillingDate: project.nextBillingDate,
    githubRepo: project.githubRepo,
    organization: project.organization,
    milestones: project.milestones,
  }));

  return (
    <AdminAppShell user={user}>
      <CalendarClient
        tasks={tasks}
        maintenanceSchedules={maintenanceSchedules}
        projects={serializedProjects}
        currentUser={{
          id: user.id,
          name: user.name,
          email: user.email || "",
          role: user.role,
        }}
        viewMode={isCEOorAdmin ? "organization" : "personal"}
      />
    </AdminAppShell>
  );
}
