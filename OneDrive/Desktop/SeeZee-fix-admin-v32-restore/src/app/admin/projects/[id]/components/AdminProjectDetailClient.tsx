"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Target, ListTodo, Folder, MessageSquare, Send, CreditCard, Github, Settings, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminProjectTasks } from "./AdminProjectTasks";
import { RepositoryTab } from "@/app/(client)/client/components/RepositoryTab";
import { SettingsTab } from "@/app/(client)/client/components/SettingsTab";
import { AdminChangeRequestsSection } from "./AdminChangeRequestsSection";

interface AdminProjectDetailClientProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    budget: number | null;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    githubRepo: string | null;
    vercelUrl: string | null;
    assignee: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
    organization: {
      id: string;
      name: string;
      members: Array<{
        userId: string;
        user: {
          id: string;
          name: string | null;
          email: string | null;
        };
      }>;
    };
    milestones: Array<{
      id: string;
      name: string;
      description: string | null;
      completed: boolean;
      dueDate: Date | null;
      createdAt: Date;
    }>;
    clientTasks: Array<any>;
    adminTasks: Array<any>;
    files: Array<any>;
    requests: Array<any>;
    messageThreads: Array<any>;
    invoices: Array<any>;
    questionnaire: any;
  };
}

type TabType = "overview" | "milestones" | "tasks" | "files" | "requests" | "messages" | "invoices" | "repository" | "settings";

export function AdminProjectDetailClient({ project }: AdminProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
      COMPLETED: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Completed" },
      ACTIVE: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "Active" },
      IN_PROGRESS: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "In Progress" },
      DESIGN: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", label: "Design" },
      BUILD: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30", label: "Build" },
      REVIEW: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", label: "Review" },
      ON_HOLD: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: "On Hold" },
      PLANNING: { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30", label: "Planning" },
      PAID: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", label: "Paid" },
      LEAD: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30", label: "Lead" },
      LAUNCH: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Launch" },
    };
    return config[status] || { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: status };
  };

  const badge = getStatusBadge(project.status);
  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: FileText },
    { id: "milestones" as TabType, label: "Milestones", icon: Target },
    { id: "tasks" as TabType, label: "Tasks", icon: ListTodo },
    { id: "files" as TabType, label: "Files", icon: Folder },
    { id: "requests" as TabType, label: "Requests", icon: MessageSquare },
    { id: "messages" as TabType, label: "Messages", icon: Send },
    { id: "invoices" as TabType, label: "Invoices", icon: CreditCard },
    { id: "repository" as TabType, label: "Repository", icon: Github },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Status</span>
                    <span className={`font-medium ${badge.text}`}>{badge.label}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Client</span>
                    <span className="font-medium text-white">{project.organization.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Milestones</span>
                    <span className="font-medium text-white">
                      {completedMilestones} / {totalMilestones}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Created</span>
                    <span className="font-medium text-white">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {project.startDate && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-white/60 text-sm">Start Date</span>
                      <span className="font-medium text-white">
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-white/60 text-sm">End Date</span>
                      <span className="font-medium text-white">
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {project.assignee && (
                <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    <span>Assigned To</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {project.assignee.image ? (
                      <img
                        src={project.assignee.image}
                        alt={project.assignee.name || "Team"}
                        className="w-10 h-10 rounded-full border-2 border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-2 border-cyan-500/30" />
                    )}
                    <div>
                      <p className="font-medium text-white text-sm">{project.assignee.name}</p>
                      <p className="text-xs text-white/60">{project.assignee.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {project.budget && (
                <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                    <span>Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    ${Number(project.budget).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "milestones":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Milestones</h3>
                <span className="text-sm text-white/60">
                  {completedMilestones} of {totalMilestones} completed
                </span>
              </div>
            </div>
            {project.milestones.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No milestones yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="p-4 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          milestone.completed
                            ? "bg-emerald-500/20 border-emerald-500/50"
                            : "bg-white/5 border-white/20"
                        }`}
                      >
                        {milestone.completed && <span className="text-emerald-400 text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-white">{milestone.name}</h4>
                          {milestone.completed && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                              Completed
                            </span>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-white/60 mb-2">{milestone.description}</p>
                        )}
                        {milestone.dueDate && (
                          <p className="text-xs text-white/40">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "tasks":
        return <AdminProjectTasks projectId={project.id} clientTasks={project.clientTasks} adminTasks={project.adminTasks} />;

      case "files":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Files</h3>
            {project.files.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No files uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.files.map((file) => (
                  <div key={file.id} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                    <p className="text-white font-medium text-sm mb-2">{file.originalName || file.name}</p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View File
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "requests":
        return <AdminChangeRequestsSection requests={project.requests} projectId={project.id} />;

      case "messages":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Messages</h3>
            {project.messageThreads.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {project.messageThreads.map((thread) => (
                  <div key={thread.id} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                    <h4 className="font-semibold text-white mb-3">{thread.subject || "Message Thread"}</h4>
                    <div className="space-y-2">
                      {thread.messages.map((msg: any) => (
                        <div key={msg.id} className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-sm text-white">{msg.content}</p>
                          <p className="text-xs text-white/40 mt-1">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "invoices":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Invoices</h3>
            {project.invoices.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No invoices yet</p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Invoice #</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {project.invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 text-sm text-white font-mono">{invoice.number}</td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">
                          ${Number(invoice.amount || invoice.total).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "repository":
        return <RepositoryTab projectId={project.id} />;

      case "settings":
        return (
          <SettingsTab
            project={{
              id: project.id,
              name: project.name,
              description: project.description,
              status: project.status,
              githubRepo: project.githubRepo,
              vercelUrl: project.vercelUrl,
              questionnaire: project.questionnaire,
            }}
            assignee={project.assignee}
            isAdmin={true}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-white/60 text-sm max-w-2xl">{project.description}</p>
            )}
          </div>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
            {badge.label}
          </span>
        </div>
      </div>

      <div className="seezee-glass rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 text-sm font-medium transition-all whitespace-nowrap
                  flex items-center gap-2
                  ${
                    isActive
                      ? "text-white bg-cyan-500/20 border-b-2 border-cyan-400"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}









