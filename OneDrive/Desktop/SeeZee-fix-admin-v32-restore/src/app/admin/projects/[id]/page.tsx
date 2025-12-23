import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { AdminProjectDetailClient } from "./components/AdminProjectDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has admin role
  const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
  if (!adminRoles.includes(user.role || "")) {
    redirect("/client");
  }

  // Fetch project with all related data
  // Use explicit select to avoid issues with columns that may not exist in production
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      budget: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      githubRepo: true,
      vercelUrl: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          members: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      milestones: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          createdAt: true,
        },
      },
      clientTasks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          type: true,
          dueDate: true,
          completedAt: true,
          requiresUpload: true,
          submissionNotes: true,
          assignedToClient: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      todos: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          completedAt: true,
          createdAt: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
          category: true,
          priority: true,
          estimatedHours: true,
          actualHours: true,
          hoursDeducted: true,
          hoursSource: true,
          urgencyFee: true,
          isOverage: true,
          overageAmount: true,
          requiresClientApproval: true,
          clientApprovedAt: true,
          flaggedForReview: true,
          attachments: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
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
      invoices: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          amount: true,
          tax: true,
          dueDate: true,
          paidAt: true,
          createdAt: true,
        },
      },
      questionnaire: true,
    },
  });

  if (!project) {
    notFound();
  }

  // Transform data for component
  const transformedMilestones = project.milestones.map((m) => ({
    id: m.id,
    name: m.title,
    description: m.description,
    completed: m.completed,
    dueDate: m.dueDate,
    createdAt: m.createdAt,
  }));

  const transformedClientTasks = project.clientTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    type: t.type,
    dueDate: t.dueDate,
    completedAt: t.completedAt,
    requiresUpload: t.requiresUpload,
    submissionNotes: t.submissionNotes,
    assignedToClient: t.assignedToClient,
    createdAt: t.createdAt,
    createdBy: t.createdBy,
  }));

  const transformedAdminTasks = project.todos.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    completedAt: t.completedAt,
    createdAt: t.createdAt,
    assignedTo: t.assignedTo,
    createdBy: t.createdBy,
  }));

  const transformedInvoices = project.invoices.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    total: invoice.total ? Number(invoice.total) : 0,
    amount: invoice.amount ? Number(invoice.amount) : 0,
    tax: invoice.tax ? Number(invoice.tax) : 0,
    dueDate: invoice.dueDate?.toISOString() || null,
    paidAt: invoice.paidAt?.toISOString() || null,
    createdAt: invoice.createdAt?.toISOString() || null,
  }));

  const transformedMessageThreads = project.messageThreads.map((thread) => ({
    id: thread.id,
    subject: thread.subject,
    messages: thread.messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      role: msg.role,
      createdAt: msg.createdAt,
    })),
  }));

  const transformedRequests = project.changeRequests.map((request) => ({
    id: request.id,
    title: request.description?.split('\n')[0]?.substring(0, 50) || "Change Request",
    description: request.description,
    status: request.status,
    category: request.category,
    priority: request.priority,
    estimatedHours: request.estimatedHours,
    actualHours: request.actualHours,
    hoursDeducted: request.hoursDeducted,
    hoursSource: request.hoursSource,
    urgencyFee: request.urgencyFee,
    isOverage: request.isOverage,
    overageAmount: request.overageAmount,
    requiresClientApproval: request.requiresClientApproval,
    clientApprovedAt: request.clientApprovedAt,
    flaggedForReview: request.flaggedForReview,
    attachments: request.attachments,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    completedAt: request.completedAt,
  }));

  return (
    <AdminProjectDetailClient
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget ? Number(project.budget) : null,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
        githubRepo: project.githubRepo,
        vercelUrl: project.vercelUrl,
        assignee: project.assignee,
        organization: project.organization,
        milestones: transformedMilestones,
        clientTasks: transformedClientTasks,
        adminTasks: transformedAdminTasks,
        files: project.files,
        requests: transformedRequests,
        messageThreads: transformedMessageThreads,
        invoices: transformedInvoices,
        questionnaire: project.questionnaire,
      }}
    />
  );
}









