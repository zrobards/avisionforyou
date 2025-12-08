import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

// File router for handling uploads
export const ourFileRouter = {
  // Training file uploader (PDFs, videos, etc.)
  trainingUploader: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 1 },
    video: { maxFileSize: "128MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user || session.user.role !== "CEO") {
        throw new Error("Unauthorized - CEO access required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  // Resource file uploader (documents, images)
  resourceUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user || session.user.role !== "CEO") {
        throw new Error("Unauthorized - CEO access required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Resource upload complete:", file.url);
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  // Admin project file uploader (for admin dashboard)
  adminProjectFileUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
    pdf: { maxFileSize: "32MB", maxFileCount: 10 },
    blob: { maxFileSize: "32MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      // Check if user has admin role
      if (!ADMIN_ROLES.includes(session.user.role || "")) {
        throw new Error("Forbidden - Admin access required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Admin file upload complete:", file.url);
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  // Client project file uploader (for client dashboard)
  projectFileUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
    pdf: { maxFileSize: "32MB", maxFileCount: 10 },
    blob: { maxFileSize: "32MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const session = await auth();
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      // Get projectId from request body (passed from client)
      const body = await req.json().catch(() => ({}));
      const projectId = body?.projectId;

      if (!projectId) {
        throw new Error("Project ID is required");
      }

      // Verify user has access to this project
      const { prisma } = await import("@/lib/prisma");
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          lead: {
            email: session.user.email!,
          },
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      return { userId: session.user.id, projectId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { prisma } = await import("@/lib/prisma");
      
      // Determine file type
      const fileType = file.type.startsWith("image/") ? "IMAGE" 
        : file.type.startsWith("video/") ? "VIDEO"
        : file.type.includes("pdf") || file.type.includes("document") || file.type.includes("text") ? "DOCUMENT"
        : "OTHER";

      // Create file record in database
      await prisma.file.create({
        data: {
          name: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          type: fileType,
          url: file.url,
          projectId: metadata.projectId,
          uploadedById: metadata.userId,
          virusScanStatus: "PENDING",
        },
      });

      console.log("Project file upload complete:", file.url);
      return { uploadedBy: metadata.userId, projectId: metadata.projectId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
