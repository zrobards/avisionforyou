import { prisma } from "@/lib/prisma";

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
