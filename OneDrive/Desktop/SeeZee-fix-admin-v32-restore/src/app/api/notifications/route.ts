import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

/**
 * GET /api/notifications
 * Fetch notifications for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch notifications from database
    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to most recent 50
    });

    // Transform to match Notification interface
    const transformed = notifications.map((notif) => ({
      id: notif.id,
      type: mapNotificationType(notif.type),
      title: notif.title,
      message: notif.message,
      timestamp: notif.createdAt,
      read: notif.read,
      // Generate action URL based on type/message
      actionUrl: generateActionUrl(notif.type, notif.message, notif.projectId || undefined),
      actionLabel: generateActionLabel(notif.type),
    }));

    return NextResponse.json({ notifications: transformed });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await db.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await db.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          read: true,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

/**
 * Map Prisma NotificationType to UI NotificationType
 */
function mapNotificationType(type: string): "info" | "success" | "warning" | "error" | "maintenance" | "payment" | "task" {
  switch (type) {
    case "SUCCESS":
      return "success";
    case "WARNING":
      return "warning";
    case "ERROR":
      return "error";
    default:
      return "info";
  }
}

/**
 * Generate action URL based on notification content
 */
function generateActionUrl(type: string, message: string, projectId?: string | null): string | undefined {
  // Check message for common patterns
  if (message.toLowerCase().includes("new lead")) {
    return "/admin/pipeline/leads";
  }
  if (message.toLowerCase().includes("change request")) {
    if (projectId) {
      return `/admin/projects/${projectId}`;
    }
    return "/admin/maintenance";
  }
  if (message.toLowerCase().includes("maintenance")) {
    return "/admin/maintenance";
  }
  if (message.toLowerCase().includes("invoice") || message.toLowerCase().includes("payment")) {
    return "/admin/pipeline/invoices";
  }
  if (message.toLowerCase().includes("task")) {
    if (projectId) {
      return `/admin/projects/${projectId}`;
    }
    return "/admin/tasks";
  }
  if (message.toLowerCase().includes("lead")) {
    return "/admin/pipeline/leads";
  }
  if (message.toLowerCase().includes("project")) {
    if (projectId) {
      return `/admin/projects/${projectId}`;
    }
    return "/admin/pipeline/projects";
  }
  return undefined;
}

/**
 * Generate action label based on notification type
 */
function generateActionLabel(type: string): string | undefined {
  switch (type) {
    case "SUCCESS":
      return "View";
    case "WARNING":
      return "Review";
    case "ERROR":
      return "Fix";
    default:
      return "View";
  }
}









