"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiFile,
  FiMessageSquare,
  FiFlag,
  FiDollarSign,
  FiCheckCircle,
  FiFolderPlus,
  FiFilter,
  FiChevronDown,
  FiRefreshCw,
} from "react-icons/fi";
import { fetchJson } from "@/lib/client-api";
import type { Activity } from "@/lib/dashboard-helpers";

interface ProjectInfo {
  id: string;
  name: string;
}

interface ActivityWithProject extends Activity {
  projectName?: string;
  projectId?: string;
}

const activityTypeConfig: Record<
  Activity["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
> = {
  FILE_UPLOAD: { icon: FiFile, color: "text-blue-400", bgColor: "bg-blue-500/10" },
  MESSAGE: { icon: FiMessageSquare, color: "text-purple-400", bgColor: "bg-purple-500/10" },
  MILESTONE: { icon: FiFlag, color: "text-green-400", bgColor: "bg-green-500/10" },
  PAYMENT: { icon: FiDollarSign, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
  STATUS_CHANGE: { icon: FiRefreshCw, color: "text-orange-400", bgColor: "bg-orange-500/10" },
  TASK_COMPLETED: { icon: FiCheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  PROJECT_CREATED: { icon: FiFolderPlus, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityWithProject[]>([]);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Activity["type"] | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const data = await fetchJson<{
        project: { id: string; name: string } | null;
        otherProjects: Array<{ id: string; name: string; status: string }>;
        activity: Activity[];
      }>("/api/client/dashboard");

      // Combine current project with other projects for filter
      const allProjects: ProjectInfo[] = [];
      if (data.project) {
        allProjects.push({ id: data.project.id, name: data.project.name });
      }
      if (data.otherProjects) {
        allProjects.push(...data.otherProjects);
      }
      setProjects(allProjects);
      
      // Map activities with project info
      const activitiesWithProjects: ActivityWithProject[] = (data.activity || []).map(
        (activity) => ({
          ...activity,
          createdAt: new Date(activity.createdAt),
          projectName: data.project?.name,
          projectId: data.project?.id,
        })
      );

      setActivities(activitiesWithProjects);
    } catch (err) {
      console.error("Failed to fetch activity data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities
    .filter((activity) => {
      if (filter !== "all" && activity.type !== filter) return false;
      if (projectFilter !== "all" && activity.projectId !== projectFilter) return false;
      return true;
    })
    .slice(0, displayCount);

  // Group activities by date
  const groupedActivities = filteredActivities.reduce<Record<string, ActivityWithProject[]>>(
    (acc, activity) => {
      const dateKey = formatDate(activity.createdAt);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(activity);
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <FiActivity className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
            <p className="text-gray-400">Track all updates across your projects</p>
          </div>
        </div>

        <button
          onClick={() => fetchActivityData()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors border border-gray-700/50"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors w-full sm:w-auto"
        >
          <FiFilter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          <FiChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </button>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Activity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Activity Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  All
                </button>
                {Object.entries(activityTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setFilter(type as Activity["type"])}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filter === type
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {type.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Filter */}
            {projects.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Project
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-4xl">
            <FiActivity className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="mb-2 font-heading text-xl font-bold text-white">
            No activity yet
          </h3>
          <p className="text-gray-400 mb-4">
            {filter !== "all" || projectFilter !== "all"
              ? "No activities match your current filters."
              : "As your projects progress, you'll see updates here."}
          </p>
          {(filter !== "all" || projectFilter !== "all") && (
            <button
              onClick={() => {
                setFilter("all");
                setProjectFilter("all");
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dayActivities], groupIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-800"></div>
                <span className="text-sm font-medium text-gray-500">{date}</span>
                <div className="h-px flex-1 bg-gray-800"></div>
              </div>

              {/* Activities for this date */}
              <div className="space-y-3">
                {dayActivities.map((activity, index) => {
                  const config = activityTypeConfig[activity.type];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4 hover:border-gray-700 transition-all group"
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 p-2.5 rounded-xl ${config.bgColor} border border-gray-700/30`}
                      >
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            {activity.projectName && (
                              <p className="text-xs text-gray-500 mt-1">
                                in {activity.projectName}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>

                        {/* Metadata */}
                        {activity.metadata && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {activity.type === "FILE_UPLOAD" && activity.metadata.fileName && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300">
                                <FiFile className="w-3 h-3" />
                                {activity.metadata.fileName}
                              </span>
                            )}
                            {activity.type === "PAYMENT" && activity.metadata.amount && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">
                                <FiDollarSign className="w-3 h-3" />
                                {activity.metadata.amount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Load More */}
          {filteredActivities.length >= displayCount && (
            <div className="text-center">
              <button
                onClick={() => setDisplayCount((prev) => prev + 20)}
                className="px-6 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors border border-gray-700/50"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Total Activities",
            value: activities.length,
            icon: FiActivity,
            color: "text-blue-400",
          },
          {
            label: "Files Uploaded",
            value: activities.filter((a) => a.type === "FILE_UPLOAD").length,
            icon: FiFile,
            color: "text-purple-400",
          },
          {
            label: "Tasks Completed",
            value: activities.filter((a) => a.type === "TASK_COMPLETED").length,
            icon: FiCheckCircle,
            color: "text-green-400",
          },
          {
            label: "Payments",
            value: activities.filter((a) => a.type === "PAYMENT").length,
            icon: FiDollarSign,
            color: "text-yellow-400",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center"
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
