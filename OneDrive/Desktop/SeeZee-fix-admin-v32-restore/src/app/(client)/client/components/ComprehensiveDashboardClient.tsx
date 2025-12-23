"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import ActionPanel from "@/components/client/dashboard/ActionPanel";
import ActivityFeed from "@/components/client/dashboard/ActivityFeed";
import WelcomeHero from "@/components/client/dashboard/WelcomeHero";
import DashboardCharts from "@/components/client/dashboard/DashboardCharts";
import StatusBadge from "@/components/ui/StatusBadge";
import { HoursBank } from "@/components/client/HoursBank";
import { MaintenancePlanManager } from "@/components/client/MaintenancePlanManager";
import type { ComprehensiveDashboardData } from "@/lib/dashboard-helpers";
import type { HoursBalanceData } from "../actions/hours";
import { 
  FiArrowRight, 
  FiFolder, 
  FiFileText, 
  FiMessageSquare, 
  FiCheckCircle,
  FiPlus,
  FiClock,
  FiTrendingUp,
  FiCalendar,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";

interface ComprehensiveDashboardClientProps {
  data: ComprehensiveDashboardData;
  userName?: string;
  hoursBalance?: HoursBalanceData | null;
}

export default function ComprehensiveDashboardClient({ 
  data, 
  userName,
  hoursBalance,
}: ComprehensiveDashboardClientProps) {
  const searchParams = useSearchParams();
  const [selectedPlanProjectId, setSelectedPlanProjectId] = useState<string | undefined>();
  const [currentHoursBalance, setCurrentHoursBalance] = useState<HoursBalanceData | null | undefined>(hoursBalance);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  // Show all projects that aren't completed or cancelled
  const activeProjects = data.projects.filter((p) => {
    const status = String(p.status || '').toUpperCase();
    return !['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(status);
  });

  // Fetch hours balance when plan selection changes or when refresh is requested
  useEffect(() => {
    const fetchHoursBalance = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComprehensiveDashboardClient.tsx:54',message:'fetchHoursBalance called',data:{selectedPlanProjectId,hasInitialBalance:!!hoursBalance},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // If refresh=hours query param is present, always fetch fresh data
      const shouldRefresh = searchParams?.get('refresh') === 'hours';
      
      if (shouldRefresh) {
        // Always fetch fresh data when refresh is requested
        try {
          const url = selectedPlanProjectId 
            ? `/api/client/hours?projectId=${selectedPlanProjectId}&_t=${Date.now()}`
            : `/api/client/hours?_t=${Date.now()}`;
          
          const response = await fetch(url, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Fetched hours balance after refresh:', {
              totalAvailable: data.totalAvailable,
              monthlyIncluded: data.monthlyIncluded,
              monthlyUsed: data.monthlyUsed,
              isUnlimited: data.isUnlimited,
            });
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComprehensiveDashboardClient.tsx:75',message:'Setting hours balance state',data:{monthlyUsed:data.monthlyUsed,totalAvailable:data.totalAvailable,estimatedHoursPending:data.estimatedHoursPending},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            setCurrentHoursBalance(data);
            // Remove the refresh parameter from URL after fetching
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('refresh');
            window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
          } else {
            const errorText = await response.text();
            console.error('❌ Failed to fetch hours balance:', response.status, errorText);
          }
        } catch (error) {
          console.error('Failed to fetch hours balance:', error);
        }
      } else if (selectedPlanProjectId) {
        try {
          const response = await fetch(`/api/client/hours?projectId=${selectedPlanProjectId}`, {
            cache: 'no-store',
          });
          if (response.ok) {
            const data = await response.json();
            setCurrentHoursBalance(data);
          }
        } catch (error) {
          console.error('Failed to fetch hours balance:', error);
        }
      } else {
        // Use the initial hours balance if no plan is selected and no refresh requested
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComprehensiveDashboardClient.tsx:107',message:'Using initial hoursBalance prop',data:{monthlyUsed:hoursBalance?.monthlyUsed,totalAvailable:hoursBalance?.totalAvailable},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setCurrentHoursBalance(hoursBalance);
      }
    };

    fetchHoursBalance();
  }, [selectedPlanProjectId, hoursBalance, searchParams]);

  // Fetch upcoming meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/client/meetings');
        if (response.ok) {
          const data = await response.json();
          const now = new Date();
          const upcoming = (data.meetings || []).filter((m: any) => {
            const startTime = new Date(m.startTime);
            return startTime > now && (m.status === 'SCHEDULED' || m.status === 'CONFIRMED' || m.status === 'PENDING');
          }).slice(0, 5); // Show next 5 meetings
          setUpcomingMeetings(upcoming);
        }
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
      } finally {
        setLoadingMeetings(false);
      }
    };
    fetchMeetings();
  }, []);

  // Calculate request breakdown (handles both project requests and change requests)
  const requestBreakdown = useMemo(() => {
    const pending = data.recentRequests.filter((r: any) => {
      const status = String(r.status || '').toUpperCase();
      const statusLower = String(r.status || '').toLowerCase();
      // Project request statuses
      return ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'].includes(status) ||
             // Change request statuses
             ['pending'].includes(statusLower);
    });
    const approved = data.recentRequests.filter((r: any) => {
      const status = String(r.status || '').toUpperCase();
      const statusLower = String(r.status || '').toLowerCase();
      // Project request statuses
      return ['APPROVED'].includes(status) ||
             // Change request statuses
             ['approved', 'in_progress', 'completed'].includes(statusLower);
    });
    const rejected = data.recentRequests.filter((r: any) => {
      const status = String(r.status || '').toUpperCase();
      const statusLower = String(r.status || '').toLowerCase();
      // Project request statuses
      return ['REJECTED', 'ARCHIVED'].includes(status) ||
             // Change request statuses
             ['rejected'].includes(statusLower);
    });
    return { pending, approved, rejected };
  }, [data.recentRequests]);

  // Calculate projects by status for charts
  const projectsByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    data.projects.forEach((p) => {
      const status = String(p.status || 'UNKNOWN').toUpperCase();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return statusCounts;
  }, [data.projects]);

  // Calculate hours balance for charts
  const hoursBalanceForChart = useMemo(() => {
    if (!currentHoursBalance) return undefined;
    return {
      monthlyUsed: currentHoursBalance.monthlyUsed,
      monthlyIncluded: currentHoursBalance.monthlyIncluded,
      rolloverHours: currentHoursBalance.rolloverTotal,
      packHours: currentHoursBalance.packHoursTotal,
      totalAvailable: currentHoursBalance.totalAvailable,
    };
  }, [currentHoursBalance]);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <WelcomeHero
        userName={userName || 'User'}
        hasActiveProjects={activeProjects.length > 0}
        pendingTasks={data.actionItems.length}
        hoursRemaining={currentHoursBalance?.totalAvailable}
        isUnlimited={currentHoursBalance?.isUnlimited}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 hover:border-trinity-red/50 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gray-800/50 text-trinity-red">
                <FiFolder className="w-6 h-6" />
              </div>
              <StatusBadge status="active" size="sm" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1">{data.stats.activeProjects}</h3>
            <p className="text-sm text-gray-400 font-medium">Active Projects</p>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gray-800/50 text-yellow-500">
                <FiFileText className="w-6 h-6" />
              </div>
              <StatusBadge status="unpaid" size="sm" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1">{data.stats.pendingInvoices}</h3>
            <p className="text-sm text-gray-400 font-medium">Pending Invoices</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gray-800/50 text-blue-500">
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <StatusBadge status="in_progress" size="sm" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1">{data.stats.activeRequests}</h3>
            <p className="text-sm text-gray-400 font-medium">Active Requests</p>
            <p className="text-xs text-gray-500 mt-1">Being worked on</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gray-800/50 text-cyan-500">
                <FiClock className="w-6 h-6" />
              </div>
              {hoursBalance && !hoursBalance.isUnlimited && hoursBalance.monthlyUsed > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-amber-400">
                  <FiTrendingUp className="w-3 h-3" />
                  {Math.round((hoursBalance.monthlyUsed / hoursBalance.monthlyIncluded) * 100)}%
                </div>
              )}
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {hoursBalance?.isUnlimited ? '∞' : (hoursBalance?.estimatedRemaining !== undefined ? hoursBalance.estimatedRemaining : hoursBalance?.totalAvailable ?? data.stats.totalProjects)}
            </h3>
            <p className="text-sm text-gray-400 font-medium">
              {hoursBalance ? (hoursBalance.estimatedRemaining !== undefined ? 'Estimated Remaining' : 'Hours Available') : 'Total Projects'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {hoursBalance ? (
                hoursBalance.isUnlimited ? 'Unlimited plan' : (
                  hoursBalance.estimatedRemaining !== undefined && hoursBalance.estimatedHoursPending && hoursBalance.estimatedHoursPending > 0
                    ? `${hoursBalance.estimatedHoursPending}h pending in requests`
                    : `${hoursBalance.monthlyUsed} used this month`
                )
              ) : 'All time'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      {(Object.keys(projectsByStatus).length > 0 || hoursBalanceForChart) && (
        <DashboardCharts
          projectsByStatus={projectsByStatus}
          hoursBalance={hoursBalanceForChart}
        />
      )}

      {/* Maintenance Plan Selector & Hours Balance */}
      {currentHoursBalance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <MaintenancePlanManager
            onPlanSelect={(planId) => {
              // Find the project ID for this plan
              // We'll need to fetch it or pass it through
              // For now, we'll use the planId to find the project
              fetch(`/api/client/maintenance-plans/${planId}`)
                .then(res => res.json())
                .then(plan => {
                  if (plan?.project?.id) {
                    setSelectedPlanProjectId(plan.project.id);
                  }
                })
                .catch(console.error);
            }}
            selectedPlanId={selectedPlanProjectId}
          />
          <div className="lg:max-w-md">
            <HoursBank
              monthlyIncluded={currentHoursBalance.monthlyIncluded}
              monthlyUsed={currentHoursBalance.monthlyUsed}
              monthlyRemaining={currentHoursBalance.monthlyRemaining}
              rolloverTotal={currentHoursBalance.rolloverTotal}
              rolloverExpiringSoon={currentHoursBalance.rolloverExpiringSoon}
              packHoursTotal={currentHoursBalance.packHoursTotal}
              packHoursExpiringSoon={currentHoursBalance.packHoursExpiringSoon}
              totalAvailable={currentHoursBalance.totalAvailable}
              isUnlimited={currentHoursBalance.isUnlimited}
              atLimit={currentHoursBalance.atLimit}
              isOverage={currentHoursBalance.isOverage}
              overageHours={currentHoursBalance.overageHours}
              changeRequestsIncluded={currentHoursBalance.changeRequestsIncluded}
              changeRequestsUsed={currentHoursBalance.changeRequestsUsed}
              changeRequestsRemaining={currentHoursBalance.changeRequestsRemaining}
              tierName={currentHoursBalance.tierName}
              periodEnd={currentHoursBalance.periodEnd}
              onDemandEnabled={currentHoursBalance.onDemandEnabled}
            />
          </div>
        </motion.div>
      )}

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

      {/* Hours Breakdown - Separate section */}
      {currentHoursBalance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiClock className="w-5 h-5 text-cyan-400" />
              Hours Breakdown
            </h3>
          </div>
          
          <div className="space-y-3">
            {currentHoursBalance.isUnlimited ? (
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-cyan-400 mb-2">∞</div>
                <p className="text-sm text-gray-400">Unlimited Plan</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Available</span>
                    <span className="text-lg font-bold text-white">
                      {currentHoursBalance.estimatedRemaining !== undefined 
                        ? currentHoursBalance.estimatedRemaining 
                        : currentHoursBalance.totalAvailable}
                    </span>
                  </div>
                  {currentHoursBalance.estimatedHoursPending !== undefined && currentHoursBalance.estimatedHoursPending > 0 && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-500">Pending</span>
                      <span className="text-xs text-yellow-400">
                        -{currentHoursBalance.estimatedHoursPending}h
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-gray-400">Monthly</div>
                    <div className="text-white font-semibold">{currentHoursBalance.monthlyRemaining}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-gray-400">Rollover</div>
                    <div className="text-white font-semibold">{currentHoursBalance.rolloverTotal}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-gray-400">Packs</div>
                    <div className="text-white font-semibold">{currentHoursBalance.packHoursTotal}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-gray-400">Used</div>
                    <div className="text-white font-semibold">{currentHoursBalance.monthlyUsed}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Requests & Upcoming Meetings - At the bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Requests</h3>
            <Link href="/client/requests" className="text-sm text-trinity-red hover:text-trinity-maroon">
              View All →
            </Link>
          </div>
          
          {/* Breakdown Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{requestBreakdown.pending.length}</div>
              <div className="text-xs text-gray-400 mt-1">Pending</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{requestBreakdown.approved.length}</div>
              <div className="text-xs text-gray-400 mt-1">Approved</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-400">{requestBreakdown.rejected.length}</div>
              <div className="text-xs text-gray-400 mt-1">Rejected</div>
            </div>
          </div>

          {/* Recent Requests List */}
          {data.recentRequests.length > 0 ? (
            <div className="space-y-2">
              {data.recentRequests.slice(0, 3).map((request) => {
                return (
                  <Link
                    key={request.id}
                    href="/client/requests"
                    className="block p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-trinity-red transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-white text-sm line-clamp-1">{request.title}</h4>
                      <StatusBadge status={request.status} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">No recent requests</p>
          )}
        </motion.div>

        {/* Upcoming Meetings / Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-purple-400" />
              Upcoming Meetings
            </h3>
            <Link href="/client/meetings" className="text-sm text-trinity-red hover:text-trinity-maroon">
              View All →
            </Link>
          </div>
          
          {loadingMeetings ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trinity-red mx-auto"></div>
            </div>
          ) : upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => {
                const startTime = new Date(meeting.startTime);
                const isToday = startTime.toDateString() === new Date().toDateString();
                return (
                  <Link
                    key={meeting.id}
                    href="/client/meetings"
                    className="block p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-white text-sm line-clamp-1">{meeting.title}</h4>
                      {isToday && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Today</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {isToday 
                        ? `Today at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : startTime.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      }
                    </p>
                    {meeting.project && (
                      <p className="text-xs text-gray-500 mt-1">{meeting.project.name}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-3">No upcoming meetings</p>
              <Link
                href="/client/meetings"
                className="inline-flex items-center gap-2 text-sm text-trinity-red hover:text-trinity-maroon"
              >
                <FiPlus className="w-4 h-4" />
                Request Meeting
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

