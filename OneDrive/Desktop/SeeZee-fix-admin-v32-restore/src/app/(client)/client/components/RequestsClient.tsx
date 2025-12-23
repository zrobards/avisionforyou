"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Clock, FileText, AlertCircle, CheckCircle2, XCircle, Archive, Plus, X, Eye, History as TimelineIcon, Calendar, Mail, Building2, DollarSign, Filter, Edit, Trash2, FolderKanban, ExternalLink, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchJson } from "@/lib/client-api";
import { useRouter, useSearchParams } from "next/navigation";

interface ProjectRequest {
  id: string;
  title: string;
  description: string | null;
  status: string;
  contactEmail: string;
  company: string | null;
  budget: string | null;
  timeline: string | null;
  services: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
  } | null;
}

interface ChangeRequest {
  id: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
  };
  subscription: {
    id: string;
    planName: string;
  } | null;
}

const STATUS_CONFIG = {
  DRAFT: { icon: FileText, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30", label: "Draft" },
  SUBMITTED: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", label: "Submitted" },
  REVIEWING: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", label: "Under Review" },
  NEEDS_INFO: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", label: "Needs Info" },
  APPROVED: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", label: "Approved" },
  REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Rejected" },
  ARCHIVED: { icon: Archive, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30", label: "Archived" },
} as const;

const CHANGE_REQUEST_STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "Pending" },
  approved: { icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", label: "Approved" },
  in_progress: { icon: Wrench, color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/30", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", label: "Completed" },
  rejected: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Rejected" },
} as const;

export function RequestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"project" | "change">("project");
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | ChangeRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Handle edit query parameter
  const editId = searchParams.get('edit');

  const fetchProjectRequests = () => {
    fetchJson<{ requests: ProjectRequest[] }>("/api/client/requests")
      .then((data) => setProjectRequests(data.requests || []))
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch project requests:", error);
        }
      });
  };

  const fetchChangeRequests = () => {
    fetchJson<{ changeRequests: ChangeRequest[] }>("/api/client/change-requests")
      .then((data) => setChangeRequests(data.changeRequests || []))
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch change requests:", error);
        }
      });
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchProjectRequests(),
        fetchChangeRequests(),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Handle edit redirect
  useEffect(() => {
    if (editId) {
      // Redirect to start page with edit parameter
      router.push(`/start?edit=${editId}`);
    }
  }, [editId, router]);

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this project request? This action cannot be undone.')) {
      return;
    }

    setDeletingId(requestId);
    try {
      const response = await fetch(`/api/client/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete request');
      }

      // Remove from local state
      setProjectRequests(projectRequests.filter((req) => req.id !== requestId));
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
      }
    } catch (error: any) {
      console.error('Failed to delete request:', error);
      alert(error.message || 'Failed to delete request. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (request: ProjectRequest) => {
    // Redirect to start page with edit parameter
    router.push(`/start?edit=${request.id}`);
  };

  const canEditOrDelete = (request: ProjectRequest) => {
    const status = String(request.status || '').toUpperCase();
    return ['DRAFT', 'SUBMITTED'].includes(status);
  };

  const filteredProjectRequests = useMemo(() => {
    if (statusFilter === "all") return projectRequests;
    return projectRequests.filter((req) => req.status.toUpperCase() === statusFilter.toUpperCase());
  }, [projectRequests, statusFilter]);

  const filteredChangeRequests = useMemo(() => {
    if (statusFilter === "all") return changeRequests;
    return changeRequests.filter((req) => req.status === statusFilter);
  }, [changeRequests, statusFilter]);

  const currentRequests = activeTab === "project" ? filteredProjectRequests : filteredChangeRequests;
  const allRequests = activeTab === "project" ? projectRequests : changeRequests;

  const getStatusTimeline = (request: ProjectRequest) => {
    const timeline = [
      {
        status: "DRAFT",
        label: "Draft Created",
        date: request.createdAt,
        completed: true,
      },
      {
        status: "SUBMITTED",
        label: "Submitted",
        date: request.status === "DRAFT" ? null : request.createdAt,
        completed: request.status !== "DRAFT",
      },
      {
        status: "REVIEWING",
        label: "Under Review",
        date: ["REVIEWING", "NEEDS_INFO", "APPROVED", "REJECTED"].includes(request.status) ? request.updatedAt : null,
        completed: ["REVIEWING", "NEEDS_INFO", "APPROVED", "REJECTED"].includes(request.status),
      },
      {
        status: request.status,
        label: STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.label || request.status,
        date: ["APPROVED", "REJECTED", "ARCHIVED"].includes(request.status) ? request.updatedAt : null,
        completed: ["APPROVED", "REJECTED", "ARCHIVED"].includes(request.status),
      },
    ];
    
    // If project exists, add project creation step
    if (request.project) {
      timeline.push({
        status: "PROJECT_CREATED",
        label: `Project Created: ${request.project.name}`,
        date: request.project.createdAt,
        completed: true,
      });
    }
    
    return timeline;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Requests</h1>
          <p className="text-white/60 text-sm">Manage your project requests and change requests</p>
        </div>
        <div className="flex gap-3">
          {activeTab === "change" && (
            <Link href="/client/requests/new">
              <button className="px-6 py-3 bg-trinity-red hover:bg-trinity-maroon text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Change Request
              </button>
            </Link>
          )}
          {activeTab === "project" && (
            <Link href="/start">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Project Request
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => {
            setActiveTab("project");
            setStatusFilter("all");
          }}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "project"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Project Requests ({projectRequests.length})
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab("change");
            setStatusFilter("all");
          }}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "change"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Change Requests ({changeRequests.length})
          </div>
        </button>
      </div>

      {/* Status Filter */}
      {allRequests.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="flex flex-wrap gap-2">
            {activeTab === "project" ? (
              // Project Request filters
              ["all", ...Object.keys(STATUS_CONFIG)].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {status === "all" ? "All" : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}
                </button>
              ))
            ) : (
              // Change Request filters
              ["all", ...Object.keys(CHANGE_REQUEST_STATUS_CONFIG)].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {status === "all" ? "All" : CHANGE_REQUEST_STATUS_CONFIG[status as keyof typeof CHANGE_REQUEST_STATUS_CONFIG]?.label || status}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {allRequests.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 p-12 text-center rounded-2xl">
          {activeTab === "project" ? (
            <>
              <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No project requests yet</h3>
              <p className="text-white/60 mb-6">Get started by submitting your first project request</p>
              <Link href="/start">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Start a Project
                </button>
              </Link>
            </>
          ) : (
            <>
              <Wrench className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No change requests yet</h3>
              <p className="text-white/60 mb-6">Submit change requests for your active projects</p>
              <Link href="/client/requests/new">
                <button className="px-6 py-3 bg-trinity-red hover:bg-trinity-maroon text-white font-semibold rounded-lg transition-colors">
                  Create Change Request
                </button>
              </Link>
            </>
          )}
        </div>
      ) : currentRequests.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 p-12 text-center rounded-2xl">
          <Filter className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No requests found</h3>
          <p className="text-white/60 mb-4">Try adjusting your filter</p>
          <button
            onClick={() => setStatusFilter("all")}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {activeTab === "project" ? (
              // Project Requests
              filteredProjectRequests.map((request) => {
                const config = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.SUBMITTED;
                const Icon = config.icon;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-900 border border-gray-800 p-6 hover:bg-gray-800 transition-all rounded-2xl hover:border-trinity-red"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                        {request.project ? (
                          <Link
                            href={`/client/projects/${request.project.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                          >
                            <FolderKanban className="w-3.5 h-3.5" />
                            Project Created
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                        )}
                      </div>
                      
                      {request.project && (
                        <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-emerald-300 mb-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-semibold">Project Active</span>
                          </div>
                          <p className="text-xs text-emerald-200/80">
                            Your project "{request.project.name}" is now active. Click above to view and manage it.
                          </p>
                        </div>
                      )}
                      
                      <p className="text-white/70 text-sm line-clamp-2 mb-4">{request.description}</p>
                      
                      {/* Meta info */}
                      <div className="flex flex-wrap gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {request.contactEmail}
                        </span>
                        {request.company && (
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {request.company}
                          </span>
                        )}
                        {request.budget && request.budget !== "UNKNOWN" && (
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5" />
                            {request.budget.replace(/_/g, " ")}
                          </span>
                        )}
                        {request.timeline && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {request.timeline}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6 flex-shrink-0">
                      {canEditOrDelete(request) && (
                        <>
                          <button
                            onClick={() => handleEdit(request)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all"
                            title="Edit request"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(request.id)}
                            disabled={deletingId === request.id}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete request"
                          >
                            {deletingId === request.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-400" />
                            )}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-white/60" />
                      </button>
                      <div className="text-right text-xs text-white/40">
                        <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                        <div className="mt-1">{new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  {request.services && request.services.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex flex-wrap gap-2">
                        {request.services.map((service) => (
                          <span
                            key={service}
                            className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-lg border border-cyan-500/30"
                          >
                            {service.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Internal notes (if any) */}
                  {request.notes && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs text-white/50 mb-1">Admin Notes:</div>
                      <div className="text-sm text-white/70 bg-white/5 rounded-lg p-3">
                        {request.notes}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
              })
            ) : (
              // Change Requests
              filteredChangeRequests.map((request) => {
                const getStatusColor = (status: string) => {
                  const colors: Record<string, string> = {
                    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                    approved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    in_progress: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
                    completed: "bg-green-500/20 text-green-300 border-green-500/30",
                    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
                  };
                  return colors[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
                };

                const getPriorityColor = (priority: string) => {
                  const colors: Record<string, string> = {
                    LOW: "text-gray-400",
                    NORMAL: "text-blue-400",
                    HIGH: "text-yellow-400",
                    URGENT: "text-orange-400",
                    EMERGENCY: "text-red-400",
                  };
                  return colors[priority] || "text-gray-400";
                };

                const statusColor = getStatusColor(request.status);
                const priorityColor = getPriorityColor(request.priority);
                const title = request.description.split('\n\n')[0] || request.description.substring(0, 100);
                const description = request.description.split('\n\n').slice(1).join('\n\n') || request.description;

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-900 border border-gray-800 p-6 hover:bg-gray-800 transition-all rounded-2xl hover:border-trinity-red"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">{title}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`text-xs font-medium ${priorityColor}`}>
                            {request.priority}
                          </span>
                        </div>
                        
                        <p className="text-white/70 text-sm line-clamp-2 mb-4">{description}</p>
                        
                        {/* Meta info */}
                        <div className="flex flex-wrap gap-4 text-xs text-white/60">
                          <span className="flex items-center gap-1.5">
                            <FolderKanban className="w-3.5 h-3.5" />
                            {request.project.name}
                          </span>
                          {request.estimatedHours && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Est: {request.estimatedHours}h
                            </span>
                          )}
                          {request.actualHours && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Actual: {request.actualHours}h
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-6 flex-shrink-0">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-white/60" />
                        </button>
                        <div className="text-right text-xs text-white/40">
                          <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                          <div className="mt-1">{new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-lg border border-cyan-500/30">
                          {request.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Request Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {'title' in selectedRequest ? selectedRequest.title : selectedRequest.description.split('\n\n')[0] || 'Change Request'}
                  </h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mb-6">
                  {'project' in selectedRequest && selectedRequest.project ? (
                    <div className="space-y-3">
                      <Link
                        href={`/client/projects/${selectedRequest.project.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                      >
                        <FolderKanban className="w-4 h-4" />
                        Project Created
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-emerald-300 mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold">Project Active</span>
                        </div>
                        <p className="text-sm text-emerald-200/80 mb-2">
                          Your project "{selectedRequest.project.name}" is now active and ready for collaboration.
                        </p>
                        <Link
                          href={`/client/projects/${selectedRequest.project.id}`}
                          className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200 font-medium"
                        >
                          View Project
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ) : 'title' in selectedRequest ? (
                    (() => {
                      const config = STATUS_CONFIG[selectedRequest.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.SUBMITTED;
                      const Icon = config.icon;
                      return (
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${config.bg} ${config.color} ${config.border}`}>
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      );
                    })()
                  ) : (
                    // Change Request status
                    (() => {
                      const changeRequest = selectedRequest as ChangeRequest;
                      const getStatusColor = (status: string) => {
                        const colors: Record<string, string> = {
                          pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                          approved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                          in_progress: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
                          completed: "bg-green-500/20 text-green-300 border-green-500/30",
                          rejected: "bg-red-500/20 text-red-300 border-red-500/30",
                        };
                        return colors[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
                      };
                      const statusColor = getStatusColor(changeRequest.status);
                      return (
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusColor}`}>
                          {changeRequest.status.replace('_', ' ').toUpperCase()}
                        </span>
                      );
                    })()
                  )}
                </div>

                {/* Description */}
                {selectedRequest.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-2">Description</h3>
                    <p className="text-white/80">
                      {'title' in selectedRequest ? selectedRequest.description : selectedRequest.description.split('\n\n').slice(1).join('\n\n') || selectedRequest.description}
                    </p>
                  </div>
                )}

                {/* Timeline - Only for Project Requests */}
                {'title' in selectedRequest && (() => {
                  const timeline = getStatusTimeline(selectedRequest);
                  return (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                        <TimelineIcon className="w-4 h-4" />
                        Status Timeline
                      </h3>
                      <div className="space-y-3">
                        {timeline.map((item, index) => (
                        <div key={index} className="flex gap-4 relative">
                          {index < timeline.length - 1 && (
                          <div className="absolute left-3 top-6 bottom-0 w-px bg-white/10" />
                        )}
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          item.completed
                            ? "bg-emerald-500/20 border-emerald-500/50"
                            : "bg-white/5 border-white/20"
                        }`}>
                          {item.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-semibold text-white text-sm">{item.label}</div>
                          {item.date && (
                            <div className="text-xs text-white/40 mt-1">
                              {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                  );
                })()}

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {'contactEmail' in selectedRequest ? (
                    // Project Request details
                    <>
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                          <Mail className="w-4 h-4" />
                          Contact Email
                        </div>
                        <div className="text-white font-medium">{selectedRequest.contactEmail}</div>
                      </div>
                      {selectedRequest.company && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <Building2 className="w-4 h-4" />
                            Company
                          </div>
                          <div className="text-white font-medium">{selectedRequest.company}</div>
                        </div>
                      )}
                      {selectedRequest.budget && selectedRequest.budget !== "UNKNOWN" && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <DollarSign className="w-4 h-4" />
                            Budget
                          </div>
                          <div className="text-white font-medium">{selectedRequest.budget.replace(/_/g, " ")}</div>
                        </div>
                      )}
                      {selectedRequest.timeline && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <Calendar className="w-4 h-4" />
                            Timeline
                          </div>
                          <div className="text-white font-medium">{selectedRequest.timeline}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Change Request details
                    <>
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                          <FolderKanban className="w-4 h-4" />
                          Project
                        </div>
                        <Link href={`/client/projects/${selectedRequest.project.id}`} className="text-white font-medium hover:text-blue-400">
                          {selectedRequest.project.name}
                        </Link>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                          <Wrench className="w-4 h-4" />
                          Category
                        </div>
                        <div className="text-white font-medium">{selectedRequest.category.replace('_', ' ')}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                          <AlertCircle className="w-4 h-4" />
                          Priority
                        </div>
                        <div className="text-white font-medium">{selectedRequest.priority}</div>
                      </div>
                      {selectedRequest.estimatedHours && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <Clock className="w-4 h-4" />
                            Estimated Hours
                          </div>
                          <div className="text-white font-medium">{selectedRequest.estimatedHours}h</div>
                        </div>
                      )}
                      {selectedRequest.actualHours && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <Clock className="w-4 h-4" />
                            Actual Hours
                          </div>
                          <div className="text-white font-medium">{selectedRequest.actualHours}h</div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Services - Only for Project Requests */}
                {'services' in selectedRequest && selectedRequest.services && selectedRequest.services.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-3">Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.services.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 text-sm font-medium rounded-lg border border-cyan-500/30"
                        >
                          {service.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes - Only for Project Requests */}
                {'notes' in selectedRequest && selectedRequest.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-2">Admin Notes</h3>
                    <div className="p-4 bg-white/5 rounded-xl text-white/80">
                      {selectedRequest.notes}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors border border-white/10"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

