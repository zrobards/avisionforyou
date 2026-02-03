import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst();
    
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          instagramUrl: "https://www.instagram.com/avfyorg",
          facebookPageUrl: "https://www.facebook.com/AVFYorg",
          tiktokUsername: "avfyorg",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching social embed settings:", error);
    return NextResponse.json(
      { 
        instagramUrl: "https://www.instagram.com/avfyorg",
        facebookPageUrl: "https://www.facebook.com/AVFYorg",
        tiktokUsername: "avfyorg",
      },
      { status: 200 }
    );
  }
}
