"use server";

/**
 * Server actions for Links management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidatePath } from "next/cache";

export type LinkCategory = "DESIGN" | "DEVELOPMENT" | "MARKETING" | "TOOLS" | "DOCUMENTATION" | "OTHER";

interface CreateLinkParams {
  title: string;
  url: string;
  description?: string;
  category?: LinkCategory;
  icon?: string;
  color?: string;
  pinned?: boolean;
}

/**
 * Get all links
 */
export async function getLinks(filter?: { category?: LinkCategory; pinned?: boolean }) {
  await requireRole([ROLE.CEO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const where: any = {};

    if (filter?.category) {
      where.category = filter.category;
    }

    if (filter?.pinned !== undefined) {
      where.pinned = filter.pinned;
    }

    const links = await db.link.findMany({
      where,
      orderBy: [
        { pinned: "desc" },
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return { success: true, links };
  } catch (error) {
    console.error("Failed to fetch links:", error);
    return { success: false, error: "Failed to fetch links", links: [] };
  }
}

/**
 * Create a link
 */
export async function createLink(params: CreateLinkParams) {
  const user = await requireRole([ROLE.CEO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const link = await db.link.create({
      data: {
        title: params.title,
        url: params.url,
        description: params.description,
        category: params.category || "OTHER",
        icon: params.icon,
        color: params.color,
        pinned: params.pinned || false,
        createdById: user.id,
      },
    });

    revalidatePath("/admin/links");
    revalidatePath("/ceo/links");
    return { success: true, link };
  } catch (error) {
    console.error("Failed to create link:", error);
    return { success: false, error: "Failed to create link" };
  }
}

/**
 * Update a link
 */
export async function updateLink(linkId: string, data: Partial<CreateLinkParams>) {
  await requireRole([ROLE.CEO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const link = await db.link.update({
      where: { id: linkId },
      data,
    });

    revalidatePath("/admin/links");
    revalidatePath("/ceo/links");
    return { success: true, link };
  } catch (error) {
    console.error("Failed to update link:", error);
    return { success: false, error: "Failed to update link" };
  }
}

/**
 * Delete a link
 */
export async function deleteLink(linkId: string) {
  await requireRole([ROLE.CEO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    await db.link.delete({
      where: { id: linkId },
    });

    revalidatePath("/admin/links");
    revalidatePath("/ceo/links");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete link:", error);
    return { success: false, error: "Failed to delete link" };
  }
}

/**
 * Toggle link pinned status
 */
export async function toggleLinkPin(linkId: string) {
  await requireRole([ROLE.CEO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const link = await db.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    const updated = await db.link.update({
      where: { id: linkId },
      data: { pinned: !link.pinned },
    });

    revalidatePath("/admin/links");
    revalidatePath("/ceo/links");
    return { success: true, link: updated };
  } catch (error) {
    console.error("Failed to toggle link pin:", error);
    return { success: false, error: "Failed to toggle link pin" };
  }
}

/**
 * Reorder links
 */
export async function reorderLinks(linkIds: string[]) {
  await requireRole([ROLE.CEO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    // Update order for each link
    await Promise.all(
      linkIds.map((id, index) =>
        db.link.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    revalidatePath("/admin/links");
    revalidatePath("/ceo/links");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder links:", error);
    return { success: false, error: "Failed to reorder links" };
  }
}
