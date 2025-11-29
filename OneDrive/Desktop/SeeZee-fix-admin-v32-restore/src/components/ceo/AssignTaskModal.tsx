"use client";

import { useState, useEffect } from "react";
import { X, Save, FolderOpen, Clock, Tag, Repeat, AlertCircle, CheckCircle2, Zap, Users } from "lucide-react";
import AudiencePicker from "./AudiencePicker";
import DueDatePicker from "./DueDatePicker";
import ProjectDropdown from "./ProjectDropdown";
import { toast } from "@/hooks/use-toast";

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours?: number;
  tags: string[];
}

const defaultTemplates: TaskTemplate[] = [
  {
    id: "code-review",
    name: "Code Review",
    title: "Review code changes",
    description: "Review pull request and provide feedback",
    priority: "HIGH",
    estimatedHours: 2,
    tags: ["development", "review"],
  },
  {
    id: "bug-fix",
    name: "Bug Fix",
    title: "Fix reported bug",
    description: "Investigate and fix the reported issue",
    priority: "HIGH",
    estimatedHours: 4,
    tags: ["bug", "fix"],
  },
  {
    id: "feature",
    name: "Feature Development",
    title: "Implement new feature",
    description: "Design and implement the requested feature",
    priority: "MEDIUM",
    estimatedHours: 8,
    tags: ["feature", "development"],
  },
  {
    id: "documentation",
    name: "Documentation",
    title: "Update documentation",
    description: "Update project documentation",
    priority: "LOW",
    estimatedHours: 2,
    tags: ["documentation"],
  },
];

