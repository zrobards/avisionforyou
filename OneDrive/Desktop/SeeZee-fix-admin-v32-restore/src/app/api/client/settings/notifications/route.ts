import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  projectUpdates: z.boolean().optional(),
  invoiceReminders: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  executiveReports: z.boolean().optional(),
});

/**
 * GET /api/client/settings/notifications
 * Returns user notification preferences
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return defaults since we don't have a notification preferences table
    // In the future, you can add a UserPreferences model to Prisma
    return NextResponse.json({
      emailNotifications: true,
      projectUpdates: true,
      invoiceReminders: true,
      systemAlerts: true,
      executiveReports: true,
    });
  } catch (error: any) {
    console.error("[GET /api/client/settings/notifications]", error);
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
  }
}

/**
 * PUT /api/client/settings/notifications
 * Update user notification preferences
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = notificationSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
    }

    // For now, just return success
    // In the future, you can add a UserPreferences model to Prisma and save these settings
    // Example:
    // await prisma.userPreferences.upsert({
    //   where: { userId: session.user.id },
    //   update: parsed.data,
    //   create: { userId: session.user.id, ...parsed.data },
    // });

    return NextResponse.json({
      success: true,
      settings: parsed.data,
    });
  } catch (error: any) {
    console.error("[PUT /api/client/settings/notifications]", error);
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 });
  }
}











