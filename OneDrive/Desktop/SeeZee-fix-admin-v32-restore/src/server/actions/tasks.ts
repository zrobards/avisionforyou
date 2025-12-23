"use server";

/**
 * Server actions for Task management
 * Updated for role-based assignment and payout system
 */

import { db } from "@/server/db";
import { requireRole, getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidatePath } from "next/cache";
import { createActivity } from "./activity";
import { TodoStatus, TodoPriority, UserRole } from "@prisma/client";
import { auth } from "@/auth";

// Type aliases for backward compatibility
export type TaskStatus = TodoStatus;
export type TaskPriority = TodoPriority;

interface CreateTaskParams {
  title: string;
  description?: string;
  priority?: TodoPriority;
  assignedToId?: string;
  assignedToRole?: UserRole; // Role group assignment
  assignedToTeamId?: string; // Team/organization assignment
  projectId?: string;
  changeRequestId?: string; // Link to change request if auto-generated
  payoutAmount?: number;
  dueDate?: Date;
  estimatedHours?: number;
}

/**
 * Get all tasks - defaults to current user's tasks unless filters are provided
 */
export async function getTasks(filter?: {
  status?: TaskStatus;
  assignedToId?: string;
  assignedToRole?: UserRole;
  projectId?: string;
  showAll?: boolean; // If true, show all tasks (for admins)
}) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const where: any = {};

    // If assignedToRole filter is provided, use it
    if (filter?.assignedToRole) {
      where.assignedToRole = filter.assignedToRole;
    }

    // If showAll is true (for admins), don't filter by user
    if (filter?.showAll || user.role === ROLE.CEO || user.role === ROLE.CFO) {
      // Admins see all tasks, but still respect other filters
      if (filter?.assignedToId !== undefined) {
        if (filter.assignedToId !== null) {
          where.assignedToId = filter.assignedToId;
        } else {
          where.assignedToId = null;
        }
      }
    } else {
      // If assignedToId filter is provided, use it
      if (filter?.assignedToId !== undefined) {
        if (filter.assignedToId !== null) {
          where.assignedToId = filter.assignedToId;
        } else {
          where.assignedToId = null;
        }
      } else {
        // Default: show tasks assigned to current user OR tasks assigned to their role
        where.OR = [
          { assignedToId: user.id },
          { 
            assignedToRole: user.role as UserRole,
            assignedToId: null, // Available to claim
          },
        ];
      }
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.projectId) {
      where.projectId = filter.projectId;
    }

    const tasks = await db.todo.findMany({
      where,
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
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        // changeRequest: {
        //   select: {
        //     id: true,
        //     status: true,
        //     category: true,
        //     priority: true,
        //   },
        // },
      } as any,
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { dueDate: "asc" },
      ],
    });

    return { success: true, tasks };
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return { success: false, error: "Failed to fetch tasks", tasks: [] };
  }
}

/**
 * Get tasks by role group
 */
export async function getTasksByRole(role: UserRole, projectId?: string) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const where: any = {
      assignedToRole: role,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await db.todo.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // changeRequest: {
        //   select: {
        //     id: true,
        //     status: true,
        //     category: true,
        //     priority: true,
        //   },
        // },
      } as any,
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { dueDate: "asc" },
      ],
    });

    return { success: true, tasks };
  } catch (error) {
    console.error("Failed to fetch tasks by role:", error);
    return { success: false, error: "Failed to fetch tasks by role", tasks: [] };
  }
}

/**
 * Create a new task
 * Supports role-based assignment (assign to role group) or individual assignment
 * Allows CEO, CFO, and ADMIN users to create tasks
 */
