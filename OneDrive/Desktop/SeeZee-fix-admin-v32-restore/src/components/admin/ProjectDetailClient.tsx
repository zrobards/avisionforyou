"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectFeed } from "@/components/shared/ProjectFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, Calendar, User, Plus, Trash, ListTodo, Folder, MessageSquare, Send, CreditCard, Github, Settings, FileText, Target, Download, Eye, Upload } from "lucide-react";
import { toggleMilestone, createMilestone, deleteMilestone } from "@/server/actions/milestones";
import { CreateInvoiceButton } from "@/components/admin/CreateInvoiceButton";
import { ClientTaskList } from "@/app/(client)/client/components/ClientTaskList";
import { RepositoryTab } from "@/app/(client)/client/components/RepositoryTab";

interface ProjectDetailClientProps {
  project: any;
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  LEAD: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  ACTIVE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  REVIEW: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusOptions = [
  { value: "PLANNING", label: "Planning" },
  { value: "LEAD", label: "Lead" },
  { value: "PAID", label: "Paid" },
  { value: "ACTIVE", label: "Active" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(project.status);
  const [updating, setUpdating] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(project.budget ? Number(project.budget).toLocaleString() : "");
  const [savingBudget, setSavingBudget] = useState(false);

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
          `}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
            
            <div className="mt-6 space-y-4">
              {(() => {
                // Extract questionnaire data (same logic as client dashboard)
                const questionnaireData = project.questionnaire?.data as any;
                const totals = questionnaireData?.totals;
                
                // Try multiple sources for pricing, in priority order:
                // 1. questionnaire.data.totals.finalTotal or totals.subtotal
                // 2. questionnaire.estimate (convert from cents to dollars)
                // 3. project.budget
                const totalEstimate = totals?.finalTotal || totals?.subtotal
                  ? Number(totals.finalTotal || totals.subtotal)
                  : project.questionnaire?.estimate 
                    ? Number(project.questionnaire.estimate) / 100 // Convert from cents to dollars
                    : project.budget 
                      ? Number(project.budget) 
                      : null;

                if (totalEstimate) {
                  const depositAmount = totalEstimate / 2; // 50% deposit
                  const finalAmount = totalEstimate / 2; // 50% final

                  return (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Create Invoice</h4>
                        <div className="flex flex-wrap gap-3">
                          <CreateInvoiceButton
                            projectId={project.id}
                            projectName={project.name}
                            organizationId={project.organizationId}
                            type="deposit"
                            amount={depositAmount}
                            onSuccess={() => {
                              router.refresh();
                            }}
                          />
                          {project.status === "PAID" || project.status === "ACTIVE" || project.status === "IN_PROGRESS" ? (
                            <CreateInvoiceButton
                              projectId={project.id}
                              projectName={project.name}
                              organizationId={project.organizationId}
                              type="final"
                              amount={finalAmount}
                              onSuccess={() => {
                                router.refresh();
                              }}
                            />
                          ) : null}
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-400 mt-4 space-y-1">
                        {(totals?.finalTotal || totals?.subtotal || project.questionnaire?.estimate) && (
                          <p className="text-xs text-slate-500 mb-2">
                            Pricing from questionnaire: ${(totalEstimate).toLocaleString()}
                          </p>
                        )}
                        <p>• Deposit invoice: 50% of project total (${depositAmount.toLocaleString()})</p>
                        <p>• Final invoice: 50% remaining balance (${finalAmount.toLocaleString()})</p>
                        <p className="text-xs text-slate-500 mt-2">Final invoice available after deposit is paid</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-400 mb-4">
                          No pricing information available. Please set project budget to calculate invoice amounts.
                        </p>
                        
                        {!editingBudget ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="text-sm text-slate-300 mb-2 block">Project Budget</label>
                              <div className="text-lg font-semibold text-white">
                                {project.budget ? `$${Number(project.budget).toLocaleString()}` : "Not set"}
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingBudget(true)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              {project.budget ? "Edit Budget" : "Set Budget"}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-slate-300 mb-2 block">Project Budget ($)</label>
                              <input
                                type="text"
                                value={budgetValue}
                                onChange={(e) => {
                                  // Allow numbers and commas
                                  const value = e.target.value.replace(/[^0-9,]/g, "");
                                  setBudgetValue(value);
                                }}
                                placeholder="Enter budget amount"
                                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveBudget}
                                disabled={savingBudget || !budgetValue}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                {savingBudget ? "Saving..." : "Save Budget"}
                              </button>
                              <button
                                onClick={handleCancelBudget}
                                disabled={savingBudget}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {project.budget && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-sm text-blue-400">
                            Once the budget is set, you can create deposit and final invoices based on this amount.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
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
          {tasks.length > 0 ? (
            <ClientTaskList tasks={tasks} />
          ) : (
            <div className="glass p-8 rounded-lg text-center text-slate-400">
              No tasks yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Project Files</h3>
              <button
                onClick={() => {
                  // File upload functionality can be added here
                  alert("File upload functionality - to be implemented");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
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
                      request.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                      request.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(request.createdAt).toLocaleDateString()}
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
            {project.messageThreads && project.messageThreads.length > 0 ? (
              project.messageThreads.map((thread: any) => (
                <div key={thread.id} className="glass p-4 rounded-lg">
                  <div className="font-medium text-white mb-2">
                    {thread.subject || 'Message Thread'}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {thread.messages && thread.messages.map((message: any) => (
                      <div key={message.id} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="text-sm text-slate-300 mb-1">{message.content}</div>
                        <div className="text-xs text-slate-500">
                          {message.role} • {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                No messages yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="repository" className="mt-6">
          {project.githubRepo ? (
            <RepositoryTab githubRepo={project.githubRepo} />
          ) : (
            <div className="glass p-8 rounded-lg text-center text-slate-400">
              <Github className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p>No repository linked yet.</p>
              <p className="text-sm text-slate-500 mt-2">Link a GitHub repository in project settings.</p>
            </div>
          )}
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
