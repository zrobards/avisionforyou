"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Calendar, AlertCircle, Upload, FileText } from "lucide-react";
import { TaskCompletionForm } from "./TaskCompletionForm";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
  requiresUpload: boolean;
  submissionNotes: string | null;
  createdAt: Date;
}

interface ClientTaskListProps {
  tasks: Task[];
  onTaskUpdate?: () => void;
}

export function ClientTaskList({ tasks, onTaskUpdate }: ClientTaskListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const filteredTasks = filter === 'all' 
    ? tasks 
    : filter === 'pending' 
    ? pendingTasks 
    : completedTasks;

  const handleTaskComplete = () => {
    setSelectedTask(null);
    if (onTaskUpdate) {
      onTaskUpdate();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Tasks</h3>
          <span className="text-sm text-white/60">
            {completedTasks.length} of {tasks.length} completed
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-white/60 hover:bg-gray-700'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-white/60 hover:bg-gray-700'
            }`}
          >
            Pending ({pendingTasks.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-white/60 hover:bg-gray-700'
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No tasks yet</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No {filter} tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();
            const isCompleted = task.status === 'completed';
            
            return (
              <div
                key={task.id}
                className={`p-4 bg-gray-900 hover:bg-gray-800 rounded-xl border transition-all ${
                  isOverdue
                    ? 'border-red-500/50 bg-red-500/5'
                    : isCompleted
                    ? 'border-gray-800 opacity-75'
                    : 'border-gray-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isCompleted
                      ? "bg-emerald-500/20 border-emerald-500/50"
                      : isOverdue
                      ? "bg-red-500/20 border-red-500/50"
                      : "bg-white/5 border-white/20"
                  }`}>
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {isOverdue && !isCompleted && (
                      <span className="text-red-400 text-xs">!</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{task.title}</h4>
                      {task.requiresUpload && !isCompleted && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          Upload Required
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                          Completed
                        </span>
                      )}
                      {isOverdue && !isCompleted && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                          Overdue
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        task.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : task.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-white/60 mb-2">{task.description}</p>
                    )}
                    {task.submissionNotes && (
                      <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-200">
                        <strong>Your notes:</strong> {task.submissionNotes}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      {task.dueDate && (
                        <div className={`flex items-center gap-1.5 ${
                          isOverdue ? 'text-red-400' : ''
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {!task.completedAt && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete Task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTask && (
        <TaskCompletionForm
          task={selectedTask}
          onComplete={handleTaskComplete}
          onCancel={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}