export default function AssignTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: AssignTaskModalProps) {
  const [audience, setAudience] = useState<{
    type: "USER" | "TEAM" | "ROLE";
    userIds?: string[];
    teamId?: string;
    role?: string;
  }>({ type: "ROLE", role: "FRONTEND" }); // Default to role-based assignment
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number | "">("");
  const [projectId, setProjectId] = useState<string>("");
  const [payoutAmount, setPayoutAmount] = useState<number | "">("");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "template">("create");

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadProjects();
      loadTemplates();
      // Reset state when modal opens
      setAudience({ type: "ROLE", role: "FRONTEND" });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setEstimatedHours("");
      setProjectId("");
      setPayoutAmount("");
      setTags([]);
      setTagInput("");
      setIsRecurring(false);
      setRecurringPattern("WEEKLY");
      setSelectedTemplate(null);
      setError("");
      setActiveTab("create");
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to load projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/team");
      if (!response.ok) throw new Error("Failed to load users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadTemplates = async () => {
    try {
      // Load saved templates from localStorage
      const saved = localStorage.getItem("ceo_task_templates");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTemplates([...defaultTemplates, ...parsed]);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  const saveAsTemplate = () => {
    if (!title.trim()) {
      toast("Please enter a task title first", "error");
      return;
    }

    const template: TaskTemplate = {
      id: `custom-${Date.now()}`,
      name: title,
      title,
      description,
      priority,
      estimatedHours: typeof estimatedHours === "number" ? estimatedHours : undefined,
      tags,
    };

    try {
      const saved = localStorage.getItem("ceo_task_templates");
      const existing = saved ? JSON.parse(saved) : [];
      const updated = [...existing, template];
      localStorage.setItem("ceo_task_templates", JSON.stringify(updated));
      setTemplates([...defaultTemplates, ...updated]);
      toast("Template saved successfully", "success");
    } catch (err) {
      toast("Failed to save template", "error");
    }
  };

  const loadTemplate = (template: TaskTemplate) => {
    setTitle(template.title);
    setDescription(template.description);
    setPriority(template.priority);
    setEstimatedHours(template.estimatedHours || "");
    setTags(template.tags);
    setSelectedTemplate(template.id);
    setActiveTab("create");
    toast(`Loaded template: ${template.name}`, "success");
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error("Task title is required");
      }

      // Validate role-based or user-based assignment
      if (audience.type === "ROLE" && !audience.role) {
        throw new Error("Please select a role group");
      }
      if (audience.type === "USER" && (!audience.userIds || audience.userIds.length === 0)) {
        throw new Error("Please select at least one user");
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        ...(audience.type === "ROLE" && audience.role && { assignedToRole: audience.role }),
        ...(audience.type === "USER" && audience.userIds && { userIds: audience.userIds }),
        ...(projectId && { projectId }),
        ...(typeof payoutAmount === "number" && payoutAmount > 0 && { payoutAmount }),
        ...(dueDate && { dueDate: new Date(dueDate).toISOString() }),
        ...(typeof estimatedHours === "number" && { estimatedHours }),
        ...(tags.length > 0 && { tags }),
        ...(isRecurring && { isRecurring: true, recurringPattern }),
        ...(selectedTemplate && { templateId: selectedTemplate }),
      };

      const response = await fetch("/api/ceo/tasks/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign tasks");
      }

      const result = await response.json();

      // Show success toast
      const assignmentText = audience.type === "ROLE" 
        ? `${audience.role} role group`
        : `${result.assigned} user(s)`;
      toast(
        `Successfully assigned task to ${assignmentText}${
          result.skipped > 0 ? `. Skipped ${result.skipped} duplicate(s)` : ""
        }`,
        "success"
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast(err.message || "Failed to assign tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "HIGH":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "LOW":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const totalEstimatedHours = typeof estimatedHours === "number" && audience.userIds
    ? estimatedHours * audience.userIds.length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass w-full max-w-4xl rounded-lg border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-400" />
                CEO Task Assignment
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Create and assign tasks to team members (CEO Only)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "create"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("template")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "template"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Templates
            </button>
          </div>
        </div>

        {/* Template Tab */}
        {activeTab === "template" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(template.priority)}`}>
                      {template.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {template.estimatedHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.estimatedHours}h
                      </span>
                    )}
                    {template.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {template.tags.length} tags
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Task Form */}
        {activeTab === "create" && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                Task Title <span className="text-red-400">*</span>
                {selectedTemplate && (
                  <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                    From template
                  </span>
                )}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete project documentation"
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details or context..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Priority, Due Date, and Estimated Hours Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        priority === p
                          ? getPriorityColor(p)
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <DueDatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  label="Due Date (Optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) =>
                    setEstimatedHours(e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {typeof estimatedHours === "number" && audience.userIds && audience.userIds.length > 0 && estimatedHours > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Total: {totalEstimatedHours.toFixed(1)}h across {audience.userIds.length} user(s)
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recurring Task */}
            <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Repeat className="w-4 h-4" />
                    Recurring Task
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Create this task automatically on a schedule
                  </p>
                </div>
              </label>
              {isRecurring && (
                <div className="mt-4 ml-8">
                  <label className="block text-sm font-medium mb-2">Recurring Pattern</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((pattern) => (
                      <button
                        key={pattern}
                        type="button"
                        onClick={() => setRecurringPattern(pattern)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          recurringPattern === pattern
                            ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        {pattern}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assign To <span className="text-red-400">*</span>
              </label>
              <AudiencePicker
                value={audience}
                onChange={setAudience}
                users={users}
                loadingUsers={loadingUsers}
              />
            </div>

            {/* Project and Payout Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ProjectDropdown
                  value={projectId}
                  onChange={setProjectId}
                  projects={projects}
                  label="Project (Optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payout Amount (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value ? parseFloat(e.target.value) : "")}
                  placeholder="e.g., 200.00"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={saveAsTemplate}
                disabled={!title.trim()}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Template
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !title.trim() ||
                  (audience.type === "ROLE" && !audience.role) ||
                  (audience.type === "USER" && (!audience.userIds || audience.userIds.length === 0))
                }
                className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {audience.type === "ROLE" 
                      ? `Assign to ${audience.role || "Role"}`
                      : `Assign to ${audience.userIds?.length || 0} User(s)`
                    }
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}