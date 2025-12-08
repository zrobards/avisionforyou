"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import { RequestStatus } from "@prisma/client";
import { mapBudgetToTier } from "@/lib/budget-mapping";

// Validation schema for project requests
const RequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contactEmail: z.string().email("Valid email required"),
  company: z.string().optional(),
  services: z.array(z.enum(["WEB_APP", "WEBSITE", "ECOMMERCE", "AI_DATA", "MOBILE", "BRANDING", "OTHER"])).min(1, "Select at least one service"),
  budget: z.enum(["UNKNOWN", "MICRO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).default("UNKNOWN"),
  timeline: z.string().optional(),
  resourcesUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function createRequest(formData: FormData) {
  try {
    // Parse form data
    const services = formData.getAll("services") as string[];
    const resourcesUrl = formData.get("resourcesUrl") as string;
    
    const input = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      contactEmail: formData.get("contactEmail") as string,
      company: (formData.get("company") as string) || undefined,
      services,
      budget: (formData.get("budget") as string) || "UNKNOWN",
      timeline: (formData.get("timeline") as string) || undefined,
      resourcesUrl: resourcesUrl || undefined,
    };

    // Validate input
    const parsed = RequestSchema.parse(input);

    // Get current user if authenticated
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Create the project request
    const request = await prisma.projectRequest.create({
      data: {
        ...parsed,
        budget: mapBudgetToTier(parsed.budget),
        userId,
        status: "SUBMITTED",
      },
    });

    // Create audit log
    if (userId) {
      await prisma.systemLog.create({
        data: {
          area: "ProjectRequest",
          refId: request.id,
          action: "CREATE",
          entityType: "ProjectRequest",
          entityId: request.id,
          userId,
          message: "Project request created",
          meta: { email: parsed.contactEmail },
        },
      });
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/requests");
    revalidatePath("/admin/requests");

    // Redirect based on auth status
    if (userId) {
      redirect("/dashboard/requests");
    } else {
      redirect(`/start/success?id=${request.id}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = encodeURIComponent(error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "));
      redirect(`/start?error=${errorMsg}`);
    }
    
    console.error("Failed to create project request:", error);
    redirect("/start?error=Failed+to+create+request");
  }
}

/**
 * Save project request as draft (for authenticated users)
 */
export async function saveDraft(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Must be logged in to save drafts" };
    }

    const services = formData.getAll("services") as string[];
    const resourcesUrl = formData.get("resourcesUrl") as string;
    
    const input = {
      title: (formData.get("title") as string) || "Untitled Project",
      description: (formData.get("description") as string) || "",
      contactEmail: session.user.email!,
      company: (formData.get("company") as string) || undefined,
      services: services.length > 0 ? services : [],
      budget: (formData.get("budget") as string) || "UNKNOWN",
      timeline: (formData.get("timeline") as string) || undefined,
      resourcesUrl: resourcesUrl || undefined,
    };

    // Minimal validation for drafts
    if (!input.title || input.title.length < 3) {
      return { error: "Title must be at least 3 characters" };
    }

    const request = await prisma.projectRequest.create({
      data: {
        ...input,
        services: input.services as any[],
        budget: mapBudgetToTier(input.budget),
        userId: session.user.id,
        status: RequestStatus.DRAFT,
      },
    });

    revalidatePath("/dashboard/requests");

    return { success: true, id: request.id };
  } catch (error) {
    console.error("Failed to save draft:", error);
    return { error: "Failed to save draft" };
  }
}
