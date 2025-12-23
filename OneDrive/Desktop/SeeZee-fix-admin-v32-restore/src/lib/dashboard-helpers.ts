/**
 * Dashboard Helper Functions
 * Server-side utilities for fetching unified dashboard data
 */

import { prisma } from '@/lib/prisma';
import { getClientAccessContext } from '@/lib/client-access';
import { getMockAISuggestions, type MockAISuggestion } from './mock-ai-suggestions';
import type { Project, Invoice, File, ClientTask, ProjectMilestone } from '@prisma/client';

export interface ActionItem {
  id: string;
  type: 'task' | 'approval' | 'payment' | 'questionnaire';
  title: string;
  description?: string;
  urgent: boolean;
  completed: boolean;
  completedAt?: Date;
  dueDate?: Date;
  cta: string;
  ctaLink?: string;
}

export interface Activity {
  id: string;
  type: 'FILE_UPLOAD' | 'MESSAGE' | 'MILESTONE' | 'PAYMENT' | 'STATUS_CHANGE' | 'TASK_COMPLETED' | 'PROJECT_CREATED';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  createdBy?: string;
}

export interface BillingInfo {
  totalPaid: number;
  totalDue: number;
  nextPaymentDue?: Date;
  hasActiveSubscription: boolean;
  subscriptionPlan?: string;
  invoices: {
    id: string;
    number: string;
    status: string;
    amount: number;
    dueDate: Date;
    stripeInvoiceId?: string | null;
  }[];
}

export interface DashboardData {
  project: Project & {
    organization: { id: string; name: string } | null;
    milestones: ProjectMilestone[];
  } | null;
  otherProjects: Array<{ id: string; name: string; status: string }>;
  actions: ActionItem[];
  activity: Activity[];
  files: Array<{
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    createdAt: Date;
  }>;
  aiSuggestions: MockAISuggestion[];
  billing: BillingInfo;
}

/**
 * Format time ago in human readable format
 */
export function formatActivityTime(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

/**
 * Get action items for a project
 */
export async function getClientActions(projectId: string): Promise<ActionItem[]> {
  const actions: ActionItem[] = [];
  
  // Get pending client tasks
  const tasks = await prisma.clientTask.findMany({
    where: {
      projectId,
      status: { in: ['pending', 'in_progress'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  
  for (const task of tasks) {
    actions.push({
      id: task.id,
      type: 'task',
      title: task.title,
      description: task.description,
      urgent: task.dueDate ? task.dueDate < new Date() : false,
      completed: task.status === 'completed',
      completedAt: task.completedAt || undefined,
      dueDate: task.dueDate || undefined,
      cta: 'Complete Task',
      ctaLink: `/client/tasks/${task.id}`,
    });
  }
  
  // Get unpaid invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      projectId,
      status: { in: ['SENT', 'OVERDUE'] },
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });
  
  for (const invoice of invoices) {
    actions.push({
      id: invoice.id,
      type: 'payment',
      title: `Payment due: ${invoice.title}`,
      description: `$${invoice.total} due by ${invoice.dueDate.toLocaleDateString()}`,
      urgent: invoice.status === 'OVERDUE' || invoice.dueDate < new Date(),
      completed: false,
      dueDate: invoice.dueDate,
      cta: 'Pay Now',
      ctaLink: '/client/invoices',
    });
  }
  
  return actions.sort((a, b) => {
    // Sort: urgent first, then by due date
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return 0;
  });
}

/**
 * Get recent project activity
 */
export async function getProjectActivity(
  projectId: string,
  limit: number = 20
): Promise<Activity[]> {
  const activities: Activity[] = [];
  
  // Add project creation activity
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { createdAt: true, name: true },
  });
  
  if (project) {
    activities.push({
      id: `project-created-${projectId}`,
      type: 'PROJECT_CREATED',
      title: 'Project created',
      description: `Your ${project.name} project has started!`,
      createdAt: project.createdAt,
      createdBy: 'SYSTEM',
    });
  }
  
  // Get recent files
  const files = await prisma.file.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  for (const file of files) {
    activities.push({
      id: file.id,
      type: 'FILE_UPLOAD',
      title: 'File uploaded',
      description: file.name,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.mimeType,
        url: file.url,
      },
      createdAt: file.createdAt,
    });
  }
  
  // Get completed tasks
  const completedTasks = await prisma.clientTask.findMany({
    where: {
      projectId,
      status: 'completed',
    },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });
  
  for (const task of completedTasks) {
    if (task.completedAt) {
      activities.push({
        id: `task-${task.id}`,
        type: 'TASK_COMPLETED',
        title: 'Task completed',
        description: task.title,
        createdAt: task.completedAt,
      });
    }
  }
  
  // Get paid invoices
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      projectId,
      status: 'PAID',
    },
    orderBy: { paidAt: 'desc' },
    take: 5,
  });
  
  for (const invoice of paidInvoices) {
    if (invoice.paidAt) {
      activities.push({
        id: `payment-${invoice.id}`,
        type: 'PAYMENT',
        title: 'Payment received',
        description: `$${invoice.total} for ${invoice.title}`,
        metadata: {
          amount: invoice.total.toString(),
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
        },
        createdAt: invoice.paidAt,
      });
    }
  }
  
  // Get completed milestones
  const completedMilestones = await prisma.projectMilestone.findMany({
    where: {
      projectId,
      completed: true,
    },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });
  
  for (const milestone of completedMilestones) {
    if (milestone.completedAt) {
      activities.push({
        id: `milestone-${milestone.id}`,
        type: 'MILESTONE',
        title: 'Milestone reached',
        description: milestone.title,
        createdAt: milestone.completedAt,
      });
    }
  }
  
  // Sort by date and limit
  return activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

