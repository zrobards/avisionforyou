"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ActionPanel from "@/components/client/dashboard/ActionPanel";
import ActivityFeed from "@/components/client/dashboard/ActivityFeed";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ComprehensiveDashboardData } from "@/lib/dashboard-helpers";
import { 
  FiArrowRight, 
  FiFolder, 
  FiFileText, 
  FiMessageSquare, 
  FiCheckCircle,
  FiPlus,
} from "react-icons/fi";

interface ComprehensiveDashboardClientProps {
  data: ComprehensiveDashboardData;
  userName?: string;
}

export default function ComprehensiveDashboardClient({ 
  data, 
  userName 
}: ComprehensiveDashboardClientProps) {
  // Show all projects that aren't completed or cancelled
  const activeProjects = data.projects.filter((p) => {
    const status = String(p.status || '').toUpperCase();
    return !['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(status);
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-xl border border-gray-800 p-8"
      >
        <h1 className="text-3xl font-heading font-bold text-white mb-2">
          Welcome back, {userName || 'User'}!
        </h1>
        <p className="text-gray-400">
          Here's an overview of your projects and account activity.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <FiFolder className="w-8 h-8 text-trinity-red" />
            <StatusBadge status="active" size="sm" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{data.stats.activeProjects}</h3>
          <p className="text-sm text-gray-400">Active Projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <FiFileText className="w-8 h-8 text-yellow-500" />
            <StatusBadge status="unpaid" size="sm" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{data.stats.pendingInvoices}</h3>
          <p className="text-sm text-gray-400">Pending Invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <FiMessageSquare className="w-8 h-8 text-blue-500" />
            <StatusBadge status="in_progress" size="sm" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{data.stats.activeRequests}</h3>
          <p className="text-sm text-gray-400">Active Requests</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{data.stats.totalProjects}</h3>
          <p className="text-sm text-gray-400">Total Projects</p>
        </motion.div>
      </div>

      {/* Action Items */}
      {data.actionItems.length > 0 && (
        <ActionPanel actions={data.actionItems} />
      )}

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">Your Projects</h2>
          <Link
            href="/client/projects"
            className="flex items-center gap-2 text-trinity-red hover:text-trinity-maroon transition-colors font-medium"
          >
            View All
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.slice(0, 6).map((project) => {
              const completedMilestones = project.milestones.filter(m => m.completed).length;
              const totalMilestones = project.milestones.length;
              const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-heading font-bold text-white mb-2">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {totalMilestones > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-trinity-red to-trinity-maroon transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Link
                    href={`/client/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-trinity-red hover:text-trinity-maroon transition-colors font-medium"
                  >
                    View Details
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-4">No projects yet</p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-4 py-2 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Start a New Project
            </Link>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      {data.recentActivity.length > 0 && (
        <div>
          <ActivityFeed activities={data.recentActivity} projectId={activeProjects[0]?.id || ""} />
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Requests</h3>
          </div>
          {data.recentRequests.length > 0 ? (
            <div className="space-y-3">
              {data.recentRequests.slice(0, 3).map((request) => {
                // Find the project this request belongs to
                const requestProject = data.projects.find(p => (p as any).requests?.some((r: any) => r.id === request.id));
                return (
                  <Link
                    key={request.id}
                    href={requestProject ? `/client/projects/${requestProject.id}?tab=requests` : "/client"}
                    className="block p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-trinity-red transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{request.title}</h4>
                      <StatusBadge status={request.status} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No recent requests</p>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Messages</h3>
          </div>
          {data.recentMessages.length > 0 ? (
            <div className="space-y-3">
              {data.recentMessages.slice(0, 3).map((message) => {
                // Find the project this message belongs to
                const messageProject = data.projects.find(p => (p as any).messageThreads?.some((t: any) => t.id === (message as any).threadId));
                return (
                  <Link
                    key={message.id}
                    href={messageProject ? `/client/projects/${messageProject.id}?tab=messages` : "/client"}
                    className="block p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-trinity-red transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {message.senderName && (
                          <p className="font-medium text-white">{message.senderName}</p>
                        )}
                        <p className="text-sm text-gray-400">{message.message}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No recent messages</p>
          )}
        </div>
      </div>
    </div>
  );
}

