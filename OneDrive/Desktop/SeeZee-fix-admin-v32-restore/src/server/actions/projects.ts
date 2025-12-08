"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { emitFeedEvent } from "@/lib/feed";
import { ProjectStatus } from "@prisma/client";

/**
 * Update project status and emit feed event
 */
export async function updateProjectStatus(projectId: string, newStatus: ProjectStatus) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    throw new Error("Unauthorized");
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const oldStatus = project.status;

    await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    // Emit status change event
    await emitFeedEvent(projectId, "status.changed", {
      from: oldStatus,
      to: newStatus,
      by: session.user.name,
      timestamp: new Date().toISOString(),
    });

    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/client/projects/${projectId}`);
    revalidatePath("/admin/pipeline");

    return { success: true };
  } catch (error) {
    console.error("[updateProjectStatus] Error:", error);
    throw error;
  }
}

/**
 * SeeZee V2: Update project budget and pricing configuration
 * CEO/CFO action to set manual pricing for a project
 */
export async function updateProjectBudget(
  projectId: string,
  totalPrice: number,
  depositPercent: number = 50,
  finalPercent: number = 50
) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    return { success: false, error: "Unauthorized: CEO or CFO role required" };
  }

  try {
    // Validate inputs
    if (totalPrice <= 0) {
      return { success: false, error: "Total price must be greater than 0" };
    }

    if (depositPercent + finalPercent !== 100) {
      return { success: false, error: "Deposit and final percentages must sum to 100" };
    }

    if (depositPercent < 0 || finalPercent < 0) {
      return { success: false, error: "Percentages must be positive" };
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Update project with new budget
    await prisma.project.update({
      where: { id: projectId },
      data: {
        budget: totalPrice,
      },
    });

    // Emit feed event
    await emitFeedEvent(projectId, "budget.set", {
      amount: totalPrice,
      depositPercent,
      finalPercent,
      setBy: session.user.name,
      timestamp: new Date().toISOString(),
    });

    // Revalidate paths
    revalidatePath(`/admin/pipeline/projects/${projectId}`);
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/admin/pipeline");

    return { success: true };
  } catch (error) {
    console.error("[updateProjectBudget] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

/**
 * Complete a milestone and emit feed event
 * NOTE: Requires Milestone model in schema - currently commented out
 */
export async function completeMilestone(milestoneId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Milestone completion - model exists but needs to be verified
    // Uncomment when Milestone model relationships are confirmed in schema
    /*
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        completed: true,
        completedAt: new Date(),
      },
      include: {
        project: { select: { id: true } },
      },
    });

    await emitFeedEvent(milestone.project.id, "milestone.completed", {
      milestoneId: milestone.id,
      title: milestone.title,
      description: milestone.description,
      completedBy: session.user.name,
    });

    revalidatePath(`/admin/projects/${milestone.project.id}`);
    revalidatePath(`/client/projects/${milestone.project.id}`);

    return { success: true };
    */
    
    throw new Error("Milestone model not yet implemented in schema");
  } catch (error) {
    console.error("[completeMilestone] Error:", error);
    throw error;
  }
}
