"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";

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

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onAddClick: () => void;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onAddClick,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border border-white/10 border-t-4 ${color} bg-[#1e293b]/40 backdrop-blur-sm p-4 min-h-[500px] transition-all duration-200 ${
        isOver ? "ring-2 ring-[#22d3ee]/50 bg-[#1e293b]/60" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-white">{title}</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-medium text-slate-400">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-slate-400 hover:text-white"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
          <p className="text-sm text-slate-500">Drop tasks here</p>
        </div>
      )}
    </div>
  );
}

export default KanbanColumn;