export async function createTask(params: CreateTaskParams) {
  // Get current user and check if they have admin privileges
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if user has admin-like privileges (CEO, CFO, or ADMIN)
  // ADMIN role is mapped to CEO in getCurrentUser(), but we also check the original role
  const session = await auth();
  const originalRole = (session?.user?.role as string | undefined)?.toUpperCase();
  const isAdmin = user.role === ROLE.CEO || 
                  user.role === ROLE.CFO || 
                  originalRole === "ADMIN";

  if (!isAdmin) {
    return { success: false, error: "Insufficient permissions to create tasks" };
  }

  try {
    const task = await db.todo.create({
      data: {
        title: params.title,
        description: params.description,
        priority: params.priority || TodoPriority.MEDIUM,
        assignedToId: params.assignedToId,
        assignedToRole: params.assignedToRole,
        assignedToTeamId: params.assignedToTeamId,
        projectId: params.projectId,
        changeRequestId: params.changeRequestId,
        estimatedHours: params.estimatedHours,
        dueDate: params.dueDate,
        createdById: user.id,
        status: TodoStatus.TODO,
      } as any,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      } as any,
    });

    // Create activity
    await createActivity({
      type: "SYSTEM_ALERT",
      title: "New task created",
      description: params.title,
      userId: user.id,
    });

    revalidatePath("/admin/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

/**
 * Claim a task from a role group
 */
export async function claimTask(taskId: string) {
  const user = await requireRole([ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    // Get the task
    const task = await db.todo.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // Check if task is available to claim
    if (task.assignedToId) {
      return { success: false, error: "Task already assigned" };
    }

    // TODO: Add assignedToRole field to Todo model for role-based claiming
    // Check if user has the correct role
    // if (task.assignedToRole !== user.role) {
    //   return { success: false, error: "You don't have permission to claim this task" };
    // }

    // Update task
    const updatedTask = await db.todo.update({
      where: { id: taskId },
      data: {
        assignedToId: user.id,
        status: TodoStatus.IN_PROGRESS,
      } as any,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      } as any,
    });
    
    // TODO: Create taskClaim when model is added to schema
    // await db.taskClaim.create({
    //   data: {
    //     taskId,
    //     userId: user.id,
    //     status: "ACTIVE",
    //   },
    // });

    // Create activity
    await createActivity({
      type: "PROJECT_UPDATED",
      title: "Task claimed",
      description: `${user.name} claimed task: ${task.title}`,
      userId: user.id,
    });

    revalidatePath("/admin/tasks");
    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Failed to claim task:", error);
    return { success: false, error: "Failed to claim task" };
  }
}

/**
 * Submit a completed task for review
 */
export async function submitTask(taskId: string, submissionNotes?: string) {
  const user = await requireRole([ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    // Get the task
    const task = await db.todo.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // Check if user is the one who is assigned to it
    if (task.assignedToId !== user.id) {
      return { success: false, error: "You don't have permission to submit this task" };
    }

    // Update task
    const updatedTask = await db.todo.update({
      where: { id: taskId },
          data: {
            status: TodoStatus.SUBMITTED,
            submittedAt: new Date(),
            submissionNotes: submissionNotes || null,
          } as any,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        // TODO: Add claimedBy field to Todo model if needed
        // claimedBy: {
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //   },
        // },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      } as any,
    });

    // Create activity
    await createActivity({
      type: "PROJECT_UPDATED",
      title: "Task submitted for review",
      description: `${user.name} submitted task: ${task.title}`,
      userId: user.id,
    });

    revalidatePath("/admin/tasks");
    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Failed to submit task:", error);
    return { success: false, error: "Failed to submit task" };
  }
}

/**
 * Approve or reject a submitted task (CEO only)
 */
export async function approveTask(taskId: string, approved: boolean, notes?: string) {
  const user = await requireRole([ROLE.CEO]);

  try {
    // Get the task
    const task = await db.todo.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      } as any,
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    if (task.status !== TodoStatus.SUBMITTED) {
      return { success: false, error: "Task is not in submitted status" };
    }

    if (approved) {
      // Approve task - move to awaiting payout
      const updatedTask = await db.todo.update({
        where: { id: taskId },
        data: {
          status: "AWAITING_PAYOUT" as any,
          approvedAt: new Date(),
        } as any,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        } as any,
      });
      
      // TODO: Create taskPayout when model is added to schema
      // const payout = await db.taskPayout.create({
      //   data: {
      //     taskId,
      //     userId: task.assignedToId!,
      //     amount: task.payoutAmount || "0",
      //     status: "AWAITING_CLIENT_PAYMENT",
      //   },
      // });

      // Create activity
      await createActivity({
        type: "TASK_COMPLETED",
        title: "Task approved",
        description: `Task approved: ${task.title}`,
        userId: user.id,
      });

      revalidatePath("/admin/tasks");
      return { success: true, task: updatedTask };
    } else {
      // Reject task - reset to in progress
      const updatedTask = await db.todo.update({
        where: { id: taskId },
        data: {
          status: TodoStatus.IN_PROGRESS,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        } as any,
      });

      // Create activity
      await createActivity({
        type: "PROJECT_UPDATED",
        title: "Task rejected",
        description: `Task rejected: ${task.title}${notes ? ` - ${notes}` : ""}`,
        userId: user.id,
      });

      revalidatePath("/admin/tasks");
      return { success: true, task: updatedTask };
    }
  } catch (error) {
    console.error("Failed to approve task:", error);
    return { success: false, error: "Failed to approve task" };
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const task = await db.todo.update({
      where: { id: taskId },
      data: {
        status,
        ...(status === TodoStatus.DONE && { completedAt: new Date() }),
      },
    });

    // Create activity if task is completed
    if (status === TodoStatus.DONE) {
      await createActivity({
        type: "TASK_COMPLETED",
        title: "Task completed",
        description: task.title,
        userId: user.id,
      });
    }

    revalidatePath("/admin/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return { success: false, error: "Failed to update task status" };
  }
}

/**
 * Assign task to user
 */
export async function assignTask(taskId: string, userId: string) {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    const task = await db.todo.update({
      where: { id: taskId },
      data: {
        assignedToId: userId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to assign task:", error);
    return { success: false, error: "Failed to assign task" };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    await db.todo.delete({
      where: { id: taskId },
    });

    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

/**
 * Get task statistics
 */
export async function getTaskStats() {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    // For admins, show all tasks; for others, show only their tasks
    const baseFilter = (user.role === ROLE.CEO || user.role === ROLE.CFO) 
      ? {} 
      : { assignedToId: user.id };

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      db.todo.count({ where: baseFilter }),
      db.todo.count({ where: { ...baseFilter, status: TodoStatus.TODO } }),
      db.todo.count({ where: { ...baseFilter, status: TodoStatus.IN_PROGRESS } }),
      db.todo.count({ where: { ...baseFilter, status: TodoStatus.DONE } }),
      db.todo.count({
        where: {
          ...baseFilter,
          status: { not: TodoStatus.DONE },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      success: true,
      stats: { total, todo, inProgress, done, overdue },
    };
  } catch (error) {
    console.error("Failed to fetch task stats:", error);
    return {
      success: false,
      error: "Failed to fetch task stats",
      stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
    };
  }
}

/**
 * Bulk update task status
 */
export async function bulkUpdateTaskStatus(taskIds: string[], status: TaskStatus) {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    const result = await db.todo.updateMany({
      where: {
        id: { in: taskIds },
      },
      data: {
        status,
        ...(status === TodoStatus.DONE && { completedAt: new Date() }),
      },
    });

    revalidatePath("/admin/tasks");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to bulk update tasks:", error);
    return { success: false, error: "Failed to bulk update tasks", count: 0 };
  }
}

/**
 * Bulk assign tasks to a user
 */
export async function bulkAssignTasks(taskIds: string[], assignedToId: string | null) {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    const result = await db.todo.updateMany({
      where: {
        id: { in: taskIds },
      },
      data: {
        assignedToId,
      },
    });

    revalidatePath("/admin/tasks");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to bulk assign tasks:", error);
    return { success: false, error: "Failed to bulk assign tasks", count: 0 };
  }
}

/**
 * Bulk delete tasks
 */
export async function bulkDeleteTasks(taskIds: string[]) {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    const result = await db.todo.deleteMany({
      where: {
        id: { in: taskIds },
      },
    });

    revalidatePath("/admin/tasks");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to bulk delete tasks:", error);
    return { success: false, error: "Failed to bulk delete tasks", count: 0 };
  }
}

/**
 * Auto-generate a task from a change request
 * This is called automatically when a change request is created
 */
export async function createTaskFromChangeRequest(changeRequestId: string) {
  try {
    // Get the change request with project info
    const changeRequest = await db.changeRequest.findUnique({
      where: { id: changeRequestId },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!changeRequest) {
      console.error(`Change request ${changeRequestId} not found`);
      return { success: false, error: "Change request not found" };
    }

    // Check if task already exists for this change request
    // Note: This will only work after the migration adds changeRequestId field
    let existingTask = null;
    try {
      // Try to find by changeRequestId if field exists
      existingTask = await db.todo.findFirst({
        where: { changeRequestId } as any,
      });
    } catch (error) {
      // Field doesn't exist yet, try alternative method
      // Check by matching project and similar title
      const descriptionLines = changeRequest.description.split("\n");
      const title = descriptionLines[0] || changeRequest.description.substring(0, 50);
      existingTask = await db.todo.findFirst({
        where: {
          projectId: changeRequest.projectId,
          title: { contains: title.substring(0, 30) },
          createdAt: { gte: new Date(Date.now() - 60000) }, // Created in last minute
        },
      });
    }

    if (existingTask) {
      console.log(`Task already exists for change request ${changeRequestId}`);
      return { success: true, task: existingTask, alreadyExists: true };
    }

    // Get system user (CEO) for createdBy
    const systemUser = await db.user.findFirst({
      where: {
        role: { in: ["CEO", "ADMIN"] },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!systemUser) {
      console.error("No system user found to create task");
      return { success: false, error: "No system user found" };
    }

    // Map change request priority to task priority
    const priorityMap: Record<string, TodoPriority> = {
      LOW: TodoPriority.LOW,
      NORMAL: TodoPriority.MEDIUM,
      HIGH: TodoPriority.HIGH,
      URGENT: TodoPriority.HIGH,
      EMERGENCY: TodoPriority.HIGH,
    };

    // Map change request category to determine role assignment
    const categoryToRole: Record<string, UserRole | undefined> = {
      CONTENT: "OUTREACH",
      BUG: "BACKEND",
      FEATURE: "BACKEND",
      DESIGN: "DESIGNER",
      SEO: "OUTREACH",
      SECURITY: "BACKEND",
      OTHER: undefined,
    };

    // Extract title from description (first line or first 50 chars)
    const descriptionLines = changeRequest.description.split("\n");
    const title = descriptionLines[0] || changeRequest.description.substring(0, 50);
    const description = descriptionLines.length > 1 
      ? descriptionLines.slice(1).join("\n").trim()
      : changeRequest.description;

    // Create the task
    // Note: We create without assignedToRole first, then update it separately
    // to avoid Prisma client validation errors if the client is out of sync
    const roleAssignment = categoryToRole[changeRequest.category];
    
    const task = await db.todo.create({
      data: {
        title: title.length > 100 ? title.substring(0, 100) : title,
        description: description || null,
        priority: priorityMap[changeRequest.priority] || TodoPriority.MEDIUM,
        projectId: changeRequest.projectId,
        changeRequestId: changeRequest.id,
        estimatedHours: changeRequest.estimatedHours || null,
        createdById: systemUser.id,
        status: TodoStatus.TODO,
        column: "todo",
        position: 0,
      } as any,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        // changeRequest: {
        //   select: {
        //     id: true,
        //     status: true,
        //     category: true,
        //     priority: true,
        //   },
        // },
      } as any,
    });

    // Update assignedToRole separately using raw SQL to bypass Prisma client validation
    // This is necessary when the Prisma client is out of sync with the schema
    if (roleAssignment) {
      try {
        await db.$executeRawUnsafe(
          `UPDATE "todos" SET "assignedToRole" = $1::"UserRole" WHERE "id" = $2`,
          roleAssignment,
          task.id
        );
        // Refresh the task object to include the updated field
        const updatedTask = await db.todo.findUnique({
          where: { id: task.id },
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        if (updatedTask) {
          Object.assign(task, updatedTask);
        }
      } catch (error) {
        // If the field doesn't exist in the database yet, log but don't fail
        console.warn(`Failed to set assignedToRole for task ${task.id}:`, error);
      }
    }

    // Create activity
    await createActivity({
      type: "SYSTEM_ALERT",
      title: "Task auto-generated from change request",
      description: `Task created: ${title}`,
      userId: systemUser.id,
      metadata: { projectId: changeRequest.projectId },
    });

    console.log(`Task ${task.id} created from change request ${changeRequestId}`);
    return { success: true, task };
  } catch (error) {
    console.error("Failed to create task from change request:", error);
    return { success: false, error: "Failed to create task from change request" };
  }
}
