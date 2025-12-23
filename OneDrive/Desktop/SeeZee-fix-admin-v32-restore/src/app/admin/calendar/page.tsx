/**
 * Global SeeZee Calendar
 * Shows all tasks, deadlines, and events across the organization
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { db } from "@/server/db";
import { CalendarClient } from "@/components/admin/CalendarClient";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Fetch all tasks across the organization (for CEO/CFO)
  // or just user's tasks (for staff)
  const isCEOorAdmin = user.role === ROLE.CEO || user.role === ROLE.CFO;

  // Fetch calendar events (new model)
  const now = new Date();
  const calendarRangeStart = startOfMonth(now);
  const calendarRangeEnd = endOfMonth(addMonths(now, 3));

  const calendarEvents = await db.calendarEvent.findMany({
    where: {
      startTime: {
        gte: calendarRangeStart,
        lte: calendarRangeEnd,
      },
    },
    include: {
      organization: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });

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
  // Use explicit select to avoid issues with columns that may not exist in production
  const projects = await db.project.findMany({
    where: {
      status: {
        in: ["ACTIVE", "REVIEW"],
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      budget: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      assigneeId: true,
      leadId: true,
      organizationId: true,
      questionnaireId: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      maintenancePlan: true,
      maintenanceStatus: true,
      nextBillingDate: true,
      githubRepo: true,
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

  // Serialize calendar events
  const serializedCalendarEvents = calendarEvents.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status,
    meetingUrl: event.meetingUrl,
    createdBy: event.createdBy,
    project: event.project,
    organization: event.organization,
  }));

  return (
    <CalendarClient
      tasks={tasks}
      maintenanceSchedules={maintenanceSchedules}
      projects={serializedProjects}
      calendarEvents={serializedCalendarEvents}
      currentUser={{
        id: user.id,
        name: user.name,
        email: user.email || "",
        role: user.role,
      }}
      viewMode={isCEOorAdmin ? "organization" : "personal"}
    />
  );
}
