import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio,
        location: user.location,
        timezone: user.timezone,
        phone: user.phone,
        company: user.company,
        role: user.role,
      },
      profile: user.profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validation = profileSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Split data between User and UserProfile models
    const userData: any = {};
    const profileData: any = {};
    
    // User table fields
    if (data.name !== undefined) userData.name = data.name;
    if (data.bio !== undefined) userData.bio = data.bio;
    if (data.phone !== undefined) userData.phone = data.phone;
    if (data.location !== undefined) userData.location = data.location;
    if (data.timezone !== undefined) userData.timezone = data.timezone;
    if (data.company !== undefined) userData.company = data.company;
    
    // UserProfile table fields
    if (data.organizationName !== undefined) profileData.organizationName = data.organizationName;
    if (data.industry !== undefined) profileData.industry = data.industry;
    if (data.organizationSize !== undefined) profileData.organizationSize = data.organizationSize;
    if (data.websiteUrl !== undefined) profileData.websiteUrl = data.websiteUrl || null;
    if (data.taxId !== undefined) profileData.taxId = data.taxId;
    if (data.businessAddress !== undefined) profileData.businessAddress = data.businessAddress;
    if (data.jobTitle !== undefined) profileData.jobTitle = data.jobTitle;
    if (data.department !== undefined) profileData.department = data.department;
    if (data.skills !== undefined) profileData.skills = data.skills;
    if (data.portfolioUrl !== undefined) profileData.portfolioUrl = data.portfolioUrl || null;
    if (data.githubUrl !== undefined) profileData.githubUrl = data.githubUrl || null;
    if (data.linkedinUrl !== undefined) profileData.linkedinUrl = data.linkedinUrl || null;
    if (data.twitterUrl !== undefined) profileData.twitterUrl = data.twitterUrl || null;
    if (data.yearsExperience !== undefined) profileData.yearsExperience = data.yearsExperience;
    if (data.hourlyRate !== undefined) profileData.hourlyRate = data.hourlyRate;
    if (data.availabilityStatus !== undefined) profileData.availabilityStatus = data.availabilityStatus;
    if (data.publicProfile !== undefined) profileData.publicProfile = data.publicProfile;
    
    // Update user
    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userData,
      });
    }
    
    // Update or create profile
    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          ...profileData,
          updatedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          ...profileData,
        },
      });
    }
    
    // Get updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        username: updatedUser!.username,
        image: updatedUser!.image,
        bio: updatedUser!.bio,
        location: updatedUser!.location,
        timezone: updatedUser!.timezone,
        phone: updatedUser!.phone,
        company: updatedUser!.company,
        role: updatedUser!.role,
      },
      profile: updatedUser!.profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}









