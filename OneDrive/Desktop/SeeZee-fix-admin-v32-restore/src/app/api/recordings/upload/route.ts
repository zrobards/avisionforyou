import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

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
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save file to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "recordings");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${safeFilename}`;
    const localPath = path.join(uploadsDir, filename);
    
    await writeFile(localPath, buffer);

    // Store the public URL path
    const publicPath = `/uploads/recordings/${filename}`;

    // Create recording record in database
    const recording = await prisma.recording.create({
      data: {
        title,
        filename: file.name,
        filePath: publicPath,
        fileSize: file.size,
        mimeType: file.type,
        status: "PENDING",
        uploadedById: session.user.id,
        projectId: projectId || null,
      },
    });

    // Auto-trigger AI processing
    try {
      const processUrl = new URL("/api/recordings/process", req.url);
      await fetch(processUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId: recording.id })
      });
    } catch (error) {
      console.error("Failed to trigger processing:", error);
    }

    console.log(`Recording created and processing triggered: ${recording.id}`);
    
    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      message: "Recording uploaded successfully. AI processing started.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 }
    );
  }
}
