"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectFeed } from "@/components/shared/ProjectFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, Calendar, User, Plus, Trash, ListTodo, Folder, MessageSquare, Send, CreditCard, Github, Settings, FileText, Target, Download, Eye, Upload, Check, X, ExternalLink, Link2, AlertCircle, Globe } from "lucide-react";
import { toggleMilestone, createMilestone, deleteMilestone } from "@/server/actions/milestones";
import { markInvoiceAsPaid } from "@/server/actions/invoice";
import { updateProjectBudget } from "@/server/actions/projects";
import { calculateInvoiceSplits, formatCurrency, hasValidPricing, getPricingFromMetadata } from "@/lib/pricing";
import { CreateInvoiceButton } from "@/components/admin/CreateInvoiceButton";
import { AdminTaskManager } from "@/components/admin/AdminTaskManager";
import { RepositoryTab } from "@/app/(client)/client/components/RepositoryTab";
import { useUploadThing } from "@/lib/uploadthing";

interface ProjectDetailClientProps {
  project: any;
}

const statusColors: Record<string, string> = {
  LEAD: "bg-blue-500/20 border-blue-500/30",
  QUOTED: "bg-purple-500/20 border-purple-500/30",
  DEPOSIT_PAID: "bg-green-500/20 border-green-500/30",
  ACTIVE: "bg-teal-500/20 border-teal-500/30",
  REVIEW: "bg-orange-500/20 border-orange-500/30",
  COMPLETED: "bg-emerald-500/20 border-emerald-500/30",
  MAINTENANCE: "bg-cyan-500/20 border-cyan-500/30",
  CANCELLED: "bg-red-500/20 border-red-500/30",
};

