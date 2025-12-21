"use client";

import { motion } from "framer-motion";
import { BookOpen, Video, FileQuestion, Link as LinkIcon, CheckCircle, Clock, XCircle } from "lucide-react";

interface Training {
  id: string;
  title: string;
  type: string;
  description: string | null;
  visibility: string;
  url: string | null;
  tags: string[];
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  stats?: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

interface AdminTrainingClientProps {
  trainings: Training[];
  showHeader?: boolean;
}

export function AdminTrainingClient({ trainings, showHeader = true }: AdminTrainingClientProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return Video;
      case "QUIZ":
        return FileQuestion;
      case "LINK":
        return LinkIcon;
      case "DOC":
      default:
        return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "DOC":
        return "bg-blue-500/20 text-blue-300";
      case "VIDEO":
        return "bg-purple-500/20 text-purple-300";
      case "QUIZ":
        return "bg-green-500/20 text-green-300";
      case "LINK":
        return "bg-orange-500/20 text-orange-300";
      default:
        return "bg-slate-500/20 text-slate-300";
    }
  };

  const getCompletionRate = (stats?: Training["stats"]) => {
    if (!stats || stats.totalAssigned === 0) return 0;
    return Math.round((stats.completed / stats.totalAssigned) * 100);
  };

  if (trainings.length === 0) {
    return (
      <div className="glass p-8 rounded-lg text-center">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 mb-2">No training modules available yet</p>
        <p className="text-sm text-slate-500">
          Training modules will appear here once they are created by the CEO
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Training Modules</h1>
            <p className="text-slate-400 text-sm">
              {trainings.length} training module{trainings.length !== 1 ? 's' : ''} available • View only
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainings.map((training, idx) => {
          const Icon = getTypeIcon(training.type);
          const completionRate = getCompletionRate(training.stats);

          return (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="
                p-5 rounded-xl
                bg-slate-900/40 backdrop-blur-xl border border-white/5
                hover:border-white/10 hover:bg-slate-900/60
                transition-all
              "
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(training.type)}`}>
                  {training.type}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {training.title}
              </h3>

              {training.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                  {training.description}
                </p>
              )}

              {training.stats && training.stats.totalAssigned > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Completion Rate</span>
                    <span className="text-purple-400 font-semibold">{completionRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      {training.stats.completed}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Clock className="w-3 h-3" />
                      {training.stats.inProgress}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <XCircle className="w-3 h-3" />
                      {training.stats.notStarted}
                    </span>
                  </div>
                </div>
              )}

              {training.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {training.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {training.tags.length > 2 && (
                    <span className="text-xs text-slate-500">
                      +{training.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {training.url && (
                <a
                  href={training.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-center text-sm font-medium transition-colors"
                >
                  View Training
                </a>
              )}

              <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-white/5">
                Created by {training.createdBy.name || training.createdBy.email}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Notice */}
      <div className="glass p-4 rounded-lg border border-slate-700">
        <p className="text-sm text-slate-400 text-center">
          This is a read-only view. To create or manage trainings, visit the{" "}
          <a href="/admin/ceo/training" className="text-purple-400 hover:underline">
            CEO Training Dashboard
          </a>
          .
        </p>
      </div>
    </div>
  );
}