/**
 * Get billing information
 */
export async function getBillingInfo(projectId: string): Promise<BillingInfo> {
  const invoices = await prisma.invoice.findMany({
    where: { projectId },
    orderBy: { dueDate: 'desc' },
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      dueDate: true,
      stripeInvoiceId: true,
    },
  });
  
  const totalPaid = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.total), 0);
  
  const totalDue = invoices
    .filter(inv => ['SENT', 'OVERDUE', 'DRAFT'].includes(inv.status))
    .reduce((sum, inv) => sum + Number(inv.total), 0);
  
  const nextPaymentDue = invoices
    .filter(inv => ['SENT', 'OVERDUE'].includes(inv.status))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]?.dueDate;
  
  // Check for active subscription
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      stripeSubscriptionId: true,
      maintenancePlan: true,
      maintenanceStatus: true,
    },
  });
  
  return {
    totalPaid,
    totalDue,
    nextPaymentDue,
    hasActiveSubscription: !!project?.stripeSubscriptionId && project.maintenanceStatus === 'ACTIVE',
    subscriptionPlan: project?.maintenancePlan || undefined,
    invoices: invoices.map(inv => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount: Number(inv.total),
      dueDate: inv.dueDate,
      stripeInvoiceId: inv.stripeInvoiceId,
    })),
  };
}

/**
 * Get complete dashboard data for a user
 */
export async function getDashboardData(
  userId: string,
  userEmail: string
): Promise<DashboardData> {
  // Get user's accessible projects
  const access = await getClientAccessContext({ userId, email: userEmail });
  
  // Get most recent active project
  // Use explicit select to avoid issues with columns that may not exist in production
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { organizationId: { in: access.organizationIds } },
        { id: { in: access.leadProjectIds } },
      ],
      status: {
        notIn: ['COMPLETED', 'CANCELLED'],
      },
    },
    orderBy: { updatedAt: 'desc' },
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
        select: { id: true, name: true },
      },
      milestones: {
        orderBy: { dueDate: 'asc' },
      },
    },
  });
  
  if (!project) {
    // No active project
    return {
      project: null,
      otherProjects: [],
      actions: [],
      activity: [],
      files: [],
      aiSuggestions: [],
      billing: {
        totalPaid: 0,
        totalDue: 0,
        hasActiveSubscription: false,
        invoices: [],
      },
    };
  }
  
  // Get other projects for switcher
  const otherProjects = await prisma.project.findMany({
    where: {
      OR: [
        { organizationId: { in: access.organizationIds } },
        { id: { in: access.leadProjectIds } },
      ],
      id: { not: project.id },
      status: {
        notIn: ['COMPLETED', 'CANCELLED'],
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });
  
  // Get recent files
  const files = await prisma.file.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      id: true,
      name: true,
      url: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  });
  
  // Fetch all data in parallel
  const [actions, activity, billing] = await Promise.all([
    getClientActions(project.id),
    getProjectActivity(project.id, 20),
    getBillingInfo(project.id),
  ]);
  
  // Get mock AI suggestions
  const aiSuggestions = getMockAISuggestions(project.id, 5);
  
  return {
    project: project as any,
    otherProjects,
    actions,
    activity,
    files,
    aiSuggestions,
    billing,
  };
}

/**
 * Get comprehensive dashboard data for all user projects
 */
export interface ComprehensiveDashboardData {
  projects: Array<{
    id: string;
    name: string;
    status: string;
    description: string | null;
    createdAt: Date;
    milestones: Array<{ completed: boolean }>;
    assignee: { name: string | null; image: string | null } | null;
  }>;
  stats: {
    activeProjects: number;
    totalProjects: number;
    pendingInvoices: number;
    activeRequests: number;
    pendingTasks: number;
  };
  recentActivity: Activity[];
  actionItems: ActionItem[];
  recentMessages: Array<{
    id: string;
    senderName?: string;
    message: string;
    createdAt: Date;
  }>;
  recentRequests: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
  }>;
}

