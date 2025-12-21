"use server";

/**
 * Server actions for Activity Feed
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { revalidateTag } from "next/cache";
import { tags } from "@/lib/tags";
import { ActivityType } from "@prisma/client";

/**
 * List activity feed items
 * @param limit - Maximum number of activities to return
 */
export async function listActivity(limit = 50) {
  await requireRole(["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"]);
  
  try {
    const activities = await db.activity.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return { success: true, activities };
  } catch (error) {
    console.error("Failed to list activities:", error);
    return { success: false, error: "Failed to load activities", activities: [] };
  }
}

/**
 * Log a new activity
 * @param data - Activity data including kind, message, and metadata
 */
export async function logActivity(data: {
  type: ActivityType;
  title: string;
  description?: string;
  userId?: string;
  metadata?: any;
}) {
  await requireRole(["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"]);
  
  try {
    const activity = await db.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        userId: data.userId,
        metadata: data.metadata ?? {},
        read: false,
      },
    });
    
    for (const tag of tags.activity) {
      revalidateTag(tag, {});
    }
    
    return { success: true, activity };
  } catch (error) {
    console.error("Failed to log activity:", error);
    return { success: false, error: "Failed to create activity" };
  }
}

/**
 * Mark an activity as read
 * @param activityId - ID of the activity to mark as read
 */
export async function markActivityAsRead(activityId: string) {
  await requireRole(["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"]);
  
  try {
    const activity = await db.activity.update({
      where: { id: activityId },
      data: { read: true },
    });
    
    for (const tag of tags.activity) {
      revalidateTag(tag, {});
    }
    
    return { success: true, activity };
  } catch (error) {
    console.error("Failed to mark activity as read:", error);
    return { success: false, error: "Failed to update activity" };
  }
}

/**
 * Mark all activities as read for the current user
 */
export async function markAllActivitiesAsRead() {
  await requireRole(["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"]);
  
  try {
    await db.activity.updateMany({
      where: { read: false },
      data: { read: true },
    });
    
    for (const tag of tags.activity) {
      revalidateTag(tag, {});
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all activities as read:", error);
    return { success: false, error: "Failed to update activities" };
  }
}

/**
 * Get count of unread activities
 */
export async function getUnreadActivityCount() {
  await requireRole(["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"]);
  
  try {
    const count = await db.activity.count({
      where: { read: false },
    });
    
    return { success: true, count };
  } catch (error) {
    console.error("Failed to get unread count:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Legacy compatibility - maps to listActivity
 */
export async function getActivityFeed(params?: { limit?: number }) {
  const result = await listActivity(params?.limit);
  return result;
}

/**
 * Create a new activity entry
 */
export async function createActivity(data: {
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  userId?: string;
}) {
  try {
    const activity = await db.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        metadata: data.metadata || {},
        userId: data.userId,
      },
    });

    for (const tag of tags.activity) {
      revalidateTag(tag, {});
    }
    return { success: true, activity };
  } catch (error) {
    console.error("Failed to create activity:", error);
    return { success: false, error: "Failed to create activity" };
  }
}
