"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Search,
  DollarSign,
  Calendar,
  Tag,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  category?: string;
  priority?: string;
  estimatedHours?: number | null;
  actualHours?: number | null;
  hoursDeducted?: number | null;
  hoursSource?: string | null;
  urgencyFee?: number;
  isOverage?: boolean;
  overageAmount?: number | null;
  requiresClientApproval?: boolean;
  clientApprovedAt?: Date | null;
  flaggedForReview?: boolean;
  attachments?: string[];
  createdAt: Date | string;
  updatedAt?: Date | string;
  completedAt?: Date | string | null;
}

interface ClientChangeRequestsSectionProps {
  requests: ChangeRequest[];
  projectId: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All", color: "gray" },
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "approved", label: "Approved", color: "blue" },
  { value: "in_progress", label: "In Progress", color: "cyan" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "rejected", label: "Rejected", color: "red" },
];

export function ClientChangeRequestsSection({ requests: initialRequests, projectId }: ClientChangeRequestsSectionProps) {
  const [requests, setRequests] = useState<ChangeRequest[]>(initialRequests);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const config: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      approved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      in_progress: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      completed: "bg-green-500/20 text-green-300 border-green-500/30",
      rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return config[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const getPriorityColor = (priority?: string) => {
    const config: Record<string, string> = {
      LOW: "text-gray-400",
      NORMAL: "text-blue-400",
      HIGH: "text-orange-400",
      URGENT: "text-red-400",
      EMERGENCY: "text-purple-400",
    };
    return config[priority || "NORMAL"] || "text-gray-400";
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const response = await fetch(`/api/client/change-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve");
      }

      const { changeRequest } = await response.json();
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? changeRequest : req))
      );
    } catch (error: any) {
      alert(error.message || "Failed to approve change request");
    } finally {
      setApprovingId(null);
    }
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Change Requests</h3>
          <p className="text-sm text-gray-400 mt-1">
            View and manage change requests for this project
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {filteredRequests.length} of {requests.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === status.value
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {status.label} ({statusCounts[status.value as keyof typeof statusCounts]})
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">
            {searchQuery || filterStatus !== "all"
              ? "No requests match your filters"
              : "No change requests yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
              >
                <RequestCard
                  request={request}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  onApprove={() => handleApprove(request.id)}
                  approving={approvingId === request.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  getStatusColor,
  getPriorityColor,
  onApprove,
  approving,
}: {
  request: ChangeRequest;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority?: string) => string;
  onApprove: () => void;
  approving: boolean;
}) {
  const description = request.description || "";
  const title = description.split("\n")[0] || "Change Request";
  const body = description.split("\n").slice(1).join("\n");

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h4 className="font-semibold text-white text-lg">{title}</h4>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                request.status
              )}`}
            >
              {request.status.replace("_", " ").toUpperCase()}
            </span>
            {request.priority && (
              <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                {request.priority}
              </span>
            )}
            {request.category && (
              <span className="px-2 py-1 rounded-md text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {request.category}
              </span>
            )}
          </div>
          {body && (
            <p className="text-sm text-gray-400 mb-3 whitespace-pre-wrap">{body}</p>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {request.estimatedHours !== null && request.estimatedHours !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Est:</span>
            <span className="text-white font-medium">{request.estimatedHours}h</span>
          </div>
        )}
        {request.actualHours !== null && request.actualHours !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Actual:</span>
            <span className="text-white font-medium">{request.actualHours}h</span>
          </div>
        )}
        {request.urgencyFee && request.urgencyFee > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Fee:</span>
            <span className="text-white font-medium">${(request.urgencyFee / 100).toFixed(2)}</span>
          </div>
        )}
        {request.isOverage && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 font-medium">Overage</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Created {new Date(request.createdAt).toLocaleDateString()}</span>
          {request.completedAt && (
            <>
              <span>•</span>
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className="text-green-400">
                Completed {new Date(request.completedAt).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {request.requiresClientApproval && 
           request.status === "pending" && 
           !request.clientApprovedAt && (
            <button
              onClick={onApprove}
              disabled={approving}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {approving ? "Approving..." : "Approve"}
            </button>
          )}
          {request.clientApprovedAt && (
            <span className="px-3 py-1.5 bg-green-500/20 text-green-300 text-xs rounded-lg border border-green-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Approved {new Date(request.clientApprovedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}





