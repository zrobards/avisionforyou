import { ClientTasksClient } from "@/components/admin/ClientTasksClient";
import { prisma } from "@/lib/prisma";

interface TaskRow {
  id: string;
  title: string;
  project: string;
  client: string;
  status: string;
  priority: string;
  dueDate: string | null;
  type: string;
  requiresUpload: boolean;
  createdAt: string;
  completedAt: string | null;
}

export const dynamic = "force-dynamic";

export default async function ClientTasksPage() {
  // Auth check is handled in layout.tsx to prevent flash

  // Fetch ALL client tasks across all projects
  const clientTasks = await prisma.clientTask.findMany({
    include: {
      project: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
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
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });

  const rows: TaskRow[] = clientTasks.map((task) => ({
    id: task.id,
    title: task.title,
    project: task.project?.name ?? "Unassigned",
    client: task.project?.organization?.name ?? "—",
    status: task.status,
    priority: "medium", // ClientTask doesn't have priority, using default
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    type: task.type,
    requiresUpload: task.requiresUpload,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  }));

  const overdue = rows.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed",
  ).length;

  const openTasks = rows.filter((task) => task.status !== "completed").length;

  return (
    <div className="space-y-8">
      <header className="space-y-3 relative">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block">
          Client Delivery
        </span>
        <h1 className="text-4xl font-heading font-bold gradient-text">Client Tasks</h1>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Monitor all client tasks and assignments across every project. Create new assignments with file attachments, track progress, and ensure everyone completes their deliverables.
        </p>
      </header>

      <ClientTasksClient rows={rows} overdue={overdue} openTasks={openTasks} />
    </div>
  );
}


