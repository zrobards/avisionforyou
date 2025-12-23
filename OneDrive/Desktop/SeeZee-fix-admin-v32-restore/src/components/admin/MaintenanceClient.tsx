"use client";

/**
 * Maintenance Client Component
 */

import { useState, useEffect } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Wrench, Clock, CheckCircle, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { updateMaintenanceStatus } from "@/server/actions";
import { useRouter } from "next/navigation";

type MaintenanceSchedule = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduledFor: Date;
  completedAt: Date | null;
  assignedToId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
    organization: {
      name: string;
    };
  };
};

type Client = {
  id: string;
  name: string;
  organization: {
    name: string;
    email: string | null;
  };
  subscriptions: {
    id: string;
    priceId: string;
    currentPeriodEnd: Date | null;
  }[];
  maintenancePlanRel?: {
    id: string;
    tier: string;
    monthlyPrice: number | string;
    status: string;
    supportHoursIncluded: number;
    supportHoursUsed: number;
    changeRequestsIncluded: number;
    changeRequestsUsed: number;
    createdAt: Date;
  } | null;
  maintenanceSchedules?: {
    id: string;
    title: string;
    status: string;
    scheduledFor: Date;
  }[];
};

type MaintenancePlan = {
  id: string;
  tier: string;
  monthlyPrice: number | string;
  status: string;
  supportHoursIncluded: number;
  supportHoursUsed: number;
  changeRequestsIncluded: number;
  changeRequestsUsed: number;
  createdAt: Date;
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    organization: {
      id: string;
      name: string;
      email: string | null;
    };
  };
};

type ChangeRequest = {
  id: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  estimatedHours: number | null;
  urgencyFee: number;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
    status: string;
    organization: {
      id: string;
      name: string;
    };
  };
  subscription: {
    id: string;
    planName: string | null;
    status: string;
  };
};

