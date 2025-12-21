/**
 * Project Kanban Board
 * Drag-and-drop task management for projects
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { KanbanBoardClient } from "@/components/admin/kanban/KanbanBoardClient";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectBoardPage({ params }: PageProps) {
  const { id: projectId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  if (!isStaffRole(user.role)) {
    redirect("/dashboard");
  }

  // Fetch project with tasks
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: { select: { id: true, name: true } },
      todos: {
        include: {
          assignedTo: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: [
          { column: "asc" },
          { position: "asc" },
        ],
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Get team members for assignment
  const teamMembers = await db.user.findMany({
    where: {
      role: { in: ["ADMIN", "STAFF", "CEO", "CFO", "DESIGNER", "DEV", "FRONTEND", "BACKEND"] },
    },
    select: { id: true, name: true, image: true, role: true },
  });

  // Serialize tasks
  const tasks = project.todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    status: todo.status,
    priority: todo.priority,
    column: todo.column || "todo",
    position: todo.position || 0,
    dueDate: todo.dueDate?.toISOString() || null,
    estimatedHours: todo.estimatedHours,
    actualHours: todo.actualHours,
    assignedTo: todo.assignedTo,
    dependencies: todo.dependencies || [],
    attachments: todo.attachments || [],
    createdAt: todo.createdAt.toISOString(),
  }));

  return (
    <KanbanBoardClient
      project={{
        id: project.id,
        name: project.name,
        organization: project.organization,
      }}
      initialTasks={tasks}
      teamMembers={teamMembers}
    />
  );
}

