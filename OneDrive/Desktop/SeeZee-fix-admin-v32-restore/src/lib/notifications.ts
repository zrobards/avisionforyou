import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Get all admin users (CEO, CFO, FRONTEND, BACKEND, OUTREACH)
 */
async function getAdminUsers() {
  return await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.CEO, UserRole.CFO, UserRole.FRONTEND, UserRole.BACKEND, UserRole.OUTREACH],
      },
    },
    select: {
      id: true,
      email: true,
    },
  });
}

/**
 * Create notifications for all admin users
 */
async function notifyAllAdmins(
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR",
  title: string,
  message: string,
  projectId?: string
) {
  try {
    const admins = await getAdminUsers();
    
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        projectId: projectId || null,
        type,
        title,
        message,
        read: false,
      })),
    });
  } catch (error) {
    console.error("Failed to notify admins:", error);
    // Don't throw - notification failure shouldn't break operations
  }
}

/**
 * Create a notification when a task is assigned to a client
 */
export async function createTaskAssignedNotification(
  clientId: string,
  taskId: string,
  projectId: string,
  taskTitle: string
) {
  try {
    // Get project name for context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });

    const projectName = project?.name || "your project";

    await prisma.notification.create({
      data: {
        userId: clientId,
        projectId: projectId,
        type: "INFO",
        title: "New Task Assigned",
        message: `You have a new task: "${taskTitle}" for ${projectName}`,
        read: false,
      },
    });
  } catch (error) {
    console.error("Failed to create task assigned notification:", error);
    // Don't throw - notification failure shouldn't break task creation
  }
}

/**
 * Create a notification when a client completes a task
 */
export async function createTaskCompletedNotification(
  adminId: string,
  taskId: string,
  projectId: string,
  taskTitle: string,
  clientName?: string
) {
  try {
    // Get project name for context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });

    const projectName = project?.name || "project";
    const clientLabel = clientName || "Client";

    await prisma.notification.create({
      data: {
        userId: adminId,
        projectId: projectId,
        type: "SUCCESS",
        title: "Task Completed",
        message: `${clientLabel} completed task: "${taskTitle}" for ${projectName}`,
        read: false,
      },
    });
  } catch (error) {
    console.error("Failed to create task completed notification:", error);
    // Don't throw - notification failure shouldn't break task completion
  }
}

/**
 * Create a notification when a task is created (for client)
 */
export async function createTaskCreatedNotification(
  clientId: string,
  taskId: string,
  projectId: string,
  taskTitle: string
) {
  try {
    // Get project name for context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });

    const projectName = project?.name || "your project";

    await prisma.notification.create({
      data: {
        userId: clientId,
        projectId: projectId,
        type: "INFO",
        title: "New Task Created",
        message: `A new task "${taskTitle}" has been created for ${projectName}`,
        read: false,
      },
    });
  } catch (error) {
    console.error("Failed to create task created notification:", error);
    // Don't throw - notification failure shouldn't break task creation
  }
}

/**
 * Notify all admins assigned to a project when a client completes a task
 */
export async function notifyProjectAdmins(
  projectId: string,
  taskTitle: string,
  clientName?: string
) {
  try {
    // Get project and its assignee
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        assigneeId: true,
      },
    });

    if (!project) return;

    const projectName = project.name;
    const clientLabel = clientName || "Client";

    // Notify the assigned admin if exists
    if (project.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: project.assigneeId,
          projectId: projectId,
          type: "SUCCESS",
          title: "Task Completed",
          message: `${clientLabel} completed task: "${taskTitle}" for ${projectName}`,
          read: false,
        },
      });
    }

    // Also notify all admins (optional - can be removed if too noisy)
    // For now, we'll just notify the assigned admin
  } catch (error) {
    console.error("Failed to notify project admins:", error);
  }
}

/**
 * Create notification for all admins when a new lead is created
 */
export async function createNewLeadNotification(
  leadId: string,
  leadName: string,
  leadEmail: string,
  company?: string | null,
  source?: string | null
) {
  try {
    const companyText = company ? ` from ${company}` : "";
    const sourceText = source ? ` via ${source}` : "";
    
    await notifyAllAdmins(
      "INFO",
      "New Lead Received",
      `New lead: ${leadName}${companyText}${sourceText} (${leadEmail})`,
      undefined
    );
  } catch (error) {
    console.error("Failed to create new lead notification:", error);
  }
}

/**
 * Create notification for all admins when a new change request is created
 */
export async function createNewChangeRequestNotification(
  changeRequestId: string,
  projectId: string,
  description: string,
  clientName?: string,
  priority?: string
) {
  try {
    // Get project name for context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    const projectName = project?.name || "Unknown Project";
    const clientLabel = clientName || project?.organization?.name || "Client";
    const priorityText = priority && priority !== "NORMAL" ? ` (${priority} priority)` : "";
    const shortDescription = description.length > 100 
      ? description.substring(0, 100) + "..." 
      : description;

    await notifyAllAdmins(
      priority === "URGENT" || priority === "EMERGENCY" ? "WARNING" : "INFO",
      "New Change Request",
      `${clientLabel} submitted a change request${priorityText} for ${projectName}: ${shortDescription}`,
      projectId
    );
  } catch (error) {
    console.error("Failed to create new change request notification:", error);
  }
}

/**
 * Create notification for all admins when a client submits important information
 */
export async function createClientActivityNotification(
  projectId: string,
  activityType: string,
  message: string
) {
  try {
    await notifyAllAdmins(
      "INFO",
      "Client Activity",
      message,
      projectId
    );
  } catch (error) {
    console.error("Failed to create client activity notification:", error);
  }
}
