import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.siteSettings.findFirst();
    
    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await db.siteSettings.create({
        data: {
          instagramUrl: "https://www.instagram.com/avision_foryourecovery/",
          facebookPageUrl: "https://www.facebook.com/avisionforyourecovery",
          tiktokUsername: "avisionforyourecovery",
        },
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    logger.error({ err: error }, "Error fetching social settings");
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { instagramUrl, facebookPageUrl, tiktokUsername, snapWidgetId } = body;

    // Upsert settings (update if exists, create if not)
    const settings = await db.siteSettings.upsert({
      where: { id: "settings" },
      update: {
        instagramUrl: instagramUrl || null,
        facebookPageUrl: facebookPageUrl || null,
        tiktokUsername: tiktokUsername || null,
        snapWidgetId: snapWidgetId || null,
      },
      create: {
        id: "settings",
        instagramUrl: instagramUrl || null,
        facebookPageUrl: facebookPageUrl || null,
        tiktokUsername: tiktokUsername || null,
        snapWidgetId: snapWidgetId || null,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    logger.error({ err: error }, "Error saving social settings");
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
