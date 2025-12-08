"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchJson, normalizeItems } from "@/lib/client-api";
import StatusBadge from "@/components/ui/StatusBadge";
import { shouldShowPreClientDashboard, getDashboardState, getActiveProjectRequest } from "@/lib/dashboard-state";
import ActivityFeed from "@/components/client/dashboard/ActivityFeed";
import type { Activity } from "@/lib/dashboard-helpers";
import { 
  FiArrowRight, 
  FiFolder, 
  FiFileText, 
  FiMessageSquare, 
  FiCheckCircle,
  FiPlus,
  FiAlertCircle,
  FiClock,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiBriefcase,
  FiMail
} from "react-icons/fi";

interface Project {
  id: string;
  name: string;
  status: string;
  dueDate?: string;
  phase?: string;
  milestones?: Array<{ status: string }>;
}

interface Invoice {
  id: string;
  status: string;
  total?: number;
}

interface ProjectRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  contactEmail: string;
  company?: string;
  budget?: string;
  timeline?: string;
  services?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Request {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderName?: string;
  message: string;
  createdAt: string;
}

export default function ClientDashboardClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [projectsData, invoicesData, projectRequestsData, overviewData] = await Promise.all([
        fetchJson<any>("/api/client/projects").catch((err) => {
          console.error('Failed to fetch projects:', err);
          return { items: [] };
        }),
        fetchJson<any>("/api/client/invoices").catch((err) => {
          console.error('Failed to fetch invoices:', err);
          return { invoices: [] };
        }),
        fetchJson<any>("/api/client/requests").catch((err) => {
          console.error('Failed to fetch project requests:', err);
          return { requests: [] };
        }),
        fetchJson<any>("/api/client/overview").catch((err) => {
          console.error('Failed to fetch overview:', err);
          return {};
        }),
      ]);

      // Process activity data from overview
      if (overviewData?.activity?.items) {
        const processedActivities: Activity[] = overviewData.activity.items.map((item: any) => {
          // Map activity types to ActivityFeed types
          let type: Activity['type'] = 'PROJECT_CREATED';
          if (item.type === 'FILE_UPLOAD' || item.description?.includes('file')) {
            type = 'FILE_UPLOAD';
          } else if (item.type === 'MESSAGE' || item.description?.includes('message')) {
            type = 'MESSAGE';
          } else if (item.type === 'MILESTONE' || item.description?.includes('milestone')) {
            type = 'MILESTONE';
          } else if (item.type === 'PAYMENT' || item.description?.includes('payment') || item.description?.includes('invoice')) {
            type = 'PAYMENT';
          } else if (item.type === 'TASK_COMPLETED' || item.description?.includes('task')) {
            type = 'TASK_COMPLETED';
          }

          return {
            id: item.id,
            type,
            title: item.title || 'Activity',
            description: item.description,
            metadata: item.metadata || {},
            createdAt: new Date(item.createdAt),
            createdBy: item.user?.name || 'System',
          };
        });
        setActivities(processedActivities);
      }

      setProjects(normalizeItems(projectsData));
      setInvoices(normalizeItems(invoicesData));
      // Project requests are returned from /api/client/requests endpoint
      const projectRequestsList = projectRequestsData?.requests || [];
      console.log('Project requests fetched:', projectRequestsList.length, projectRequestsList);
      setProjectRequests(projectRequestsList);
      // Also set requests for the "Recent Requests" section (using same data)
      setRequests(projectRequestsList.map((req: ProjectRequest) => ({
        id: req.id,
        title: req.title || 'Untitled Request',
        description: req.description || undefined,
        status: req.status,
        createdAt: req.createdAt,
      })));
      
      // Messages might be in overview or separate endpoint
      if (overviewData?.messages) {
        setMessages(normalizeItems(overviewData.messages));
      } else if (overviewData?.activity?.items) {
        // Map activity items to messages format if needed
        setMessages(overviewData.activity.items.map((item: any) => ({
          id: item.id,
          senderName: item.user?.name || 'System',
          message: item.description || item.title || '',
          createdAt: item.createdAt,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  // Refresh data when page becomes visible (handles case when user navigates back after deletion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user) {
        fetchData();
      }
    };

    const handleFocus = () => {
      if (session?.user) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session]);

  const activeProjects = projects.filter((p) => {
    const status = String(p.status || '').toUpperCase();
    return ['ACTIVE', 'IN_PROGRESS', 'DESIGN', 'BUILD', 'REVIEW', 'PLANNING', 'LAUNCH'].includes(status);
  });
  const pendingInvoices = invoices.filter((inv) => {
    const status = String(inv.status || '').toUpperCase();
    return ['SENT', 'DRAFT', 'OVERDUE'].includes(status);
  });
  const activeRequests = requests.filter((req) => {
    const status = String(req.status || '').toUpperCase();
    return ['SUBMITTED', 'REVIEWING', 'DRAFT', 'NEEDS_INFO'].includes(status);
  });
  
  // Check for active project requests (status: DRAFT, SUBMITTED, REVIEWING, NEEDS_INFO)
  const activeProjectRequests = projectRequests.filter((req) => {
    const status = String(req.status || '').toUpperCase();
    return ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'].includes(status);
  });
  
  const recentMessages = messages.slice(0, 3);

  // Handle project navigation with error checking
  const handleProjectClick = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // Verify project exists before navigating
      const response = await fetch(`/api/client/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Project doesn't exist, refresh data and show error
          await fetchData();
          alert('This project no longer exists. The dashboard has been refreshed.');
          return;
        }
        throw new Error('Failed to verify project');
      }
      
      // Project exists, navigate to it
      router.push(`/client/projects/${projectId}`);
    } catch (err) {
      console.error('Error verifying project:', err);
      // Refresh data in case project was deleted
      await fetchData();
      alert('Unable to access this project. The dashboard has been refreshed.');
    }
  };

  // Determine dashboard state
  const dashboardState = getDashboardState(projectRequests, projects);
  const showPreClientDashboard = shouldShowPreClientDashboard(projectRequests, projects);
  const activeProjectRequest = getActiveProjectRequest(projectRequests);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trinity-red"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  // Pre-Client Dashboard - Show when user has active project request or only LEAD projects
  if (showPreClientDashboard) {
    return (
      <div className="space-y-10">
        {/* Pre-Client Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 rounded-xl border border-blue-600/50 p-10 overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-4xl font-heading font-bold text-white mb-3 tracking-tight">
              Welcome, {session?.user?.name || 'User'}!
            </h1>
            <p className="text-gray-200 text-lg">
              Your project request is being reviewed. You'll have full dashboard access once your project is approved.
            </p>
          </div>
        </motion.div>

        {/* Current Project Request Status */}
        {activeProjectRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-8 shadow-xl hover:shadow-2xl hover:border-gray-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-white">Current Project Request</h2>
              <StatusBadge status={activeProjectRequest.status} size="md" />
            </div>

            <div className="space-y-6">
              {/* Request Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">{activeProjectRequest.title || 'Untitled Request'}</h3>
                {activeProjectRequest.description && (
                  <p className="text-gray-300 mb-4">{activeProjectRequest.description}</p>
                )}

              {/* Request Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {activeProjectRequest.company && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiBriefcase className="w-5 h-5 text-blue-400" />
                    <span>{activeProjectRequest.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-300">
                  <FiMail className="w-5 h-5 text-blue-400" />
                  <span>{activeProjectRequest.contactEmail}</span>
                </div>
                {activeProjectRequest.budget && activeProjectRequest.budget !== "UNKNOWN" && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiDollarSign className="w-5 h-5 text-blue-400" />
                    <span>{activeProjectRequest.budget.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {activeProjectRequest.timeline && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiCalendar className="w-5 h-5 text-blue-400" />
                    <span>{activeProjectRequest.timeline}</span>
                  </div>
                )}
              </div>

              {/* Services */}
              {activeProjectRequest.services && activeProjectRequest.services.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProjectRequest.services.map((service: string) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-lg border border-blue-500/30"
                      >
                        {service.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-4">Status Timeline</h4>
                <div className="space-y-3">
                  {[
                    { status: 'DRAFT', label: 'Draft Created', completed: true },
                    { status: 'SUBMITTED', label: 'Submitted', completed: activeProjectRequest.status !== 'DRAFT' },
                    { status: 'REVIEWING', label: 'Under Review', completed: ['REVIEWING', 'NEEDS_INFO', 'APPROVED', 'REJECTED'].includes(activeProjectRequest.status) },
                    { status: activeProjectRequest.status, label: activeProjectRequest.status.replace(/_/g, ' '), completed: ['APPROVED', 'REJECTED'].includes(activeProjectRequest.status) },
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-white/5 border-white/20'
                      }`}>
                        {step.completed && <FiCheckCircle className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{step.label}</div>
                        {step.completed && (
                          <div className="text-xs text-gray-400 mt-1">
                            {activeProjectRequest.createdAt && new Date(activeProjectRequest.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
                {(activeProjectRequest.status === 'DRAFT' || activeProjectRequest.status === 'SUBMITTED') && (
                  <>
                    <Link
                      href={`/start?edit=${activeProjectRequest.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                      Edit Request
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this request?')) {
                          // Delete functionality will be handled in RequestsClient
                          window.location.href = `/client/requests?delete=${activeProjectRequest.id}`;
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete Request
                    </button>
                  </>
                )}
                <Link
                  href="/client/requests"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  View Full Details
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Waiting Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-gradient-to-r from-amber-900/40 to-orange-900/40 rounded-xl border border-amber-600/50 p-8 overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10 flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <FiClock className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-heading font-bold text-white mb-3">
                Waiting for Review
              </h3>
              <p className="text-gray-200 text-lg">
                Your project request is currently being reviewed by our team. Once approved, you'll receive full dashboard access and can start working on your project. We typically review requests within 24 hours.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Show LEAD projects if any */}
        {dashboardState.leadProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-heading font-bold text-white mb-8 tracking-tight">Waiting Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardState.leadProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 hover:border-trinity-red/50 hover:shadow-xl hover:shadow-trinity-red/10 transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-gray-100 transition-colors">
                          {project.name}
                        </h3>
                        <StatusBadge status={project.status} size="sm" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      This project is waiting for conversion from lead to active project.
                    </p>
                    <button
                      onClick={(e) => handleProjectClick(project.id, e)}
                      className="inline-flex items-center gap-2 text-trinity-red hover:text-white hover:gap-3 transition-all font-semibold group/link"
                    >
                      View Details
                      <FiArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Check if user has absolutely no projects and no active requests
  const hasNoProjects = projects.length === 0;
  const hasNoActiveProjects = activeProjects.length === 0;
  const hasNoProjectRequests = projectRequests.length === 0;
  const hasNoActiveProjectRequests = activeProjectRequests.length === 0;

  // Show empty state if user has no projects at all and no active requests
  if (hasNoProjects && hasNoActiveProjectRequests) {
    return (
      <div className="space-y-10">
        {/* Empty State - No Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 rounded-xl border border-blue-600/50 p-12 overflow-hidden shadow-xl text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
              <FiFolder className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-4xl font-heading font-bold text-white mb-4 tracking-tight">
              Welcome, {session?.user?.name || 'User'}!
            </h1>
            <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
              You don't have any projects yet. Get started by submitting a project request and we'll help bring your vision to life!
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
            >
              <FiPlus className="w-5 h-5" />
              Start Your First Project
            </Link>
          </div>
        </motion.div>

        {/* Helpful Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <FiCheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fast Turnaround</h3>
            <p className="text-gray-400 text-sm">Get your website built in 48 hours</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <FiBriefcase className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Professional Quality</h3>
            <p className="text-gray-400 text-sm">Expert design and development</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <FiMessageSquare className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ongoing Support</h3>
            <p className="text-gray-400 text-sm">We're here to help every step of the way</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Full Dashboard - Show when user has active projects
  return (
    <div className="space-y-10">
      {/* Start Project Section */}
      {activeProjectRequests.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-amber-900/40 to-orange-900/40 rounded-xl border border-amber-600/50 p-8 overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10 flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <FiAlertCircle className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-heading font-bold text-white mb-3">
                You have an active project request
              </h2>
              <p className="text-gray-200 mb-6 text-lg">
                You currently have a project request in progress. Please wait for it to be reviewed before submitting a new one.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {activeProjectRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/40 transition-all"
                  >
                    <p className="text-sm font-semibold text-white">{req.title || 'Untitled Request'}</p>
                    <p className="text-xs text-amber-200 mt-1">
                      Status: {req.status.replace(/_/g, ' ')}
                    </p>
                  </motion.div>
                ))}
              </div>
              <Link
                href="/client/requests"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-amber-500/25"
              >
                View My Requests
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          className="relative bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 rounded-xl border border-blue-600/50 p-8 overflow-hidden shadow-xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-heading font-bold text-white mb-3 tracking-tight">
                Ready to start a new project?
              </h2>
              <p className="text-gray-200 text-lg">
                Get your professional website built in 48 hours. Choose your package and let's get started!
              </p>
            </div>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
            >
              <FiPlus className="w-5 h-5" />
              Start Project
            </Link>
          </div>
        </motion.div>
      )}

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-xl border border-gray-800 p-8 overflow-hidden shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-trinity-red/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-4xl font-heading font-bold text-white mb-3 tracking-tight">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-gray-300 text-lg">
            Here's an overview of your projects and account activity.
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 hover:border-trinity-red/50 hover:shadow-lg hover:shadow-trinity-red/10 transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-trinity-red/10 rounded-lg group-hover:bg-trinity-red/20 transition-colors duration-300">
                <FiFolder className="w-8 h-8 text-trinity-red drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
              </div>
              <StatusBadge status="active" size="sm" />
            </div>
            <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">{activeProjects.length}</h3>
            <p className="text-sm text-gray-400 font-medium">Active Projects</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors duration-300">
                <FiFileText className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              </div>
              <StatusBadge status="unpaid" size="sm" />
            </div>
            <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">{pendingInvoices.length}</h3>
            <p className="text-sm text-gray-400 font-medium">Pending Invoices</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-300">
                <FiMessageSquare className="w-8 h-8 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </div>
              <StatusBadge status="in_progress" size="sm" />
            </div>
            <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">{activeRequests.length}</h3>
            <p className="text-sm text-gray-400 font-medium">Active Requests</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors duration-300">
                <FiCheckCircle className="w-8 h-8 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </div>
            </div>
            <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">{projects.length}</h3>
            <p className="text-sm text-gray-400 font-medium">Total Projects</p>
          </div>
        </motion.div>
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">Active Projects</h2>
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
            {activeProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 hover:border-trinity-red/50 hover:shadow-xl hover:shadow-trinity-red/10 transition-all duration-300 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-gray-100 transition-colors">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                  </div>
                  {project.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 bg-gray-800/50 rounded-lg px-3 py-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => handleProjectClick(project.id, e)}
                    className="inline-flex items-center gap-2 text-trinity-red hover:text-white hover:gap-3 transition-all font-semibold group/link"
                  >
                    View Details
                    <FiArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800 p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/5 via-transparent to-trinity-red/5" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <FiFolder className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-6 text-lg">No active projects</p>
              {activeProjectRequests.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-amber-400 text-sm mb-4">
                    You have an active project request. Please wait for it to be reviewed.
                  </p>
                  <Link
                    href="/client/requests"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg hover:shadow-amber-500/25 font-semibold"
                  >
                    View My Requests
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-trinity-red to-red-700 hover:from-trinity-maroon hover:to-red-800 text-white rounded-lg transition-all shadow-lg hover:shadow-trinity-red/25 font-semibold"
                >
                  <FiPlus className="w-5 h-5" />
                  Start a New Project
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Activity Feed */}
      {activities.length > 0 && (
        <div>
          <ActivityFeed activities={activities} projectId={activeProjects[0]?.id || ""} />
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiMessageSquare className="w-5 h-5 text-blue-500" />
              Recent Requests
            </h3>
            <Link
              href="/client/requests"
              className="text-sm text-trinity-red hover:text-white transition-colors font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          {activeRequests.length > 0 ? (
            <div className="space-y-3">
              {activeRequests.slice(0, 3).map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white group-hover:text-gray-100">{request.title}</h4>
                    <StatusBadge status={request.status} size="sm" />
                  </div>
                  {request.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                      {request.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <FiClock className="w-3 h-3 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 mb-3 bg-gray-800 rounded-full flex items-center justify-center">
                <FiMessageSquare className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">No recent requests</p>
            </div>
          )}
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiMail className="w-5 h-5 text-green-500" />
              Recent Messages
            </h3>
            <Link
              href="/client/messages"
              className="text-sm text-trinity-red hover:text-white transition-colors font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          {recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {message.senderName && (
                        <p className="font-semibold text-white group-hover:text-gray-100 mb-1">{message.senderName}</p>
                      )}
                      <p className="text-sm text-gray-400 line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-3 h-3 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 mb-3 bg-gray-800 rounded-full flex items-center justify-center">
                <FiMail className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">No recent messages</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