const statusOptions = [
  { value: "LEAD", label: "Lead" },
  { value: "QUOTED", label: "Quoted" },
  { value: "DEPOSIT_PAID", label: "Deposit Paid" },
  { value: "ACTIVE", label: "Active" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(project.status);
  const [updating, setUpdating] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);
  
  // V2 Pricing state
  const [editingPricing, setEditingPricing] = useState(false);
  const [pricingBudget, setPricingBudget] = useState(project.budget ? Number(project.budget).toString() : "");
  const [depositPercent, setDepositPercent] = useState(50);
  const [finalPercent, setFinalPercent] = useState(50);
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  
  // Legacy budget state (will be removed)
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(project.budget ? Number(project.budget).toLocaleString() : "");
  const [savingBudget, setSavingBudget] = useState(false);
  
  // Repository linking state
  const [githubRepoUrl, setGithubRepoUrl] = useState(project.githubRepo || "");
  const [savingRepo, setSavingRepo] = useState(false);
  const [editingRepo, setEditingRepo] = useState(false);
  
  // Vercel linking state
  const [vercelUrl, setVercelUrl] = useState(project.vercelUrl || "");
  const [savingVercel, setSavingVercel] = useState(false);
  const [editingVercel, setEditingVercel] = useState(false);
  
  // Messages state
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Request management state
  const [updatingRequest, setUpdatingRequest] = useState<string | null>(null);
  
  // Invoice management state
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  
  // Delete project state
  const [deletingProject, setDeletingProject] = useState(false);
  
  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UploadThing hook
  const { startUpload } = useUploadThing("adminProjectFileUploader", {
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        // Create file record in database
        try {
          await fetch(`/api/admin/projects/${project.id}/files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: res[0].name,
              url: res[0].url,
              size: res[0].size,
              mimeType: res[0].type,
            }),
          });
          router.refresh();
        } catch (error) {
          console.error("Failed to save file record:", error);
        }
      }
      setUploadingFile(false);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
      setUploadingFile(false);
    },
    onUploadBegin: () => {
      setUploadingFile(true);
    },
  });

  // Update budget value when project updates
  useEffect(() => {
    if (!editingBudget) {
      setBudgetValue(project.budget ? Number(project.budget).toLocaleString() : "");
    }
  }, [project.budget, editingBudget]);
  
  // Transform milestones to match expected format
  const milestones = (project.milestones || []).map((m: any) => ({
    ...m,
    name: m.title || m.name,
  }));
  
  // Transform clientTasks to match ClientTaskList expected format
  const tasks = (project.clientTasks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status?.toLowerCase() || 'pending',
    dueDate: t.dueDate,
    completedAt: t.completedAt,
    requiresUpload: t.requiresUpload || false,
    submissionNotes: t.submissionNotes || null,
    createdAt: t.createdAt,
  }));

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/projects/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      await toggleMilestone(milestoneId);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle milestone:", error);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneTitle.trim()) return;
    
    setAddingMilestone(true);
    try {
      await createMilestone({
        projectId: project.id,
        title: newMilestoneTitle,
      });
      setNewMilestoneTitle("");
      router.refresh();
    } catch (error) {
      console.error("Failed to create milestone:", error);
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm("Delete this milestone?")) return;
    
    try {
      await deleteMilestone(milestoneId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete milestone:", error);
    }
  };

  const handleSaveBudget = async () => {
    const budgetNum = parseFloat(budgetValue.replace(/,/g, ""));
    if (isNaN(budgetNum) || budgetNum < 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    setSavingBudget(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/budget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: budgetNum }),
      });

      if (response.ok) {
        setEditingBudget(false);
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update budget");
      }
    } catch (error) {
      console.error("Failed to update budget:", error);
      alert("Failed to update budget");
    } finally {
      setSavingBudget(false);
    }
  };

  const handleCancelBudget = () => {
    setBudgetValue(project.budget ? Number(project.budget).toLocaleString() : "");
    setEditingBudget(false);
  };

  // V2 Pricing handlers
  const handleSavePricing = async () => {
    setPricingError(null);
    const budgetNum = parseFloat(pricingBudget.replace(/,/g, ""));
    
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setPricingError("Please enter a valid budget amount greater than 0");
      return;
    }

    if (depositPercent + finalPercent !== 100) {
      setPricingError("Deposit and final percentages must sum to 100%");
      return;
    }

    setSavingPricing(true);
    try {
      const result = await updateProjectBudget(
        project.id,
        budgetNum,
        depositPercent,
        finalPercent
      );

      if (result.success) {
        setEditingPricing(false);
        router.refresh();
      } else {
        setPricingError(result.error || "Failed to update pricing");
      }
    } catch (error) {
      console.error("Failed to update pricing:", error);
      setPricingError("Failed to update pricing");
    } finally {
      setSavingPricing(false);
    }
  };

  const handleCancelPricing = () => {
    setPricingBudget(project.budget ? Number(project.budget).toString() : "");
    const metadata = getPricingFromMetadata(project.metadata);
    setDepositPercent(metadata.depositPercent);
    setFinalPercent(metadata.finalPercent);
    setEditingPricing(false);
    setPricingError(null);
  };

  // Repository linking handler
  const handleSaveRepository = async () => {
    setSavingRepo(true);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/repository`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubRepo: githubRepoUrl.trim() || null }),
      });

      if (response.ok) {
        setEditingRepo(false);
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update repository");
      }
    } catch (error) {
      console.error("Failed to update repository:", error);
      alert("Failed to update repository");
    } finally {
      setSavingRepo(false);
    }
  };

  // Vercel linking handler
  const handleSaveVercel = async () => {
    setSavingVercel(true);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/vercel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vercelUrl: vercelUrl.trim() || null }),
      });

      if (response.ok) {
        setEditingVercel(false);
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update Vercel deployment");
      }
    } catch (error) {
      console.error("Failed to update Vercel deployment:", error);
      alert("Failed to update Vercel deployment");
    } finally {
      setSavingVercel(false);
    }
  };

  // Message sending handler
  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          content: messageContent.trim(),
        }),
      });

      if (response.ok) {
        setMessageContent("");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Request status update handler
  const handleUpdateRequestStatus = async (requestId: string, status: string) => {
    setUpdatingRequest(requestId);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update request");
      }
    } catch (error) {
      console.error("Failed to update request:", error);
      alert("Failed to update request");
    } finally {
      setUpdatingRequest(null);
    }
  };

  // Mark invoice as paid handler
  const handleMarkInvoicePaid = async (invoiceId: string) => {
    if (!confirm("Mark this invoice as paid?")) return;

    setMarkingPaid(invoiceId);
    try {
      const result = await markInvoiceAsPaid(invoiceId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to mark invoice as paid");
      }
    } catch (error) {
      console.error("Failed to mark invoice as paid:", error);
      alert("Failed to mark invoice as paid");
    } finally {
      setMarkingPaid(null);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      await startUpload(Array.from(files));
    } catch (error) {
      console.error("Upload error:", error);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete file handler
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Delete this file?")) return;

    try {
      const response = await fetch(`/api/admin/projects/${project.id}/files?fileId=${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete file");
    }
  };

  // Delete project handler
  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone and will delete all related data.`)) {
      return;
    }

    setDeletingProject(true);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Redirect to projects list after successful deletion
        router.push("/admin/pipeline/projects");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete project");
        setDeletingProject(false);
      }
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      alert(`Failed to delete project: ${error.message || "Unknown error"}`);
      setDeletingProject(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {project.organization?.name || "No organization"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Selector */}
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium border
              bg-slate-900 cursor-pointer
              ${statusColors[status] || statusColors.LEAD}
              ${updating ? "opacity-50 cursor-wait" : ""}
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

          {/* Delete Project Button */}
          <button
            onClick={handleDeleteProject}
            disabled={deletingProject}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium border
              bg-red-600/20 border-red-500/30 text-red-400
              hover:bg-red-600/30 hover:border-red-500/50
              transition-colors
              ${deletingProject ? "opacity-50 cursor-wait" : "cursor-pointer"}
              inline-flex items-center gap-2
            `}
            title="Delete Project"
          >
            <Trash className="w-4 h-4" />
            {deletingProject ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {project.lead && (
          <div className="glass p-4 rounded-lg">
            <div className="text-slate-400 text-xs mb-1">Lead Contact</div>
            <div className="font-medium text-white">{project.lead.name}</div>
            <div className="text-sm text-slate-400">{project.lead.email}</div>
          </div>
        )}

        {project.assignee && (
          <div className="glass p-4 rounded-lg">
            <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Assigned To
            </div>
            <div className="font-medium text-white">{project.assignee.name}</div>
            <div className="text-sm text-slate-400">{project.assignee.email}</div>
          </div>
        )}

        <div className="glass p-4 rounded-lg">
          <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Budget
          </div>
          <div className="text-xl font-bold text-green-400">
            {project.budget ? `$${Number(project.budget).toLocaleString()}` : "Not set"}
          </div>
          {!project.budget && (
            <button
              onClick={() => setEditingBudget(true)}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300"
            >
              Set budget
            </button>
          )}
        </div>

        <div className="glass p-4 rounded-lg">
          <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Created
          </div>
          <div className="font-medium text-white">
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-800/50 border border-white/10 flex-wrap">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Target className="w-4 h-4" /> Milestones
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Folder className="w-4 h-4" /> Files
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Requests
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <Send className="w-4 h-4" /> Messages
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Invoices
          </TabsTrigger>
          <TabsTrigger value="repository" className="flex items-center gap-2">
            <Github className="w-4 h-4" /> Repository
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            Activity Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="glass p-6 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
            {project.description && (
              <p className="text-slate-300 mb-4">{project.description}</p>
            )}
            
            {/* V2 PRICING CARD */}
            <div className="mt-6">
              <div className="glass p-6 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Project Pricing
                  </h4>
                  {hasValidPricing(project.budget) && !editingPricing && (
                    <button
                      onClick={() => {
                        setEditingPricing(true);
                        const metadata = getPricingFromMetadata(project.metadata);
                        setDepositPercent(metadata.depositPercent);
                        setFinalPercent(metadata.finalPercent);
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Edit Pricing
                    </button>
                  )}
                </div>

                {!hasValidPricing(project.budget) && !editingPricing ? (
                  // Show warning when pricing not set
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-400 mb-1">
                          Pricing Not Set
                        </p>
                        <p className="text-sm text-yellow-400/80">
                          Set the project budget to enable invoice creation and manage payments.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingPricing(true)}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Set Project Pricing
                    </button>
                  </div>
                ) : editingPricing ? (
                  // Editing mode
                  <div className="space-y-4">
                    {pricingError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">{pricingError}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block font-medium">
                        Total Project Price ($)
                      </label>
                      <input
                        type="number"
                        value={pricingBudget}
                        onChange={(e) => setPricingBudget(e.target.value)}
                        placeholder="5000"
                        min="0"
                        step="100"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-300 mb-2 block font-medium">
                          Deposit (%)
                        </label>
                        <input
                          type="number"
                          value={depositPercent}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setDepositPercent(val);
                            setFinalPercent(100 - val);
                          }}
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-300 mb-2 block font-medium">
                          Final Payment (%)
                        </label>
                        <input
                          type="number"
                          value={finalPercent}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setFinalPercent(val);
                            setDepositPercent(100 - val);
                          }}
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Preview calculations */}
                    {pricingBudget && parseFloat(pricingBudget) > 0 && (
                      <div className="p-4 bg-slate-800/30 rounded-lg border border-white/5">
                        <p className="text-xs text-slate-400 mb-3 font-medium">PRICING BREAKDOWN</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Deposit ({depositPercent}%):</span>
                            <span className="text-white font-medium">
                              {formatCurrency((parseFloat(pricingBudget) * depositPercent) / 100)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Final ({finalPercent}%):</span>
                            <span className="text-white font-medium">
                              {formatCurrency((parseFloat(pricingBudget) * finalPercent) / 100)}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-white/10 flex justify-between">
                            <span className="text-slate-300 font-medium">Total:</span>
                            <span className="text-green-400 font-bold">
                              {formatCurrency(parseFloat(pricingBudget))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSavePricing}
                        disabled={savingPricing || !pricingBudget}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                      >
                        {savingPricing ? "Saving..." : "Save Pricing"}
                      </button>
                      <button
                        onClick={handleCancelPricing}
                        disabled={savingPricing}
                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode - show current pricing
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-800/30 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">TOTAL PROJECT</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(Number(project.budget))}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-xs text-blue-400 mb-1">DEPOSIT ({depositPercent}%)</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {formatCurrency((Number(project.budget) * depositPercent) / 100)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-xs text-green-400 mb-1">FINAL ({finalPercent}%)</p>
                        <p className="text-2xl font-bold text-green-400">
                          {formatCurrency((Number(project.budget) * finalPercent) / 100)}
                        </p>
                      </div>
                    </div>

                    {/* Invoice Creation Buttons */}
                    <div className="pt-4 border-t border-white/10">
                      <h5 className="text-sm font-semibold text-white mb-3">Create Invoices</h5>
                      <div className="flex flex-wrap gap-3">
                        <CreateInvoiceButton
                          projectId={project.id}
                          projectName={project.name}
                          organizationId={project.organizationId}
                          type="deposit"
                          amount={(Number(project.budget) * depositPercent) / 100}
                          onSuccess={() => router.refresh()}
                        />
                        {(project.status === "DEPOSIT_PAID" || project.status === "ACTIVE" || project.status === "COMPLETED") && (
                          <CreateInvoiceButton
                            projectId={project.id}
                            projectName={project.name}
                            organizationId={project.organizationId}
                            type="final"
                            amount={(Number(project.budget) * finalPercent) / 100}
                            onSuccess={() => router.refresh()}
                          />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Final invoice available after deposit is paid
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* END V2 PRICING CARD */}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <div className="space-y-4">
            {project.invoices && project.invoices.length > 0 ? (
              project.invoices.map((invoice: any) => (
                <div key={invoice.id} className="glass p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{invoice.title || "Invoice"}</div>
                    <div className="text-sm text-slate-400">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        ${(Number(invoice.total) || 0).toLocaleString()}
                      </div>
                      <div className={`text-sm ${
                        invoice.status === "PAID" ? "text-green-400" : "text-yellow-400"
                      }`}>
                        {invoice.status}
                      </div>
                    </div>
                    {invoice.status !== "PAID" && (
                      <button
                        onClick={() => handleMarkInvoicePaid(invoice.id)}
                        disabled={markingPaid === invoice.id}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {markingPaid === invoice.id ? "..." : "Mark Paid"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                No invoices yet. Create one above.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <AdminTaskManager 
            projectId={project.id} 
            initialTasks={tasks.map((t: any) => ({
              ...t,
              type: t.type || 'general',
            }))}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Project Files</h3>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="admin-file-upload"
                />
                <label
                  htmlFor="admin-file-upload"
                  className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer ${
                    uploadingFile ? "opacity-50 cursor-wait" : ""
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  {uploadingFile ? "Uploading..." : "Upload File"}
                </label>
              </div>
            </div>
            {project.files && project.files.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.files.map((file: any) => (
                  <div key={file.id} className="glass p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Folder className="w-5 h-5 text-blue-400" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{file.name || file.originalName}</div>
                        <div className="text-xs text-slate-400">
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"
                      >
                        <Trash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                No files uploaded yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="space-y-4">
            {project.changeRequests && project.changeRequests.length > 0 ? (
              project.changeRequests.map((request: any) => (
                <div key={request.id} className="glass p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-white mb-1">
                        {request.description?.substring(0, 100) || 'Change Request'}
                      </div>
                      {request.description && request.description.length > 100 && (
                        <p className="text-sm text-slate-400">{request.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      request.status === 'approved' || request.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                      request.status === 'rejected' || request.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      request.status === 'completed' || request.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    {(request.status === 'pending' || request.status === 'PENDING') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateRequestStatus(request.id, 'approved')}
                          disabled={updatingRequest === request.id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          {updatingRequest === request.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}
                          disabled={updatingRequest === request.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          {updatingRequest === request.id ? '...' : 'Reject'}
                        </button>
                      </div>
                    )}
                    {(request.status === 'approved' || request.status === 'APPROVED') && (
                      <button
                        onClick={() => handleUpdateRequestStatus(request.id, 'completed')}
                        disabled={updatingRequest === request.id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        {updatingRequest === request.id ? '...' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                No change requests yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <div className="space-y-4">
            {/* Admin Message Composer */}
            <div className="glass p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3">Send Message to Client</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageContent.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendingMessage ? "..." : "Send"}
                </button>
              </div>
            </div>

            {/* Message Threads */}
            {project.messageThreads && project.messageThreads.length > 0 ? (
              project.messageThreads.map((thread: any) => (
                <div key={thread.id} className="glass p-4 rounded-lg">
                  <div className="font-medium text-white mb-2">
                    {thread.subject || 'Message Thread'}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {thread.messages && thread.messages.map((message: any) => (
                      <div key={message.id} className={`p-3 rounded-lg ${
                        message.role === 'client' 
                          ? 'bg-slate-800/50 ml-0 mr-8' 
                          : 'bg-blue-600/20 ml-8 mr-0'
                      }`}>
                        <div className="text-sm text-slate-300 mb-1">{message.content}</div>
                        <div className="text-xs text-slate-500">
                          {message.role === 'client' ? 'Client' : 'Admin'} • {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                No messages yet. Send the first message above.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="repository" className="mt-6">
          <div className="space-y-4">
            {/* Admin Repository Linking Form */}
            <div className="glass p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link GitHub Repository
              </h4>
              {!editingRepo && project.githubRepo ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-white/60" />
                    <a 
                      href={project.githubRepo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {project.githubRepo}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <button
                    onClick={() => {
                      setGithubRepoUrl(project.githubRepo || "");
                      setEditingRepo(true);
                    }}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveRepository}
                    disabled={savingRepo}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {savingRepo ? "..." : "Save"}
                  </button>
                  {editingRepo && (
                    <button
                      onClick={() => {
                        setGithubRepoUrl(project.githubRepo || "");
                        setEditingRepo(false);
                      }}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Link a GitHub repository to display commits, branches, and pull requests.
              </p>
            </div>

            {/* Admin Vercel Deployment Linking Form */}
            <div className="glass p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link Vercel Deployment
              </h4>
              {!editingVercel && project.vercelUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-white/60" />
                    <a 
                      href={project.vercelUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {project.vercelUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <button
                    onClick={() => {
                      setVercelUrl(project.vercelUrl || "");
                      setEditingVercel(true);
                    }}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vercelUrl}
                    onChange={(e) => setVercelUrl(e.target.value)}
                    placeholder="https://project-name.vercel.app"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveVercel}
                    disabled={savingVercel}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {savingVercel ? "..." : "Save"}
                  </button>
                  {editingVercel && (
                    <button
                      onClick={() => {
                        setVercelUrl(project.vercelUrl || "");
                        setEditingVercel(false);
                      }}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Link a Vercel deployment URL to track deployments and previews.
              </p>
            </div>

            {/* Repository Info Display */}
            {project.githubRepo ? (
              <RepositoryTab projectId={project.id} />
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                <Github className="w-12 h-12 mx-auto mb-4 text-white/20" />
                <p>No repository linked yet.</p>
                <p className="text-sm text-slate-500 mt-2">Use the form above to link a GitHub repository.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ProjectFeed events={project.feedEvents || []} />
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <div className="space-y-4">
            {/* Add Milestone Form */}
            <div className="glass p-4 rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="New milestone title..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleAddMilestone();
                  }}
                />
                <button
                  onClick={handleAddMilestone}
                  disabled={!newMilestoneTitle.trim() || addingMilestone}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Milestones List */}
            {milestones && milestones.length > 0 ? (
              milestones.map((milestone: any) => (
                <div key={milestone.id} className="glass p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={() => handleToggleMilestone(milestone.id)}
                      className="mt-1 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className={`font-medium text-white ${
                        milestone.completed ? "line-through opacity-60" : ""
                      }`}>
                        {milestone.title || milestone.name}
                      </div>
                      {milestone.description && (
                        <div className="text-sm text-slate-400 mt-1">
                          {milestone.description}
                        </div>
                      )}
                      {milestone.dueDate && (
                        <div className="text-xs text-slate-500 mt-1">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete milestone"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                No milestones yet. Add one above to track progress.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
