"use client";

import { motion } from "framer-motion";
import type { ProjectMilestone } from "@prisma/client";

interface MilestoneTimelineProps {
  milestones: ProjectMilestone[];
}

export default function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <h2 className="font-heading text-xl font-bold text-white">
          Project Milestones
        </h2>
      </div>
      
      {/* Timeline */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const isCompleted = milestone.completed;
          const isFirst = index === 0;
          const isLast = index === milestones.length - 1;
          const isCurrent = !isCompleted && milestones.slice(0, index).every(m => m.completed);
          
          return (
            <div key={milestone.id} className="relative flex gap-4">
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-10 h-full w-0.5 ${
                    isCompleted ? 'bg-green-500/30' : 'bg-gray-700'
                  }`}
                />
              )}
              
              {/* Node Circle */}
              <div
                className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? 'border-green-500 bg-green-500/20'
                    : isCurrent
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-700 bg-gray-900'
                }`}
              >
                {isCompleted && (
                  <span className="text-sm text-green-400">✓</span>
                )}
                {isCurrent && (
                  <span className="text-sm text-blue-400">🔄</span>
                )}
                {!isCompleted && !isCurrent && (
                  <span className="text-sm text-gray-500">⏳</span>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <h3
                  className={`font-semibold ${
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-blue-400'
                      : 'text-gray-400'
                  }`}
                >
                  {milestone.title}
                </h3>
                {milestone.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {milestone.description}
                  </p>
                )}
                {milestone.dueDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    {isCompleted && milestone.completedAt
                      ? `Completed ${new Date(milestone.completedAt).toLocaleDateString()}`
                      : `Due ${new Date(milestone.dueDate).toLocaleDateString()}`
                    }
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