interface MaintenanceClientProps {
  initialSchedules: MaintenanceSchedule[];
  clients: Client[];
  stats: {
    activePlans: number;
    pending: number;
    resolvedThisWeek: number;
    avgResponseTime: string;
  };
  plans?: MaintenancePlan[];
  initialChangeRequests?: ChangeRequest[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const changeRequestStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const priorityColors: Record<string, string> = {
  LOW: "text-slate-400",
  NORMAL: "text-blue-400",
  HIGH: "text-yellow-400",
  URGENT: "text-orange-400",
  EMERGENCY: "text-red-400",
};

export function MaintenanceClient({ initialSchedules, clients, stats, plans = [], initialChangeRequests = [] }: MaintenanceClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"requests" | "change-requests" | "plans">("change-requests");
  const [schedules, setSchedules] = useState(initialSchedules);
  const [changeRequests, setChangeRequests] = useState(initialChangeRequests);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (scheduleId: string, newStatus: string) => {
    setUpdating(scheduleId);
    const result = await updateMaintenanceStatus(scheduleId, newStatus as any);

    if (result.success) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, status: newStatus } : s))
      );
      router.refresh();
    }
    setUpdating(null);
  };

  const handleChangeRequestStatusUpdate = async (changeRequestId: string, newStatus: string) => {
    setUpdating(changeRequestId);
    try {
      const response = await fetch(`/api/admin/requests/${changeRequestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setChangeRequests((prev) =>
          prev.map((cr) => (cr.id === changeRequestId ? { ...cr, status: newStatus } : cr))
        );
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update change request status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const changeRequestColumns: Column<ChangeRequest>[] = [
    {
      key: "project",
      label: "Client",
      sortable: true,
      render: (cr) => (
        <div>
          <div className="font-medium text-white">{cr.project.name}</div>
          <div className="text-xs text-slate-400">{cr.project.organization.name}</div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Request",
      sortable: true,
      render: (cr) => {
        // Extract title from description (first line) and show rest as preview
        const lines = cr.description.split('\n');
        const title = lines[0] || cr.description.substring(0, 50);
        const preview = lines.slice(1).join(' ').substring(0, 100) || cr.description.substring(50, 150);
        return (
          <div>
            <div className="font-medium text-white">{title}</div>
            {preview && (
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {preview}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      render: (cr) => (
        <span className="text-xs text-slate-300 capitalize">
          {cr.category.toLowerCase().replace('_', ' ')}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (cr) => (
        <span className={`text-xs font-medium ${priorityColors[cr.priority] || priorityColors.NORMAL}`}>
          {cr.priority}
        </span>
      ),
    },
    {
      key: "estimatedHours",
      label: "Hours",
      render: (cr) => (
        <span className="text-sm text-slate-300">
          {cr.estimatedHours ? `${cr.estimatedHours}h` : '—'}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (cr) => (
        <select
          value={cr.status}
          onChange={(e) => {
            e.stopPropagation();
            handleChangeRequestStatusUpdate(cr.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={updating === cr.id}
          className={`
            px-2 py-1 rounded-full text-xs font-medium border
            bg-transparent cursor-pointer
            ${changeRequestStatusColors[cr.status] || changeRequestStatusColors.pending}
            ${updating === cr.id ? "opacity-50 cursor-wait" : ""}
          `}
          style={{
            zIndex: 10,
            position: 'relative',
          }}
        >
          <option value="pending" style={{ backgroundColor: '#1e293b', color: '#fbbf24' }}>Pending</option>
          <option value="approved" style={{ backgroundColor: '#1e293b', color: '#60a5fa' }}>Approved</option>
          <option value="in_progress" style={{ backgroundColor: '#1e293b', color: '#a78bfa' }}>In Progress</option>
          <option value="completed" style={{ backgroundColor: '#1e293b', color: '#34d399' }}>Completed</option>
          <option value="rejected" style={{ backgroundColor: '#1e293b', color: '#f87171' }}>Rejected</option>
        </select>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (cr) => (
        <div className="text-sm text-slate-300">
          {new Date(cr.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const columns: Column<MaintenanceSchedule>[] = [
    {
      key: "project",
      label: "Client",
      sortable: true,
      render: (schedule) => (
        <div className="font-medium text-white">{schedule.project.name}</div>
      ),
    },
    {
      key: "title",
      label: "Issue",
      sortable: true,
      render: (schedule) => (
        <div>
          <div className="font-medium text-white">{schedule.title}</div>
          {schedule.description && (
            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {schedule.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (schedule) => (
        <select
          value={schedule.status}
          onChange={(e) => {
            e.stopPropagation();
            handleStatusChange(schedule.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={updating === schedule.id}
          className={`
            px-2 py-1 rounded-full text-xs font-medium border
            bg-transparent cursor-pointer
            ${statusColors[schedule.status] || statusColors.PENDING}
            ${updating === schedule.id ? "opacity-50 cursor-wait" : ""}
          `}
          style={{
            zIndex: 10,
            position: 'relative',
          }}
        >
          <option value="PENDING" style={{ backgroundColor: '#1e293b', color: '#fbbf24' }}>Pending</option>
          <option value="IN_PROGRESS" style={{ backgroundColor: '#1e293b', color: '#60a5fa' }}>In Progress</option>
          <option value="COMPLETED" style={{ backgroundColor: '#1e293b', color: '#34d399' }}>Completed</option>
          <option value="CANCELLED" style={{ backgroundColor: '#1e293b', color: '#f87171' }}>Cancelled</option>
        </select>
      ),
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (schedule) => (
        <span className="text-sm text-slate-300">
          {schedule.assignedToId ? (
            <span className="text-blue-400">Assigned</span>
          ) : (
            <span className="text-slate-500">Unassigned</span>
          )}
        </span>
      ),
    },
    {
      key: "scheduledFor",
      label: "Scheduled",
      render: (schedule) => (
        <div className="text-sm text-slate-300">
          {new Date(schedule.scheduledFor).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Maintenance</h1>
        <p className="admin-page-subtitle">
          Manage maintenance requests and client plans
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Plans"
          value={stats.activePlans}
          icon={<Wrench className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Requests"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Resolved This Week"
          value={stats.resolvedThisWeek}
          icon={<CheckCircle className="w-5 h-5" />}
          trend={{ value: 20, label: "from last week" }}
        />
        <StatCard
          label="Avg Response Time"
          value={stats.avgResponseTime}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: -15, label: "improvement" }}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          onClick={() => setTab("change-requests")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            tab === "change-requests"
              ? "border-seezee-red text-seezee-red"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Change Requests
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            tab === "requests"
              ? "border-seezee-red text-seezee-red"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Maintenance Schedules
        </button>
        <button
          onClick={() => setTab("plans")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            tab === "plans"
              ? "border-seezee-red text-seezee-red"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Plans
        </button>
      </div>

      {/* Content */}
      {tab === "change-requests" ? (
        <DataTable
          data={changeRequests}
          columns={changeRequestColumns}
          searchPlaceholder="Search change requests..."
          onRowClick={(cr) => router.push(`/admin/projects/${cr.project.id}`)}
        />
      ) : tab === "requests" ? (
        <DataTable
          data={schedules}
          columns={columns}
          searchPlaceholder="Search requests..."
          onRowClick={(schedule) => router.push(`/admin/maintenance/${schedule.id}`)}
        />
      ) : (
        <div className="space-y-4">
          {/* Maintenance Plans from Form Submissions */}
          {plans.length > 0 && (
            <div className="seezee-glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Maintenance Plans</h3>
              <p className="text-slate-400 mb-6">
                {plans.length} maintenance plan{plans.length !== 1 ? 's' : ''} from client submissions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-seezee-card-bg border border-white/10 rounded-xl p-4 text-left cursor-pointer hover:border-white/20 transition-all"
                    onClick={() => router.push(`/admin/pipeline/projects/${plan.project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{plan.project.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        plan.status === 'ACTIVE' 
                          ? 'bg-seezee-green/20 text-seezee-green border-seezee-green/30'
                          : plan.status === 'PENDING'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{plan.project.organization.name}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Tier:</span>
                        <span className="text-white font-medium">{plan.tier}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Monthly:</span>
                        <span className="text-seezee-green font-medium">
                          ${(Number(plan.monthlyPrice) / 100).toFixed(0)}/mo
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Hours:</span>
                        <span className="text-slate-300">
                          {plan.supportHoursUsed}/{plan.supportHoursIncluded} used
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Created:</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Clients with Subscriptions */}
          <div className="seezee-glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Client Subscriptions</h3>
            <p className="text-slate-400 mb-6">
              {clients.length} clients with maintenance subscriptions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-seezee-card-bg border border-white/10 rounded-xl p-4 text-left cursor-pointer hover:border-white/20 transition-all"
                  onClick={() => router.push(`/admin/pipeline/projects/${client.id}`)}
                >
                  <h4 className="font-semibold text-white mb-2">{client.name || client.organization.name}</h4>
                  <div className="space-y-1">
                    {client.maintenancePlanRel && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-seezee-red/20 text-seezee-red border border-seezee-red/30">
                          {client.maintenancePlanRel.tier}
                        </span>
                        <span className="text-xs text-seezee-green">
                          ${(Number(client.maintenancePlanRel.monthlyPrice) / 100).toFixed(0)}/mo
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-slate-400">
                      {client.maintenanceSchedules?.length || 0} scheduled tasks
                    </p>
                    {client.subscriptions && client.subscriptions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-seezee-green/20 text-seezee-green border border-seezee-green/30">
                          Active Subscription
                        </span>
                        {client.subscriptions[0].currentPeriodEnd && (
                          <span className="text-xs text-slate-500">
                            Renews {new Date(client.subscriptions[0].currentPeriodEnd).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {clients.length === 0 && plans.length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-500">
                  No maintenance clients yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
