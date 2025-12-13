import { prisma } from "@/lib/prisma";

type FeedEventType =
  | "lead.created"
  | "project.created"
  | "status.changed"
  | "invoice.created"
  | "payment.succeeded"
  | "commit.summary"
  | "message.sent"
  | "subscription.updated"
  | "milestone.completed"
  | "file.uploaded"
  | "budget.set";

interface FeedEventPayload {
  [key: string]: any;
}

/**
 * Emit a feed event for a project.
 * This is the single source of truth for all project activity.
 * Both admin and client see the same feed with visibility filters.
 */
export async function emitFeedEvent(
  projectId: string,
  type: FeedEventType,
  payload?: FeedEventPayload
) {
  try {
    const event = await prisma.feedEvent.create({
      data: {
        projectId,
        type,
        payload: payload || {},
      },
    });

    console.log(`[Feed] ${type} emitted for project ${projectId}`, payload);
    return event;
  } catch (error) {
    console.error(`[Feed] Failed to emit ${type}:`, error);
    throw error;
  }
}

/**
 * Get feed events for a project with optional type filtering
 */
export async function getProjectFeed(
  projectId: string,
  options?: {
    types?: FeedEventType[];
    limit?: number;
    offset?: number;
  }
) {
  const { types, limit = 50, offset = 0 } = options || {};

  return prisma.feedEvent.findMany({
    where: {
      projectId,
      ...(types && types.length > 0 ? { type: { in: types } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

/**
 * Helper to determine if a feed event should be visible to clients
 */
export function isClientVisible(type: FeedEventType): boolean {
  const clientVisibleTypes: FeedEventType[] = [
    "project.created",
    "status.changed",
    "invoice.created",
    "payment.succeeded",
    "commit.summary",
    "message.sent",
    "subscription.updated",
    "milestone.completed",
    "file.uploaded",
    "budget.set",
  ];

  return clientVisibleTypes.includes(type);
}

/**
 * Get user-friendly event titles and descriptions
 */
export function getFeedEventDisplay(type: FeedEventType, payload?: any) {
  const displays: Record<FeedEventType, { icon: string; title: string; getDescription: (p: any) => string }> = {
    "lead.created": {
      icon: "📝",
      title: "Lead Created",
      getDescription: (p) => `New lead submitted by ${p?.name || "client"}`,
    },
    "project.created": {
      icon: "🚀",
      title: "Project Started",
      getDescription: (p) => `Project "${p?.name || "Untitled"}" has been created`,
    },
    "status.changed": {
      icon: "🔄",
      title: "Status Updated",
      getDescription: (p) => `Project status changed from ${p?.from || "unknown"} to ${p?.to || "unknown"}`,
    },
    "invoice.created": {
      icon: "💳",
      title: "Invoice Generated",
      getDescription: (p) => `${p?.type || "Invoice"} for $${((p?.amountCents || 0) / 100).toFixed(2)} created`,
    },
    "payment.succeeded": {
      icon: "✅",
      title: "Payment Received",
      getDescription: (p) => `Payment of $${((p?.amountCents || 0) / 100).toFixed(2)} received`,
    },
    "commit.summary": {
      icon: "💻",
      title: "Code Updated",
      getDescription: (p) => `${p?.commits?.length || 0} commit(s) pushed to repository`,
    },
    "message.sent": {
      icon: "💬",
      title: "New Message",
      getDescription: (p) => `Message from ${p?.role || "team"}`,
    },
    "subscription.updated": {
      icon: "🔔",
      title: "Subscription Updated",
      getDescription: (p) => `Maintenance plan updated to ${p?.plan || "unknown"}`,
    },
    "milestone.completed": {
      icon: "🎯",
      title: "Milestone Reached",
      getDescription: (p) => `${p?.title || "Milestone"} completed`,
    },
    "file.uploaded": {
      icon: "📎",
      title: "File Shared",
      getDescription: (p) => `${p?.fileName || "File"} uploaded`,
    },
    "budget.set": {
      icon: "💰",
      title: "Budget Set",
      getDescription: (p) => `Budget set to $${Number(p?.amount || 0).toFixed(2)}`,
    },
  };

  return displays[type] || { icon: "•", title: "Activity", getDescription: () => "Activity logged" };
}
