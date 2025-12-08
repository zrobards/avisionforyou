import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientRequestCreate } from "@/lib/validation/client";
import { handleCors, addCorsHeaders } from "@/lib/cors";

/**
 * OPTIONS /api/client/requests
 * Handle CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}

/**
 * GET /api/client/requests
 * Returns client-submitted project requests
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Fetch ProjectRequests for this user
    // Try by userId first, then fallback to email if no results
    let requests = await prisma.projectRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        contactEmail: true,
        email: true,
        company: true,
        budget: true,
        timeline: true,
        services: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If no requests found by userId, try by email (for older requests that might not have userId)
    if (requests.length === 0 && session.user.email) {
      requests = await prisma.projectRequest.findMany({
        where: {
          OR: [
            { contactEmail: session.user.email },
            { email: session.user.email },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          contactEmail: true,
          email: true,
          company: true,
          budget: true,
          timeline: true,
          services: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // For each request, find related project by matching email with Lead email
    const requestsWithProjects = await Promise.all(
      requests.map(async (request) => {
        const email = request.contactEmail || request.email;
        if (!email) {
          return { ...request, project: null };
        }

        // Find project via Lead email matching
        const lead = await prisma.lead.findFirst({
          where: { email: email },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
              },
            },
          },
        });

        return {
          ...request,
          project: lead?.project || null,
        };
      })
    );

    const response = NextResponse.json({ requests: requestsWithProjects });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[GET /api/client/requests]", error);
    const response = NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

/**
 * POST /api/client/requests
 * Create a new request (maps to Todo)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const body = await req.json();
    const parsed = clientRequestCreate.safeParse(body);
    if (!parsed.success) {
      const response = NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { type, title, description, projectId } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      const response = NextResponse.json({ error: "User not found" }, { status: 404 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Map type to priority
    const priorityMap: Record<string, "LOW" | "MEDIUM" | "HIGH"> = {
      SUPPORT: "MEDIUM",
      FEATURE: "HIGH",
      CHANGE: "MEDIUM",
    };

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        status: "TODO",
        priority: priorityMap[type] || "MEDIUM",
        createdById: user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    // Log activity
    await prisma.systemLog.create({
      data: {
        action: "CLIENT_REQUEST_CREATED",
        entityType: "Todo",
        entityId: todo.id,
        userId: user.id,
        metadata: { type, title },
      },
    });

    const response = NextResponse.json({
      item: {
        id: todo.id,
        type: todo.priority,
        title: todo.title,
        description: todo.description,
        status: todo.status,
        createdAt: todo.createdAt,
      },
    });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[POST /api/client/requests]", error);
    const response = NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
