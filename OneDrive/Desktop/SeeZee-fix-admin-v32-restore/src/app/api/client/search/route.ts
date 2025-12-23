import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "project" | "invoice" | "request" | "message";
  href: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    // Find user's organizations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        organizations: {
          select: { organizationId: true }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    const organizationIds = user.organizations.map(org => org.organizationId);

    // Search projects
    const projectWhere: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    if (organizationIds.length > 0) {
      projectWhere.organizationId = { in: organizationIds };
    } else {
      projectWhere.clientId = user.id;
    }

    const projects = await prisma.project.findMany({
      where: projectWhere,
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    for (const project of projects) {
      results.push({
        id: `project-${project.id}`,
        title: project.name,
        subtitle: `Project - ${project.status}`,
        type: "project",
        href: `/client/projects/${project.id}`,
      });
    }

    // Search invoices
    const invoiceWhere: any = {
      OR: [
        { number: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    if (organizationIds.length > 0) {
      invoiceWhere.organizationId = { in: organizationIds };
    } else {
      invoiceWhere.clientId = user.id;
    }

    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
      take: 5,
      select: {
        id: true,
        number: true,
        status: true,
        total: true,
      },
    });

    for (const invoice of invoices) {
      const total = typeof invoice.total === 'number' ? invoice.total : 0;
      results.push({
        id: `invoice-${invoice.id}`,
        title: `Invoice #${invoice.number}`,
        subtitle: `$${(total / 100).toFixed(2)} - ${invoice.status}`,
        type: "invoice",
        href: `/client/invoices`,
      });
    }

    // Search change requests
    const changeRequestWhere: any = {
      description: { contains: query, mode: "insensitive" },
    };

    if (organizationIds.length > 0) {
      changeRequestWhere.project = { organizationId: { in: organizationIds } };
    } else {
      changeRequestWhere.project = { clientId: user.id };
    }

    const changeRequests = await prisma.changeRequest.findMany({
      where: changeRequestWhere,
      take: 5,
      select: {
        id: true,
        description: true,
        status: true,
        projectId: true,
      },
    });

    for (const request of changeRequests) {
      const title = request.description.length > 50 
        ? request.description.substring(0, 50) + '...' 
        : request.description;
      results.push({
        id: `request-${request.id}`,
        title: title,
        subtitle: `Request - ${request.status}`,
        type: "request",
        href: `/client/requests`,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Client search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search" },
      { status: 500 }
    );
  }
}
