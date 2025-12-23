"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle2, Clock, DollarSign, User, FileText, ListTodo, History as TimelineIcon, Folder, Download, Eye, Upload, MessageSquare, Send, CreditCard, Plus, Target, Settings, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientTaskList } from "./ClientTaskList";
import { RepositoryTab } from "./RepositoryTab";
import { SettingsTab } from "./SettingsTab";
import { ClientChangeRequestsSection } from "./ClientChangeRequestsSection";

// Invoice Pay Button Component
function InvoicePayButton({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[Invoice Payment] Error response:", {
          status: response.status,
          error: data.error,
          invoiceId,
        });
        
        // Show specific error messages based on the error
        if (data.error?.includes("approved")) {
          setError("This invoice needs to be approved before payment. Please contact support.");
        } else if (data.error?.includes("already paid")) {
          setError("This invoice has already been paid.");
        } else if (data.error?.includes("No organization owner")) {
          setError("Unable to process payment: Organization configuration issue. Please contact support.");
        } else if (data.error?.includes("no items")) {
          setError("This invoice has no items to pay.");
        } else {
          setError(data.error || "Failed to initiate payment");
        }
        setLoading(false);
        return;
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Payment URL not received");
        setLoading(false);
      }
    } catch (err) {
      console.error("[Invoice Payment] Network error:", err);
      setError("Failed to process payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
      >
        <CreditCard className="w-4 h-4" />
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-1 max-w-xs">{error}</p>
      )}
    </div>
  );
}

interface ProjectDetailClientProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    budget: any;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    assignee: {
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
    milestones: Array<{
      id: string;
      name: string;
      description: string | null;
      completed: boolean;
      dueDate: Date | null;
      createdAt: Date;
    }>;
    feedEvents: Array<{
      id: string;
      type: string;
      title: string;
      description: string | null;
      createdAt: Date;
      user: {
        name: string | null;
      } | null;
    }>;
    tasks?: Array<{
      id: string;
      title: string;
      description: string | null;
      status: string;
      dueDate: Date | null;
      completedAt: Date | null;
      requiresUpload?: boolean;
      submissionNotes?: string | null;
      createdAt: Date;
    }>;
    githubRepo?: string | null;
    vercelUrl?: string | null;
    files?: Array<{
      id: string;
      name: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
      type: string;
      createdAt: Date;
    }>;
    requests?: Array<{
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
    }>;
    messageThreads?: Array<{
      id: string;
      subject?: string;
      messages: Array<{
        id: string;
        content: string;
        senderId: string;
        role: string;
        createdAt: Date;
      }>;
    }>;
    invoices?: Array<{
      id: string;
      number: string;
      status: string;
      total: any;
      amount: any;
      dueDate: Date;
      paidAt: Date | null;
      createdAt: Date;
    }>;
    questionnaire: any;
  };
}

