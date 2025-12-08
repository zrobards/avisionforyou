"use server";

/**
 * Server actions for User Profile Management
 */

import { db } from "@/server/db";
import { getCurrentUser } from "@/lib/permissions";
import { revalidateTag } from "next/cache";
import { tags } from "@/lib/tags";

/**
 * Get current user's profile
 */
export async function getMyProfile() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        company: true,
        tosAcceptedAt: true,
        profileDoneAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Failed to get profile:", error);
    return { success: false, error: "Failed to load profile" };
  }
}

/**
 * Update current user's profile
 */
export async function updateMyProfile(data: {
  name?: string;
  phone?: string;
  company?: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await db.user.update({
      where: { id: currentUser.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.company !== undefined && { company: data.company }),
        profileDoneAt: new Date(),
      },
    });

    for (const tag of tags.team) {
      revalidateTag(tag, {});
    }

    return { success: true, user };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Update user's avatar/image
 */
export async function updateMyAvatar(imageUrl: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await db.user.update({
      where: { id: currentUser.id },
      data: { image: imageUrl },
    });

    for (const tag of tags.team) {
      revalidateTag(tag, {});
    }

    return { success: true, user };
  } catch (error) {
    console.error("Failed to update avatar:", error);
    return { success: false, error: "Failed to update avatar" };
  }
}
