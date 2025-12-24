import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/upload/image";

/**
 * Remove profile image
 * DELETE /api/profile/remove-image
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current user's image URL
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (!user?.image) {
      return NextResponse.json(
        { error: "No profile image to remove" },
        { status: 400 }
      );
    }

    // Delete image from storage
    // TODO: Implement actual deletion from UploadThing
    // await deleteImage(user.image);

    // Remove image URL from user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({
      success: true,
      message: "Profile image removed successfully",
    });
  } catch (error) {
    console.error("Profile image removal error:", error);
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 }
    );
  }
}