type TabType = "overview" | "milestones" | "tasks" | "files" | "requests" | "messages" | "invoices" | "repository" | "settings";

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [messageFilter, setMessageFilter] = useState<'all' | 'messages' | 'files' | 'milestones'>('all');
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messages, setMessages] = useState(project.messageThreads?.[0]?.messages || []);
  const [currentThreadId, setCurrentThreadId] = useState(project.messageThreads?.[0]?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update messages when thread changes
  useEffect(() => {
    const thread = project.messageThreads?.[0];
    if (thread) {
      setMessages(thread.messages || []);
      setCurrentThreadId(thread.id);
    }
  }, [project.messageThreads?.[0]?.id]);


  const getStatusBadge = (status: string) => {
    const config = {
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
    }[status] || { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: status };
    
    return config;
  };

  const badge = getStatusBadge(project.status);
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Extract questionnaire data
  const questionnaireData = project.questionnaire?.data as any;
  const packageName = questionnaireData?.selectedPackage || 'starter';
  const selectedFeatures = questionnaireData?.selectedFeatures || [];
  const totals = questionnaireData?.totals;
  const timeline = questionnaireData?.questionnaire?.timeline || 'Flexible';
  const totalAmount = totals?.finalTotal || totals?.subtotal || project.budget || 0;

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

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", project.id);

        const response = await fetch(`/api/client/files?projectId=${project.id}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to upload ${file.name}`);
        }
      }

      setUploadSuccess(`Successfully uploaded ${files.length} file(s)`);
      setTimeout(() => {
        setUploadSuccess(null);
        window.location.reload(); // Refresh to show new files
      }, 2000);
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload files");
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [project.id]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

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
                    <User className="w-4 h-4" />
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
                    <DollarSign className="w-4 h-4" />
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
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        milestone.completed
                          ? "bg-emerald-500/20 border-emerald-500/50"
                          : "bg-white/5 border-white/20"
                      }`}>
                        {milestone.completed && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
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
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          {milestone.dueDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Created {new Date(milestone.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "tasks":
        return (
          <ClientTaskList
          tasks={(project.tasks || []).map(t => ({
            ...t,
            requiresUpload: t.requiresUpload || false,
            submissionNotes: t.submissionNotes || null,
          }))}
          onTaskUpdate={() => window.location.reload()}
        />
        );

      case "files":
        const files = project.files || [];
        const formatFileSize = (bytes: number): string => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
        };

        const getFileIcon = (mimeType: string) => {
          if (mimeType.startsWith("image/")) return "🖼️";
          if (mimeType.startsWith("video/")) return "🎥";
          if (mimeType.includes("pdf")) return "📄";
          if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
          if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
          return "📎";
        };

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Project Files</h3>
              <div className="flex items-center gap-3">
                <Link
                  href={`/client/requests?projectId=${project.id}`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Change Requests
                </Link>
                <button
                  onClick={openFileDialog}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload File"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </div>
            </div>
            
            {/* Upload Status Messages */}
            <AnimatePresence>
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
                >
                  <p className="text-red-300 text-sm flex-1">{uploadError}</p>
                  <button
                    onClick={() => setUploadError(null)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              )}
              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3"
                >
                  <p className="text-emerald-300 text-sm flex-1">{uploadSuccess}</p>
                  <button
                    onClick={() => setUploadSuccess(null)}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {files.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-2">No files uploaded yet</p>
                <p className="text-sm text-white/40">Files shared by your team will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate mb-1 group-hover:text-blue-300 transition-colors">
                          {file.originalName || file.name}
                        </h4>
                        <p className="text-xs text-white/60 mb-2">{formatFileSize(file.size)}</p>
                        <p className="text-xs text-white/40">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-blue-500/30"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                      <a
                        href={file.url}
                        download
                        className="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-cyan-500/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "requests":
        return (
          <ClientChangeRequestsSection 
            requests={project.requests || []} 
            projectId={project.id} 
          />
        );

      case "messages":
        const handleSendMessage = async () => {
          if (!newMessage.trim() || sendingMessage) return;
          
          setSendingMessage(true);
          try {
            const response = await fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                threadId: currentThreadId,
                projectId: project.id,
                content: newMessage.trim(),
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              setNewMessage("");
              
              // If a new thread was created, update the thread ID
              if (!currentThreadId && data.threadId) {
                setCurrentThreadId(data.threadId);
              }
              
              // Refresh messages
              const threadId = currentThreadId || data.threadId;
              if (threadId) {
                const messagesResponse = await fetch(`/api/messages/${threadId}`);
                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json();
                  setMessages(messagesData);
                } else {
                  // Fallback: reload page if fetch fails
                  window.location.reload();
                }
              } else {
                window.location.reload();
              }
            } else {
              const error = await response.json();
              alert(error.error || "Failed to send message");
            }
          } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message. Please try again.");
          } finally {
            setSendingMessage(false);
          }
        };
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Project Messages</h3>
              <span className="text-sm text-white/60">{messages.length} messages</span>
            </div>
            
            {/* Messages Display */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No messages yet</p>
                  <p className="text-sm text-white/40 mt-2">Start the conversation by sending a message below</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.role === 'client'
                        ? 'bg-blue-600 ml-auto max-w-[80%]'
                        : 'bg-gray-800 mr-auto max-w-[80%]'
                    }`}
                  >
                    <p className="text-sm text-white">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sendingMessage ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        );

      case "invoices":
        const invoices = project.invoices || [];
        
        const getInvoiceStatusBadge = (status: string) => {
          const config: Record<string, { bg: string; text: string; border: string }> = {
            PAID: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30" },
            SENT: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30" },
            OVERDUE: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30" },
            DRAFT: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30" },
          };
          return config[status] || { bg: "bg-gray-500/20", text: "text-gray-300", border: "border-gray-500/30" };
        };
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Project Invoices</h3>
              <span className="text-sm text-white/60">{invoices.length} invoices</span>
            </div>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No invoices yet</p>
                <p className="text-sm text-white/40 mt-2">Invoices for this project will appear here</p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                        Invoice #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                        Paid
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {invoices.map((invoice) => {
                      const badge = getInvoiceStatusBadge(invoice.status);
                      const canPay = invoice.status === 'SENT' && !invoice.paidAt;
                      return (
                        <tr key={invoice.id} className="hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-mono">
                            {invoice.number}
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-semibold">
                            ${Number(invoice.amount || invoice.total).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {canPay ? (
                              <InvoicePayButton invoiceId={invoice.id} invoiceNumber={invoice.number} />
                            ) : invoice.status === 'PAID' ? (
                              <span className="text-sm text-green-400">Paid</span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
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
            githubRepo: project.githubRepo || null,
            vercelUrl: project.vercelUrl || null,
            questionnaire: project.questionnaire,
          }}
            assignee={project.assignee}
            isAdmin={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div>
        <Link 
          href="/client/projects" 
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
          <div className="flex items-center gap-3">
            <Link
              href={`/client/requests?projectId=${project.id}`}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Change Requests
            </Link>
            <span
              className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Package & Timeline Info Bar */}
      {questionnaireData && (
        <div className="seezee-glass p-4 rounded-2xl">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-white/50">Package:</span>
              <span className="font-semibold capitalize">{packageName}</span>
            </div>
            {selectedFeatures.length > 0 && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-white/50">Features:</span>
                  <span className="font-semibold">{selectedFeatures.length} selected</span>
                </div>
              </>
            )}
            {totalAmount > 0 && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-white/50">Total:</span>
                  <span className="font-semibold">${Number(totalAmount / 100).toLocaleString()}</span>
                </div>
              </>
            )}
            {timeline && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <span className="font-semibold">{timeline}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="seezee-glass p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-white">Project Progress</span>
          </div>
          <span className="text-2xl font-bold text-white">{progress}%</span>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {/* Milestones */}
          {totalMilestones > 0 && (
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Milestones</span>
                <span className="text-sm font-semibold text-white">
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Tasks */}
          {project.tasks && project.tasks.length > 0 && (
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Tasks</span>
                <span className="text-sm font-semibold text-white">
                  {project.tasks.filter(t => t.status === 'completed').length}/{project.tasks.length}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
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

        {/* Tab Content */}
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

