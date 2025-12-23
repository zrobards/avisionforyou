"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import { formatRelativeTime } from "@/lib/ui";
import { ActivityType } from "@prisma/client";
import { FileText } from "lucide-react";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface LogsClientProps {
  activities: Activity[];
}

const typeColors: Record<string, string> = {
  LEAD_CREATED: "text-green-400 bg-green-500/20",
  LEAD_UPDATED: "text-blue-400 bg-blue-500/20",
  PROJECT_CREATED: "text-purple-400 bg-purple-500/20",
  PROJECT_UPDATED: "text-blue-400 bg-blue-500/20",
  INVOICE_CREATED: "text-yellow-400 bg-yellow-500/20",
  TASK_CREATED: "text-cyan-400 bg-cyan-500/20",
  TASK_COMPLETED: "text-green-400 bg-green-500/20",
  USER_LOGGED_IN: "text-slate-400 bg-slate-500/20",
};

export function LogsClient({ activities }: LogsClientProps) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  // Get unique activity types
  const activityTypes = Array.from(
    new Set(activities.map((a) => a.type))
  ).slice(0, 5);

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((a) => a.type === filter);

  return (
    <div className="space-y-6">
      {/* Premium Header with Animated Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        {/* Animated glow orbs */}
        <motion.div 
          className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="relative z-10 p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500"
            >
              <FileText className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
              System Logs
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-[60px]">
            Real-time activity and system events
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 border-b border-white/5 overflow-x-auto"
      >
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            filter === "all"
              ? "border-emerald-500 text-white"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          All
        </button>
        {activityTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              filter === type
                ? "border-emerald-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {type.replace(/_/g, " ")}
          </button>
        ))}
      </motion.div>

      {/* Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SectionCard>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No activity logs found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-3 rounded-lg bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:border-emerald-500/20 transition-all"
                >
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      typeColors[activity.type] ||
                      "text-slate-400 bg-slate-500/20"
                    }`}
                  >
                    {activity.type.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-slate-400 mt-1">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {activity.user && (
                        <>
                          <span className="text-xs text-slate-500">
                            {activity.user.name || activity.user.email}
                          </span>
                          <span className="text-xs text-slate-700">•</span>
                        </>
                      )}
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>
      </motion.div>
    </div>
  );
}
