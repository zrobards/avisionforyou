import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getClientProjectOrThrow } from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";
import { ProjectDetailClient } from "../../components/ProjectDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let project;
  try {
    project = await getClientProjectOrThrow(
      { userId: session.user.id, email: session.user.email },
      id,
      {
        include: {
          assignee: {
            select: {
              name: true,
              email: true,
              image: true,
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
          feedEvents: {
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
              id: true,
              type: true,
              payload: true,
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
              dueDate: true,
              completedAt: true,
              createdAt: true,
            },
          },
          questionnaire: true, // Include questionnaire data
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
            where: { 
              projectId: id,
              clientId: session.user.id,
            },
            include: {
              messages: {
                orderBy: { createdAt: "asc" },
                take: 100,
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
              dueDate: true,
              paidAt: true,
              createdAt: true,
            },
          },
        },
      }
    );
  } catch (error) {
    if (error instanceof ClientAccessError) {
      notFound();
    }

    throw error;
  }

  // Transform milestones to match component interface
  const transformedMilestones = (project as any).milestones?.map((m: any) => ({
    id: m.id,
    name: m.title,
    description: m.description,
    completed: m.completed,
    dueDate: m.dueDate,
    createdAt: m.createdAt,
  })) || [];

  // Transform feed events to match component interface
  const transformedFeedEvents = (project as any).feedEvents?.map((event: any) => {
    const payload = event.payload as any || {};
    return {
      id: event.id,
      type: event.type,
      title: payload.title || payload.name || `Event: ${event.type}`,
      description: payload.description || payload.message || null,
      createdAt: event.createdAt,
      user: payload.user ? {
        name: payload.user.name || null,
      } : null,
    };
  }) || [];

  // Transform client tasks
  const transformedTasks = (project as any).clientTasks?.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    requiresUpload: task.requiresUpload || false,
    submissionNotes: task.submissionNotes || null,
    createdAt: task.createdAt,
  })) || [];

  // Transform change requests
  const transformedRequests = (project as any).changeRequests?.map((request: any) => ({
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
  })) || [];

  // Transform message threads
  const transformedMessageThreads = (project as any).messageThreads?.map((thread: any) => ({
    id: thread.id,
    subject: thread.subject,
    messages: thread.messages?.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      role: msg.role,
      createdAt: msg.createdAt,
    })) || [],
  })) || [];

  // Transform invoices (convert Decimal to number and Date to ISO string)
  const transformedInvoices = (project as any).invoices?.map((invoice: any) => ({
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    total: invoice.total ? Number(invoice.total) : 0,
    amount: invoice.amount ? Number(invoice.amount) : 0,
    tax: invoice.tax ? Number(invoice.tax) : 0,
    dueDate: invoice.dueDate?.toISOString() || null,
    paidAt: invoice.paidAt?.toISOString() || null,
    createdAt: invoice.createdAt?.toISOString() || null,
  })) || [];

  return (
    <ProjectDetailClient
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget ? Number(project.budget) : null,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
        assignee: (project as any).assignee,
        milestones: transformedMilestones,
        feedEvents: transformedFeedEvents,
        tasks: transformedTasks,
        files: (project as any).files || [],
        requests: transformedRequests,
        messageThreads: transformedMessageThreads,
        invoices: transformedInvoices,
        questionnaire: (project as any).questionnaire || null,
        githubRepo: project.githubRepo || null,
        vercelUrl: project.vercelUrl || null,
      }}
    />
  );
}
