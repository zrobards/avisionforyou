import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin roles can upload recordings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const adminRoles = ["CEO", "CFO"];
    if (!adminRoles.includes(user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const projectId = formData.get("projectId") as string | null;

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/webm",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an audio or video file." },
        { status: 400 }
      );
    }

    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 500MB" },
        { status: 400 }
      );
    }

    // Validate projectId if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    // Convert file to buffer for storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For now, we'll store the file path as a placeholder
    // In production, this should be uploaded to cloud storage (S3, UploadThing, etc.)
    // and the URL stored in filePath
    const filePath = `recordings/${session.user.id}/${Date.now()}-${file.name}`;
    
    // TODO: Implement actual file storage (S3, UploadThing, etc.)
    // For now, we'll create the database record with the file info
    // The actual file storage can be implemented later

    // Create recording record in database
    const recording = await prisma.recording.create({
      data: {
        title,
        filename: file.name,
        filePath, // This should be the actual storage URL in production
        fileSize: file.size,
        mimeType: file.type,
        status: "PENDING", // Will be updated when AI processing starts
        uploadedById: session.user.id,
        projectId: projectId || null,
      },
    });

    // TODO: Trigger AI processing job here
    // This would typically be done via a background job queue
    // For now, we'll leave it as PENDING status

    console.log(`Recording created: ${recording.id} for user ${session.user.id}`);
    
    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      message: "Recording uploaded successfully. Processing will begin shortly.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 }
    );
  }
}
