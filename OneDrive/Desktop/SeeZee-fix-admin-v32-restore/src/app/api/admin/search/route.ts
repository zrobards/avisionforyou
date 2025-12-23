import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "project" | "invoice" | "lead" | "client" | "task";
  href: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin access
    const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH];
    if (!allowedRoles.includes(user.role as any)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results: SearchResult[] = [];

    // Search projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
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
        href: `/admin/projects/${project.id}`,
      });
    }

    // Search leads
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { company: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        company: true,
        name: true,
        status: true,
      },
    });

    for (const lead of leads) {
      results.push({
        id: `lead-${lead.id}`,
        title: lead.company || lead.name || "Unknown Lead",
        subtitle: `Lead - ${lead.status || "NEW"}`,
        type: "lead",
        href: `/admin/pipeline`,
      });
    }

    // Search clients (organizations)
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    for (const org of organizations) {
      results.push({
        id: `client-${org.id}`,
        title: org.name,
        subtitle: org.email || "Client",
        type: "client",
        href: `/admin/clients/${org.id}`,
      });
    }

    // Search invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        number: true,
        status: true,
        total: true,
        organization: {
          select: { name: true },
        },
      },
    });

    for (const invoice of invoices) {
      const total = typeof invoice.total === 'number' ? invoice.total : 0;
      results.push({
        id: `invoice-${invoice.id}`,
        title: `Invoice #${invoice.number}`,
        subtitle: `${invoice.organization?.name || "Unknown"} - $${(total / 100).toFixed(2)}`,
        type: "invoice",
        href: `/admin/invoices/${invoice.id}`,
      });
    }

    // Search tasks
    const tasks = await prisma.clientTask.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        type: true,
      },
    });

    for (const task of tasks) {
      results.push({
        id: `task-${task.id}`,
        title: task.title,
        subtitle: `Task - ${task.status} (${task.type})`,
        type: "task",
        href: `/admin/tasks/${task.id}`,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Admin search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search" },
      { status: 500 }
    );
  }
}
