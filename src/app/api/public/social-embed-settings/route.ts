import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst();
    
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          instagramUrl: "https://www.instagram.com/avision_foryourecovery/",
          facebookPageUrl: "https://www.facebook.com/avisionforyourecovery",
          tiktokUsername: "avisionforyourecovery",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching social embed settings:", error);
    return NextResponse.json(
      { 
        instagramUrl: "https://www.instagram.com/avision_foryourecovery/",
        facebookPageUrl: "https://www.facebook.com/avisionforyourecovery",
        tiktokUsername: "avisionforyourecovery",
      },
      { status: 200 }
    );
  }
}
