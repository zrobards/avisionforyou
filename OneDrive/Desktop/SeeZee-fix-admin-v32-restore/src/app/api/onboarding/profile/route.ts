import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Force Node.js runtime for Prisma support
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      console.error("Profile API: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, 
      phone, 
      company,
      bio,
      location,
      website,
      skills,
      jobTitle,
      portfolioUrl,
      profileImageUrl
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
        company: company || null,
        bio: bio || null,
        location: location || null,
        profileImageUrl: profileImageUrl || null,
        profileDoneAt: new Date(),
      },
    });

    // Create or update UserProfile with additional fields
    if (skills || jobTitle || portfolioUrl || website) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          websiteUrl: website || null,
          skills: skills || [],
          jobTitle: jobTitle || null,
          portfolioUrl: portfolioUrl || null,
        },
        update: {
          websiteUrl: website || null,
          skills: skills || [],
          jobTitle: jobTitle || null,
          portfolioUrl: portfolioUrl || null,
        },
      });
    }

    // If this is a CLIENT user, create a Lead record
    if (updatedUser.role === "CLIENT") {
      await prisma.lead.create({
        data: {
          name: name,
          email: updatedUser.email || "",
          phone: phone || null,
          company: company || null,
          message: "New client signup",
          source: "signup",
          status: "NEW",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
