"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, Paperclip, Calendar, User } from "lucide-react";
import { format, isPast } from "date-fns";

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
  assignedToRole?: string | null;
  assignedToTeamId?: string | null;
  changeRequestId?: string | null;
  dependencies: string[];
  attachments: string[];
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

const priorityStyles: Record<string, string> = {
  LOW: "bg-[#22d3ee]",
  MEDIUM: "bg-[#f59e0b]",
  HIGH: "bg-[#ef4444]",
};

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.column !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      suppressHydrationWarning
      className={`
        rounded-xl border border-white/10 bg-[#0f172a]/80 backdrop-blur-sm p-4
        cursor-grab active:cursor-grabbing
        hover:border-white/20 hover:bg-[#1e293b]/60 transition-all duration-200
        ${isDragging || isSortableDragging ? "opacity-50 rotate-2 scale-105 shadow-xl border-[#22d3ee]/40" : ""}
      `}
    >
      {/* Priority & Title */}
      <div className="flex items-start gap-3">
        <div
          className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
            priorityStyles[task.priority] || priorityStyles.MEDIUM
          }`}
        />
        <h4 className="text-sm font-semibold text-white leading-snug">
          {task.title}
        </h4>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 ml-5">
          {task.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Assignee */}
          {task.assignedTo ? (
            <div className="flex items-center gap-1">
              {task.assignedTo.image ? (
                <img
                  src={task.assignedTo.image}
                  alt={task.assignedTo.name || ""}
                  className="w-5 h-5 rounded-full ring-1 ring-white/10"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400">
                    {task.assignedTo.name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
            </div>
          ) : task.assignedToRole ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px]">
              <User className="w-3 h-3" />
              <span>{task.assignedToRole}</span>
            </div>
          ) : task.assignedToTeamId ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px]">
              <User className="w-3 h-3" />
              <span>Team</span>
            </div>
          ) : null}

          {/* Hours */}
          {task.estimatedHours && (
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-slate-400">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Due Date */}
        {dueDate && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
              isOverdue 
                ? "text-[#ef4444] bg-[#ef4444]/10" 
                : "text-slate-400"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>{format(dueDate, "MMM d")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