export async function getComprehensiveDashboardData(
  userId: string,
  userEmail: string
): Promise<ComprehensiveDashboardData> {
  try {
    const access = await getClientAccessContext({ userId, email: userEmail });
    
    // Safety check
    if (!access || (!access.organizationIds.length && !access.leadProjectIds.length)) {
      return {
        projects: [],
        stats: {
          activeProjects: 0,
          totalProjects: 0,
          pendingInvoices: 0,
          activeRequests: 0,
          pendingTasks: 0,
        },
        recentActivity: [],
        actionItems: [],
        recentMessages: [],
        recentRequests: [],
      };
    }
    
    // Get all accessible projects (with limit)
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { organizationId: { in: access.organizationIds } },
          { id: { in: access.leadProjectIds } },
        ],
      },
      include: {
        assignee: {
          select: {
            name: true,
            image: true,
          },
        },
        milestones: {
          select: {
            completed: true,
          },
          take: 100, // Limit milestones per project
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50, // Limit total projects
    });
  
  // Get active projects
  const activeProjects = projects.filter(p => {
    const status = String(p.status || '').toUpperCase();
    return ['ACTIVE', 'IN_PROGRESS', 'DESIGN', 'BUILD', 'REVIEW', 'PLANNING', 'LAUNCH'].includes(status);
  });
  
  // Get invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      projectId: { in: projects.map(p => p.id) },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  const pendingInvoices = invoices.filter(inv => {
    const status = String(inv.status || '').toUpperCase();
    return ['SENT', 'DRAFT', 'OVERDUE'].includes(status);
  });
  
  // Get project requests
  const projectRequests = await prisma.projectRequest.findMany({
    where: {
      contactEmail: userEmail,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  
  const activeProjectRequests = projectRequests.filter(req => {
    const status = String(req.status || '').toUpperCase();
    return ['SUBMITTED', 'REVIEWING', 'DRAFT', 'NEEDS_INFO'].includes(status);
  });

  // Get change requests
  const changeRequests = await prisma.changeRequest.findMany({
    where: {
      project: {
        OR: [
          { organizationId: { in: access.organizationIds } },
          { id: { in: access.leadProjectIds } },
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Combine both types of requests for recentRequests
  const allRecentRequests = [
    ...projectRequests.map(req => ({
      id: req.id,
      title: req.title || 'Untitled Request',
      status: req.status,
      createdAt: req.createdAt,
      type: 'project' as const,
    })),
    ...changeRequests.map(req => {
      // Extract title from change request description
      // Try splitting by double newline first, then single newline, then just take first 100 chars
      const desc = req.description || '';
      const titlePart = desc.split('\n\n')[0] || desc.split('\n')[0] || desc.substring(0, 100);
      const title = titlePart.trim() || 'Change Request';
      return {
        id: req.id,
        title: title.length > 100 ? title.substring(0, 100) + '...' : title,
        status: req.status,
        createdAt: req.createdAt,
        type: 'change' as const,
      };
    }),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

  const activeRequests = activeProjectRequests.length + changeRequests.filter(req => {
    const status = String(req.status || '').toLowerCase();
    return ['pending', 'approved', 'in_progress'].includes(status);
  }).length;
  
  // Get client tasks across all projects
  const tasks = await prisma.clientTask.findMany({
    where: {
      projectId: { in: projects.map(p => p.id) },
      status: { in: ['pending', 'in_progress'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  
  // Get action items from all projects
  const allActions: ActionItem[] = [];
  for (const project of activeProjects) {
    const projectActions = await getClientActions(project.id);
    allActions.push(...projectActions);
  }
  
  // Get activity from all projects
  const allActivity: Activity[] = [];
  for (const project of activeProjects.slice(0, 5)) { // Limit to 5 most recent projects
    const projectActivity = await getProjectActivity(project.id, 10);
    allActivity.push(...projectActivity);
  }
  // Sort by date and take most recent
  allActivity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const recentActivity = allActivity.slice(0, 20);
  
  // Get recent messages (from feed events)
  const feedEvents = await prisma.feedEvent.findMany({
    where: {
      projectId: { in: projects.map(p => p.id) },
      type: 'MESSAGE',
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  
  const recentMessages = feedEvents.map(event => {
    const payload = event.payload as any || {};
    return {
      id: event.id,
      senderName: payload.user?.name || 'System',
      message: payload.message || payload.description || event.type,
      createdAt: event.createdAt,
    };
  });
  
  return {
    projects: projects.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      description: p.description,
      createdAt: p.createdAt,
      milestones: p.milestones,
      assignee: p.assignee,
    })),
    stats: {
      activeProjects: activeProjects.length,
      totalProjects: projects.length,
      pendingInvoices: pendingInvoices.length,
      activeRequests: activeRequests,
      pendingTasks: tasks.length,
    },
    recentActivity,
    actionItems: allActions.sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return 0;
    }).slice(0, 10),
    recentMessages,
    recentRequests: allRecentRequests.map(req => ({
      id: req.id,
      title: req.title,
      status: req.status,
      createdAt: req.createdAt,
    })),
  };
  } catch (error) {
    console.error('Error fetching comprehensive dashboard data:', error);
    return {
      projects: [],
      stats: {
        activeProjects: 0,
        totalProjects: 0,
        pendingInvoices: 0,
        activeRequests: 0,
        pendingTasks: 0,
      },
      recentActivity: [],
      actionItems: [],
      recentMessages: [],
      recentRequests: [],
    };
  }
}

