"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { CreateTaskModal } from "./CreateTaskModal";
import { TaskDetailModal } from "./TaskDetailModal";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  column: string;
  position: number;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  assignedTo: { id: string; name: string | null; image: string | null } | null;
  dependencies: string[];
  attachments: string[];
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface Project {
  id: string;
  name: string;
  organization: { id: string; name: string };
}

interface KanbanBoardClientProps {
  project: Project;
  initialTasks: Task[];
  teamMembers: TeamMember[];
}

const COLUMNS = [
  { id: "todo", title: "To Do", color: "border-gray-600" },
  { id: "in-progress", title: "In Progress", color: "border-blue-500" },
  { id: "review", title: "Review", color: "border-yellow-500" },
  { id: "done", title: "Done", color: "border-green-500" },
];

export function KanbanBoardClient({
  project,
  initialTasks,
  teamMembers,
}: KanbanBoardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createColumn, setCreateColumn] = useState<string>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByColumn = (column: string) =>
    tasks.filter((t) => t.column === column).sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if over a column
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    
    if (isOverColumn) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId
            ? { ...t, column: overId, position: getTasksByColumn(overId).length }
            : t
        )
      );
    } else {
      // Over another task
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;

      if (activeTask.column !== overTask.column) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeId
              ? { ...t, column: overTask.column, position: overTask.position }
              : t
          )
        );
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // Persist to database
    try {
      await fetch(`/api/projects/${project.id}/tasks/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column: task.column,
          position: task.position,
          status: mapColumnToStatus(task.column),
        }),
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const mapColumnToStatus = (column: string): string => {
    switch (column) {
      case "todo":
        return "TODO";
      case "in-progress":
        return "IN_PROGRESS";
      case "review":
        return "SUBMITTED";
      case "done":
        return "DONE";
      default:
        return "TODO";
    }
  };

  const handleCreateClick = (column: string) => {
    setCreateColumn(column);
    setShowCreateModal(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    setShowCreateModal(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setSelectedTask(null);
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/projects/${project.id}`}
            className="p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
              {project.organization.name}
            </span>
            <h1 className="text-3xl font-heading font-bold text-white">
              {project.name} Board
            </h1>
          </div>
        </div>
        <button
          onClick={() => handleCreateClick("todo")}
          className="inline-flex items-center gap-2 rounded-lg bg-trinity-red px-4 py-2.5 text-sm font-medium text-white hover:bg-trinity-maroon transition"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </header>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={getTasksByColumn(column.id)}
              onAddClick={() => handleCreateClick(column.id)}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={project.id}
          column={createColumn}
          teamMembers={teamMembers}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={project.id}
          teamMembers={teamMembers}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}

export default KanbanBoardClient;






