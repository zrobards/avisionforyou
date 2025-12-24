import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateImage, MAX_FILE_SIZE } from "@/lib/upload/image";
import { rateLimitByUser, RateLimits, createRateLimitResponse } from "@/lib/rate-limit";

/**
 * Upload profile image
 * POST /api/profile/upload-image
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimit = rateLimitByUser(session.user.id, "profile-image-upload", RateLimits.FILE_UPLOAD);
    const rateLimitResponse = createRateLimitResponse(rateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // ⚠️ WARNING: This is a placeholder implementation
    // The file is NOT actually being saved to disk or cloud storage
    // TODO: Implement actual file upload using one of these methods:
    // 1. UploadThing (recommended for this app)
    // 2. Vercel Blob Storage
    // 3. AWS S3
    // 4. Cloudinary
    
    // Get current user to check for existing image
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // TODO: Delete old image from storage if it exists
    // if (user?.image) {
    //   await deleteImage(user.image);
    // }

    // ⚠️ PLACEHOLDER: This URL points to nowhere - file is not actually saved
    // For now, we'll use a data URL or external avatar service
    // Convert blob to base64 for temporary storage in database
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const imageUrl = `data:${file.type};base64,${base64}`;

    // Update user profile image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      success: true,
      url: imageUrl,
      imageUrl, // Keep for backward compatibility
      message: "Profile image uploaded successfully",
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
      },
      { status: 500 }
    );
  }
}










