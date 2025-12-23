"use client";

/**
 * Leads Table Client Component
 */

import { useState, useEffect, useRef } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { updateLeadStatus, deleteLead, updateLead, getPipeline } from "@/server/actions";
import { approveLeadAndCreateProject } from "@/server/actions/leads";
import { Plus, Trash2, Edit2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  createdAt: Date;
  organization: { name: string } | null;
};

interface LeadsTableClientProps {
  leads: Lead[];
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/20 border-blue-500/30",
  CONTACTED: "bg-yellow-500/20 border-yellow-500/30",
  QUALIFIED: "bg-green-500/20 border-green-500/30",
  PROPOSAL_SENT: "bg-purple-500/20 border-purple-500/30",
  CONVERTED: "bg-emerald-500/20 border-emerald-500/30",
  LOST: "bg-red-500/20 border-red-500/30",
};

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

export function LeadsTableClient({ leads: initialLeads }: LeadsTableClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [leads, setLeads] = useState(initialLeads);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [converting, setConverting] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const deletedLeadIdsRef = useRef<Set<string>>(new Set());
  const lastDeleteTimeRef = useRef<number>(0);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Only sync with initialLeads if we haven't recently deleted a lead
  // This prevents stale server props from overwriting our local state after deletion
  useEffect(() => {
    const timeSinceDelete = Date.now() - lastDeleteTimeRef.current;
    // If we deleted a lead recently (within 3 seconds), ignore prop updates
    if (timeSinceDelete < 3000) {
      return;
    }

    // Check if any of our deleted leads are in the new props (shouldn't happen)
    const hasDeletedLeads = initialLeads.some(lead => deletedLeadIdsRef.current.has(lead.id));
    if (hasDeletedLeads) {
      // Server still has deleted leads, filter them out
      setLeads(prev => prev.filter(l => !deletedLeadIdsRef.current.has(l.id)));
      return;
    }

    // Normal sync - only if counts differ significantly
    if (Math.abs(initialLeads.length - leads.length) > 1) {
      setLeads(initialLeads);
    }
  }, [initialLeads]);

  const isCEO = session?.user?.role === "CEO";
  const isCFO = session?.user?.role === "CFO";
  const canConvert = isCEO || isCFO;

  // Refresh leads data
  const refreshLeads = async (force = false) => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshing && !force) return;
    
    // Don't refresh if we just refreshed recently (within 1 second)
    const now = Date.now();
    if (!force && now - lastRefreshTime < 1000) return;

    setIsRefreshing(true);
    try {
      const result = await getPipeline();
      if (result.success) {
        setLeads(result.leads);
        setLastRefreshTime(Date.now());
      }
    } catch (error) {
      console.error("Failed to refresh leads:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh leads when page becomes visible (handles case when user navigates back after deletion)
  // But only if it's been a while since last refresh to avoid conflicts with delete operations
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only refresh if it's been more than 2 seconds since last refresh
        const now = Date.now();
        if (now - lastRefreshTime > 2000) {
          refreshLeads();
        }
      }
    };

    const handleFocus = () => {
      // Only refresh if it's been more than 2 seconds since last refresh
      const now = Date.now();
      if (now - lastRefreshTime > 2000) {
        refreshLeads();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [lastRefreshTime]);

  // Handle lead click with existence verification
  const handleLeadClick = async (lead: Lead) => {
    try {
      // Verify lead exists before navigating
      const result = await getPipeline();
      if (result.success) {
        const leadExists = result.leads.some((l: any) => l.id === lead.id);
        if (!leadExists) {
          // Lead was deleted, refresh and show message
          setLeads(result.leads);
          alert('This lead has been deleted. The list has been refreshed.');
          return;
        }
      }
      // Lead exists, navigate to it
      router.push(`/admin/pipeline/leads/${lead.id}`);
    } catch (error) {
      console.error('Error verifying lead:', error);
      // Refresh data in case lead was deleted
      await refreshLeads();
      alert('Unable to access this lead. The list has been refreshed.');
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdating(leadId);
    const result = await updateLeadStatus(leadId, newStatus as any);

    if (result.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      // Refresh after a short delay to ensure server has processed
      setTimeout(() => refreshLeads(true), 300);
    }
    setUpdating(null);
  };

  const handleDelete = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      return;
    }

    setDeleting(leadId);
    const result = await deleteLead(leadId);

    // If lead is already deleted (not found), treat it as success and remove from UI
    if (result.success || result.error === "Lead not found") {
      // Track this deletion
      deletedLeadIdsRef.current.add(leadId);
      lastDeleteTimeRef.current = Date.now();
      
      // Remove from local state immediately
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      // Remove from selected leads if it was selected
      setSelectedLeads((prev) => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
      
      // Wait a bit to ensure server has processed the deletion, then force refresh
      setTimeout(async () => {
        await refreshLeads(true); // Force refresh to bypass debounce
        // Clean up the deleted lead ID after refresh (keep it for a bit longer to prevent re-adding)
        setTimeout(() => {
          deletedLeadIdsRef.current.delete(leadId);
        }, 2000);
      }, 1000);
    } else {
      alert(result.error || "Failed to delete lead");
    }
    setDeleting(null);
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;

    const count = selectedLeads.size;
    if (!confirm(`Are you sure you want to delete ${count} lead${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);
    const leadIds = Array.from(selectedLeads);
    let successCount = 0;
    let failCount = 0;

    // Delete leads one by one
    for (const leadId of leadIds) {
      const result = await deleteLead(leadId);
      if (result.success || result.error === "Lead not found") {
        successCount++;
        deletedLeadIdsRef.current.add(leadId);
        lastDeleteTimeRef.current = Date.now();
      } else {
        failCount++;
      }
    }

    // Update local state
    setLeads((prev) => prev.filter((l) => !selectedLeads.has(l.id)));
    setSelectedLeads(new Set());

    // Refresh after a delay
    setTimeout(async () => {
      await refreshLeads(true);
      // Clean up deleted lead IDs
      setTimeout(() => {
        leadIds.forEach(id => deletedLeadIdsRef.current.delete(id));
      }, 2000);
    }, 1000);

    if (failCount > 0) {
      alert(`Deleted ${successCount} lead${successCount > 1 ? 's' : ''}. ${failCount} failed to delete.`);
    } else {
      alert(`Successfully deleted ${successCount} lead${successCount > 1 ? 's' : ''}.`);
    }

    setBulkDeleting(false);
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleEdit = async (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(lead.id);
    setEditForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || "",
      company: lead.company || "",
      status: lead.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;

    const result = await updateLead(editing, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || undefined,
      company: editForm.company || undefined,
      status: editForm.status as any,
    });

    if (result.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === editing ? { ...l, ...editForm } : l))
      );
      setEditing(null);
      setEditForm({});
      // Refresh after a short delay to ensure server has processed
      setTimeout(() => refreshLeads(true), 300);
    } else {
      alert(result.error || "Failed to update lead");
    }
  };

  const handleConvertLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to convert this lead to a project? This will create a new project.")) {
      return;
    }

    setConverting(leadId);
    setConvertError(null);

    try {
      const result = await approveLeadAndCreateProject(leadId);
      
      if (result.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: "CONVERTED" } : l))
        );
        // Redirect to the new project
        if (result.projectId) {
          router.push(`/admin/pipeline/projects/${result.projectId}`);
        } else {
          router.push(`/admin/pipeline/projects`);
        }
      } else {
        setConvertError(result.error || "Failed to convert lead");
        alert(result.error || "Failed to convert lead");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setConvertError(errorMessage);
      alert(errorMessage);
    } finally {
      setConverting(null);
    }
  };

  const columns: Column<Lead>[] = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={selectedLeads.size > 0 && selectedLeads.size === leads.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-white/20 bg-transparent text-seezee-red focus:ring-seezee-red focus:ring-offset-0 cursor-pointer"
        />
      ),
      render: (lead: Lead) => (
        <input
          type="checkbox"
          checked={selectedLeads.has(lead.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleSelectLead(lead.id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-white/20 bg-transparent text-seezee-red focus:ring-seezee-red focus:ring-offset-0 cursor-pointer"
        />
      ),
      sortable: false,
    },
    { key: "name", label: "Name", sortable: true },
    {
      key: "company",
      label: "Company",
      sortable: true,
      render: (lead) => lead.company || lead.organization?.name || "-",
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (lead) => lead.phone || "-" },
    {
      key: "status",
      label: "Status",
      render: (lead) => (
        <select
          value={lead.status}
          onChange={(e) => {
            e.stopPropagation();
            handleStatusChange(lead.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={updating === lead.id}
          className={`
            px-2 py-1 rounded-full text-xs font-medium border
            bg-transparent cursor-pointer
            ${statusColors[lead.status] || statusColors.NEW}
            ${updating === lead.id ? "opacity-50 cursor-wait" : ""}
            text-white
          `}
          style={{
            color: 'white',
          }}
        >
          {statusOptions.map((opt) => (
            <option 
              key={opt.value} 
              value={opt.value}
              style={{
                backgroundColor: '#1e293b',
                color: 'white',
              }}
            >
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (lead) => new Date(lead.createdAt).toLocaleDateString(),
    },
    ...(canConvert
      ? [
          {
            key: "actions",
            label: "Actions",
            render: (lead: Lead) => (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {lead.status !== "CONVERTED" && (
                  <button
                    onClick={(e) => handleConvertLead(lead.id, e)}
                    disabled={converting === lead.id}
                    className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                    title="Convert lead to project"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </button>
                )}
                <button
                  onClick={(e) => handleEdit(lead, e)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  title="Edit lead"
                >
                  <Edit2 className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={(e) => handleDelete(lead.id, e)}
                  disabled={deleting === lead.id}
                  className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Delete lead"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <DataTable
        data={leads}
        columns={columns}
        searchPlaceholder="Search leads by name, email, or company..."
        actions={
          <div className="flex items-center gap-2">
            {selectedLeads.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Delete ${selectedLeads.size} selected lead${selectedLeads.size > 1 ? 's' : ''}`}
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedLeads.size})
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        }
        onRowClick={(lead) => handleLeadClick(lead)}
      />

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-seezee-navy-medium rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Edit Lead</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-seezee-card-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-seezee-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-seezee-card-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-seezee-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-seezee-card-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-seezee-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={editForm.company || ""}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-seezee-card-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-seezee-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={editForm.status || "NEW"}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-seezee-card-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-seezee-red"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 rounded-lg bg-seezee-red hover:bg-seezee-red/90 text-white font-medium transition-all shadow-lg shadow-seezee-red/25"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setEditForm({});
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-seezee-card-bg hover:bg-white/10 text-white font-medium transition-all border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
