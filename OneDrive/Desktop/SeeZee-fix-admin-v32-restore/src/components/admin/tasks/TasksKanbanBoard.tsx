"use client";

/**
 * Tasks Kanban Board Component
 * Separate from project kanban - shows all tasks in a kanban view
 */

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
import { KanbanColumn } from "../kanban/KanbanColumn";
import { TaskCard } from "../kanban/TaskCard";

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
  assignedToRole: string | null;
  assignedToTeamId: string | null;
  changeRequestId: string | null;
  dependencies?: string[];
  attachments?: string[];
  createdAt: string;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface TasksKanbanBoardProps {
  initialTasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const COLUMNS = [
  { id: "todo", title: "To Do", color: "border-gray-600" },
  { id: "in-progress", title: "In Progress", color: "border-blue-500" },
  { id: "review", title: "Review", color: "border-yellow-500" },
  { id: "done", title: "Done", color: "border-green-500" },
];

export function TasksKanbanBoard({ initialTasks, onTaskUpdate }: TasksKanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

    // Find the columns
    const activeColumn = tasks.find((t) => t.id === activeId)?.column || "todo";
    const overColumn = COLUMNS.find((col) => col.id === overId)?.id || 
                      tasks.find((t) => t.id === overId)?.column || activeColumn;

    if (activeColumn === overColumn) return;

    setTasks((prev) => {
      const activeTask = prev.find((t) => t.id === activeId);
      if (!activeTask) return prev;

      const newColumn = overColumn;
      const tasksInNewColumn = prev.filter((t) => t.column === newColumn && t.id !== activeId);
      const newPosition = tasksInNewColumn.length;

      return prev.map((t) => {
        if (t.id === activeId) {
          return { ...t, column: newColumn, position: newPosition };
        }
        return t;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) {
      setActiveTask(null);
      return;
    }

    const overId = over.id as string;
    const overColumn = COLUMNS.find((col) => col.id === overId)?.id || 
                      tasks.find((t) => t.id === overId)?.column || activeTask.column;

    // Update task status based on column
    const statusMap: Record<string, string> = {
      todo: "TODO",
      "in-progress": "IN_PROGRESS",
      review: "SUBMITTED",
      done: "DONE",
    };

    const newStatus = statusMap[overColumn] || activeTask.status;

    // Update task via API
    try {
      const response = await fetch(`/api/admin/tasks/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column: overColumn,
          status: newStatus,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, ...updatedTask.task } : t))
        );
        onTaskUpdate?.(activeId, { column: overColumn, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }

    setActiveTask(null);
  };

  return (
    <div className="space-y-6">
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
              tasks={getTasksByColumn(column.id).map(task => ({
                ...task,
                dependencies: task.dependencies || [],
                attachments: task.attachments || [],
              }))}
              onAddClick={() => {}}
              onTaskClick={(task) => {
                // Navigate to task detail or open modal
                window.location.href = `/admin/tasks/${task.id}`;
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={{
            ...activeTask,
            dependencies: activeTask.dependencies || [],
            attachments: activeTask.attachments || [],
          }} isDragging />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

