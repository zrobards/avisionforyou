import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectDetailClient } from "@/components/admin/ProjectDetailClient";
import { toPlain } from "@/lib/serialize";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

    if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    redirect("/login");
  }

  // Use explicit select to avoid issues with columns that may not exist in production
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      budget: true,
      isNonprofit: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      assigneeId: true,
      leadId: true,
      organizationId: true,
      questionnaireId: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      maintenancePlan: true,
      maintenanceStatus: true,
      nextBillingDate: true,
      githubRepo: true,
      vercelUrl: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          status: true,
        },
      },
      questionnaire: {
        select: {
          id: true,
          estimate: true,
          deposit: true,
          data: true,
        },
      },
      milestones: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      },
      feedEvents: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      clientTasks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          completedAt: true,
          createdAt: true,
        },
      },
      files: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
          type: true,
          createdAt: true,
        },
      },
      changeRequests: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          description: true,
          status: true,
          createdAt: true,
        },
      },
      messageThreads: {
        where: { projectId: id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Convert to JSON-serializable plain object (Decimal -> string, Date -> ISO)
  // This ensures all Decimal fields (like invoice.total, invoice.amount, invoice.tax)
  // are properly serialized before passing to Client Components
  const plainProject = toPlain(project);
  return <ProjectDetailClient project={plainProject} />;
}
