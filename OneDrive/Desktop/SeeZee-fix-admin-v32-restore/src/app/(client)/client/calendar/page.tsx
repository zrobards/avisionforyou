import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import { ClientCalendarClient } from "@/components/client/ClientCalendarClient";

export const dynamic = "force-dynamic";

export default async function ClientCalendarPage() {
  const session = await requireAuth();

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

  // Get user's projects
  const projects = await db.project.findMany({
    where: {
      organizationId: orgMembership.organizationId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Get calendar events (meetings) for user's projects and organization
  const calendarEvents = await db.calendarEvent.findMany({
    where: {
      OR: [
        { organizationId: orgMembership.organizationId },
        { projectId: { in: projects.map(p => p.id) } },
        { createdBy: session.user.id },
        { attendees: { has: session.user.email || '' } },
      ],
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Get billing dates from active maintenance plans
  const maintenancePlans = await db.maintenancePlan.findMany({
    where: {
      project: {
        organizationId: orgMembership.organizationId,
      },
      status: 'ACTIVE',
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Serialize events
  const serializedEvents = calendarEvents.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    status: event.status,
    meetingUrl: event.meetingUrl,
    project: event.project,
    organization: event.organization,
    color: event.color,
    type: 'meeting' as const,
  }));

  // Create billing date events
  const billingEvents = maintenancePlans
    .filter(plan => plan.currentPeriodEnd)
    .map((plan) => ({
      id: `billing-${plan.id}`,
      title: `Billing Date: ${plan.project.name}`,
      description: `Next billing date for ${plan.project.name}`,
      startTime: plan.currentPeriodEnd!.toISOString(),
      endTime: plan.currentPeriodEnd!.toISOString(),
      status: 'SCHEDULED' as const,
      meetingUrl: null,
      project: plan.project,
      organization: null,
      color: '#8B5CF6', // Purple for billing
      type: 'billing' as const,
    }));

  const allEvents = [...serializedEvents, ...billingEvents];

  return (
    <ClientCalendarClient 
      events={allEvents}
      projects={projects}
      currentUser={{
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email || '',
      }}
    />
  );
}

