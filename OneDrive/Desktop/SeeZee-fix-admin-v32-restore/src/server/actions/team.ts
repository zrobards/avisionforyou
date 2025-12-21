"use server";

/**
 * Server actions for Team Management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidateTag } from "next/cache";
import { tags } from "@/lib/tags";
import { UserRole } from "@prisma/client";

/**
 * List all team members
 * Allows all non-client roles (CEO, CFO, FRONTEND, BACKEND, OUTREACH)
 */
export async function listTeam() {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);
  
  try {
    // Define role order for proper sorting
    const roleOrder: Record<string, number> = {
      CEO: 1,
      CFO: 2,
      FRONTEND: 3,
      BACKEND: 4,
      OUTREACH: 5,
      CLIENT: 6,
    };
    
    const users = await db.user.findMany({
      // Include all users (team members AND clients) - filtering done in UI
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Sort users by role order, then by name
    const sortedUsers = users.sort((a, b) => {
      const aOrder = roleOrder[a.role] || 99;
      const bOrder = roleOrder[b.role] || 99;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return (a.name || a.email).localeCompare(b.name || b.email);
    });
    
    return { success: true, users: sortedUsers };
  } catch (error) {
    console.error("Failed to list team:", error);
    return { success: false, error: "Failed to load team", users: [] };
  }
}

/**
 * Update user role
 * @param userId - ID of the user
 * @param role - New role to assign
 */
export async function updateRole(userId: string, role: UserRole) {
  await requireRole([ROLE.CEO, ROLE.CFO]);
  
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { role },
    });
    
    for (const tag of tags.team) {
      revalidateTag(tag, {});
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

/**
 * Get user by ID
 * @param userId - ID of the user to fetch
 * Allows all non-client roles (CEO, CFO, FRONTEND, BACKEND, OUTREACH)
 */
export async function getUserById(userId: string) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);
  
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Failed to get user:", error);
    return { success: false, error: "Failed to load user" };
  }
}

/**
 * Update user profile
 * @param userId - ID of the user
 * @param data - Profile data to update (name, email)
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string }
) {
  await requireRole([ROLE.CEO]); // Only CEO can edit other users
  
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
    });
    
    for (const tag of tags.team) {
      revalidateTag(tag, {});
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return { success: false, error: "Failed to update user profile" };
  }
}

/**
 * Delete user
 * @param userId - ID of the user to delete
 */
export async function deleteUser(userId: string) {
  await requireRole([ROLE.CEO]); // Only CEO can delete users
  
  try {
    await db.user.delete({
      where: { id: userId },
    });
    
    for (const tag of tags.team) {
      revalidateTag(tag, {});
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
