"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  DollarSign,
  FileText,
  Calendar,
  Tag,
  TrendingUp,
  Save,
  X,
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

interface AdminChangeRequestsSectionProps {
  requests: ChangeRequest[];
  projectId: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "approved", label: "Approved", color: "blue" },
  { value: "in_progress", label: "In Progress", color: "cyan" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "rejected", label: "Rejected", color: "red" },
];

const CATEGORY_OPTIONS = [
  "CONTENT",
  "BUG",
  "FEATURE",
  "DESIGN",
  "SEO",
  "SECURITY",
  "OTHER",
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "gray" },
  { value: "NORMAL", label: "Normal", color: "blue" },
  { value: "HIGH", label: "High", color: "orange" },
  { value: "URGENT", label: "Urgent", color: "red" },
  { value: "EMERGENCY", label: "Emergency", color: "purple" },
];

export function AdminChangeRequestsSection({ requests: initialRequests, projectId }: AdminChangeRequestsSectionProps) {
  const [requests, setRequests] = useState<ChangeRequest[]>(initialRequests);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ChangeRequest>>({});
  const [saving, setSaving] = useState(false);

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

  const handleEdit = (request: ChangeRequest) => {
    setEditingId(request.id);
    setEditData({
      status: request.status,
      category: request.category,
      priority: request.priority,
      estimatedHours: request.estimatedHours,
      actualHours: request.actualHours,
      hoursDeducted: request.hoursDeducted,
      hoursSource: request.hoursSource,
      urgencyFee: request.urgencyFee,
      isOverage: request.isOverage,
      overageAmount: request.overageAmount,
      flaggedForReview: request.flaggedForReview,
      description: request.description,
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/change-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update");
      }

      const { changeRequest } = await response.json();
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? changeRequest : req))
      );
      setEditingId(null);
      setEditData({});
    } catch (error: any) {
      alert(error.message || "Failed to update change request");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/change-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      const { changeRequest } = await response.json();
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? changeRequest : req))
      );
    } catch (error: any) {
      alert(error.message || "Failed to update status");
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
            Manage and configure change requests for this project
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
          {[
            { value: "all", label: "All" },
            ...STATUS_OPTIONS,
          ].map((status) => (
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
                {editingId === request.id ? (
                  <EditForm
                    request={request}
                    editData={editData}
                    setEditData={setEditData}
                    onSave={() => handleSave(request.id)}
                    onCancel={() => {
                      setEditingId(null);
                      setEditData({});
                    }}
                    saving={saving}
                  />
                ) : (
                  <RequestCard
                    request={request}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    onEdit={() => handleEdit(request)}
                    onStatusChange={(status) => handleStatusChange(request.id, status)}
                  />
                )}
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
  onEdit,
  onStatusChange,
}: {
  request: ChangeRequest;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority?: string) => string;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
}) {
  const description = request.description || "";
  const title = description.split("\n")[0] || "Change Request";
  const body = description.split("\n").slice(1).join("\n");

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
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
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 rounded-lg transition-colors"
            title="Edit Request"
          >
            <Edit className="w-4 h-4" />
          </button>
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
          {request.status !== "completed" && request.status !== "rejected" && (
            <select
              value={request.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          {request.status === "in_progress" && (
            <button
              onClick={() => onStatusChange("completed")}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditForm({
  request,
  editData,
  setEditData,
  onSave,
  onCancel,
  saving,
}: {
  request: ChangeRequest;
  editData: Partial<ChangeRequest>;
  setEditData: (data: Partial<ChangeRequest>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
          <select
            value={editData.status || request.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
          <select
            value={editData.category || request.category || ""}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
          <select
            value={editData.priority || request.priority || "NORMAL"}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Estimated Hours</label>
          <input
            type="number"
            step="0.5"
            value={editData.estimatedHours ?? request.estimatedHours ?? ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                estimatedHours: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Actual Hours</label>
          <input
            type="number"
            step="0.5"
            value={editData.actualHours ?? request.actualHours ?? ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                actualHours: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Hours Source</label>
          <select
            value={editData.hoursSource || request.hoursSource || ""}
            onChange={(e) => setEditData({ ...editData, hoursSource: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">Select source</option>
            <option value="monthly">Monthly</option>
            <option value="rollover">Rollover</option>
            <option value="pack">Hour Pack</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Urgency Fee (cents)</label>
          <input
            type="number"
            value={editData.urgencyFee ?? request.urgencyFee ?? 0}
            onChange={(e) =>
              setEditData({ ...editData, urgencyFee: Number(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isOverage"
            checked={editData.isOverage ?? request.isOverage ?? false}
            onChange={(e) => setEditData({ ...editData, isOverage: e.target.checked })}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
          />
          <label htmlFor="isOverage" className="text-sm text-gray-400">
            Is Overage
          </label>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="flaggedForReview"
            checked={editData.flaggedForReview ?? request.flaggedForReview ?? false}
            onChange={(e) => setEditData({ ...editData, flaggedForReview: e.target.checked })}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
          />
          <label htmlFor="flaggedForReview" className="text-sm text-gray-400">
            Flagged for Review
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
        <textarea
          value={editData.description ?? request.description ?? ""}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}






