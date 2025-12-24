"use client";

import { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiDollarSign, FiCalendar, FiFileText, FiSettings, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { createCustomProject, type CreateCustomProjectParams } from "@/server/actions/projects";
import { ProjectStatus, ProjectStage, NonprofitTier } from "@prisma/client";
import { useRouter } from "next/navigation";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "LEAD", label: "Lead" },
  { value: "QUOTED", label: "Quoted" },
  { value: "DEPOSIT_PAID", label: "Deposit Paid" },
  { value: "ACTIVE", label: "Active" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const PROJECT_STAGES: { value: ProjectStage; label: string }[] = [
  { value: "DISCOVERY", label: "Discovery" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "DESIGN", label: "Design" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "REVIEW", label: "Review" },
  { value: "LAUNCH", label: "Launch" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const MAINTENANCE_TIERS: { value: NonprofitTier; label: string }[] = [
  { value: "ESSENTIALS", label: "Essentials ($500/mo)" },
  { value: "DIRECTOR", label: "Director ($750/mo)" },
  { value: "COO", label: "COO ($2,000/mo)" },
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const [formData, setFormData] = useState<CreateCustomProjectParams>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    companyName: "",
    organizationId: undefined,
    projectName: "",
    projectDescription: "",
    projectStatus: ProjectStatus.LEAD,
    projectStage: ProjectStage.DISCOVERY,
    budget: undefined,
    startDate: undefined,
    endDate: undefined,
    assigneeId: undefined,
    isNonprofit: false,
    createLead: false,
    leadSource: "admin_created",
    leadMessage: "",
    milestones: [],
    createInvoice: false,
    invoiceAmount: undefined,
    invoiceTitle: "",
    invoiceDescription: "",
    markInvoicePaid: false,
    createMaintenancePlan: false,
    maintenanceTier: "ESSENTIALS",
    githubRepo: "",
    vercelUrl: "",
    internalNotes: "",
  });

  // Load organizations and users
  useEffect(() => {
    if (isOpen) {
      loadOrganizations();
      loadUsers();
    }
  }, [isOpen]);

  const loadOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const res = await fetch("/api/admin/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users?role=CLIENT");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [
        ...(formData.milestones || []),
        { title: "", description: "", dueDate: undefined },
      ],
    });
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones?.filter((_, i) => i !== index) || [],
    });
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...(formData.milestones || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, milestones: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.clientName || !formData.clientEmail || !formData.projectName) {
        setError("Client name, email, and project name are required");
        setIsSubmitting(false);
        return;
      }

      // Prepare data
      const submitData: CreateCustomProjectParams = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        milestones: formData.milestones?.filter((m) => m.title.trim() !== "") || [],
      };

      const result = await createCustomProject(submitData);

      if (result.success) {
        router.refresh();
        onClose();
        // Reset form
        setFormData({
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          companyName: "",
          organizationId: undefined,
          projectName: "",
          projectDescription: "",
          projectStatus: ProjectStatus.LEAD,
          projectStage: ProjectStage.DISCOVERY,
          budget: undefined,
          startDate: undefined,
          endDate: undefined,
          assigneeId: undefined,
          isNonprofit: false,
          createLead: false,
          leadSource: "admin_created",
          leadMessage: "",
          milestones: [],
          createInvoice: false,
          invoiceAmount: undefined,
          invoiceTitle: "",
          invoiceDescription: "",
          markInvoicePaid: false,
          createMaintenancePlan: false,
          maintenanceTier: "ESSENTIALS",
          githubRepo: "",
          vercelUrl: "",
          internalNotes: "",
        });
        setCurrentStep(1);
      } else {
        setError(result.error || "Failed to create project");
      }
    } catch (error: any) {
      console.error("Failed to create project:", error);
      setError(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0a1128]/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e293b] to-[#0f172a] backdrop-blur-xl shadow-2xl flex flex-col z-[9999]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Create Custom Project
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Step {currentStep} of 4: {currentStep === 1 ? "Client Info" : currentStep === 2 ? "Project Details" : currentStep === 3 ? "Optional Setup" : "Review"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <form id="project-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Step 1: Client Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                    <FiUser className="h-5 w-5 text-trinity-red" />
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Use Existing Organization (Optional)
                      </label>
                      <select
                        value={formData.organizationId || ""}
                        onChange={(e) => setFormData({ ...formData, organizationId: e.target.value || undefined })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                      >
                        <option value="">Create New Organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                    <FiBriefcase className="h-5 w-5 text-trinity-red" />
                    Project Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="Website Redesign Project"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Description
                      </label>
                      <textarea
                        value={formData.projectDescription}
                        onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="Describe the project..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Status
                      </label>
                      <select
                        value={formData.projectStatus}
                        onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value as ProjectStatus })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                      >
                        {PROJECT_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Stage
                      </label>
                      <select
                        value={formData.projectStage}
                        onChange={(e) => setFormData({ ...formData, projectStage: e.target.value as ProjectStage })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                      >
                        {PROJECT_STAGES.map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Budget ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.budget || ""}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate ? new Date(formData.startDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : undefined })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate ? new Date(formData.endDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isNonprofit"
                        checked={formData.isNonprofit}
                        onChange={(e) => setFormData({ ...formData, isNonprofit: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-trinity-red focus:ring-trinity-red"
                      />
                      <label htmlFor="isNonprofit" className="text-sm font-medium text-gray-300">
                        This is a nonprofit project
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Optional Setup */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Lead */}
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                    <FiFileText className="h-5 w-5 text-trinity-red" />
                    Lead (Optional)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="createLead"
                        checked={formData.createLead}
                        onChange={(e) => setFormData({ ...formData, createLead: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-trinity-red focus:ring-trinity-red"
                      />
                      <label htmlFor="createLead" className="text-sm font-medium text-gray-300">
                        Create associated lead
                      </label>
                    </div>
                    {formData.createLead && (
                      <div className="space-y-4 pl-6 border-l-2 border-gray-700">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Lead Source
                          </label>
                          <input
                            type="text"
                            value={formData.leadSource}
                            onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                            placeholder="admin_created"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Lead Message
                          </label>
                          <textarea
                            value={formData.leadMessage}
                            onChange={(e) => setFormData({ ...formData, leadMessage: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                            placeholder="Initial inquiry message..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice */}
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                    <FiDollarSign className="h-5 w-5 text-trinity-red" />
                    Invoice (Optional)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="createInvoice"
                        checked={formData.createInvoice}
                        onChange={(e) => setFormData({ ...formData, createInvoice: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-trinity-red focus:ring-trinity-red"
                      />
                      <label htmlFor="createInvoice" className="text-sm font-medium text-gray-300">
                        Create initial invoice
                      </label>
                    </div>
                    {formData.createInvoice && (
                      <div className="space-y-4 pl-6 border-l-2 border-gray-700">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Invoice Amount ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.invoiceAmount || ""}
                            onChange={(e) => setFormData({ ...formData, invoiceAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                            placeholder="5000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Invoice Title
                          </label>
                          <input
                            type="text"
                            value={formData.invoiceTitle}
                            onChange={(e) => setFormData({ ...formData, invoiceTitle: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                            placeholder="Project Deposit"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Invoice Description
                          </label>
                          <textarea
                            value={formData.invoiceDescription}
                            onChange={(e) => setFormData({ ...formData, invoiceDescription: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                            placeholder="Initial deposit for project..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="markInvoicePaid"
                            checked={formData.markInvoicePaid}
                            onChange={(e) => setFormData({ ...formData, markInvoicePaid: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-trinity-red focus:ring-trinity-red"
                          />
                          <label htmlFor="markInvoicePaid" className="text-sm font-medium text-gray-300">
                            Mark invoice as paid
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Maintenance Plan */}
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                    <FiSettings className="h-5 w-5 text-trinity-red" />
                    Maintenance Plan (Optional)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="createMaintenancePlan"
                        checked={formData.createMaintenancePlan}
                        onChange={(e) => setFormData({ ...formData, createMaintenancePlan: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-trinity-red focus:ring-trinity-red"
                      />
                      <label htmlFor="createMaintenancePlan" className="text-sm font-medium text-gray-300">
                        Create maintenance plan
                      </label>
                    </div>
                    {formData.createMaintenancePlan && (
                      <div className="pl-6 border-l-2 border-gray-700">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Maintenance Tier
                        </label>
                        <select
                          value={formData.maintenanceTier}
                          onChange={(e) => setFormData({ ...formData, maintenanceTier: e.target.value as NonprofitTier })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        >
                          {MAINTENANCE_TIERS.map((tier) => (
                            <option key={tier.value} value={tier.value}>
                              {tier.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                    <FiCalendar className="h-5 w-5 text-trinity-red" />
                    Milestones (Optional)
                  </h3>
                  <div className="space-y-4">
                    {(formData.milestones || []).map((milestone, index) => (
                      <div key={index} className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium text-gray-400">Milestone {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeMilestone(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(index, "title", e.target.value)}
                            placeholder="Milestone title"
                            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                          />
                          <textarea
                            value={milestone.description || ""}
                            onChange={(e) => updateMilestone(index, "description", e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                          />
                          <input
                            type="date"
                            value={milestone.dueDate ? new Date(milestone.dueDate).toISOString().split("T")[0] : ""}
                            onChange={(e) => updateMilestone(index, "dueDate", e.target.value ? new Date(e.target.value) : undefined)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="w-full px-4 py-2 rounded-lg border border-dashed border-gray-700 text-gray-400 hover:border-trinity-red/50 hover:text-trinity-red transition-colors"
                    >
                      + Add Milestone
                    </button>
                  </div>
                </div>

                {/* Additional Fields */}
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        GitHub Repository URL
                      </label>
                      <input
                        type="url"
                        value={formData.githubRepo}
                        onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="https://github.com/org/repo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Vercel URL
                      </label>
                      <input
                        type="url"
                        value={formData.vercelUrl}
                        onChange={(e) => setFormData({ ...formData, vercelUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="https://project.vercel.app"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Internal Notes
                      </label>
                      <textarea
                        value={formData.internalNotes}
                        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
                        placeholder="Internal notes for admin team..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-heading font-semibold text-white mb-4">Review Project Details</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                    <h4 className="font-semibold text-white mb-2">Client</h4>
                    <p className="text-sm text-gray-300">{formData.clientName}</p>
                    <p className="text-sm text-gray-400">{formData.clientEmail}</p>
                    {formData.companyName && <p className="text-sm text-gray-400">{formData.companyName}</p>}
                  </div>
                  <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                    <h4 className="font-semibold text-white mb-2">Project</h4>
                    <p className="text-sm text-gray-300">{formData.projectName}</p>
                    {formData.projectDescription && <p className="text-sm text-gray-400 mt-1">{formData.projectDescription}</p>}
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-gray-400">Status: <span className="text-white">{formData.projectStatus}</span></span>
                      <span className="text-gray-400">Stage: <span className="text-white">{formData.projectStage}</span></span>
                    </div>
                    {formData.budget && <p className="text-sm text-gray-400 mt-1">Budget: ${formData.budget.toLocaleString()}</p>}
                  </div>
                  {formData.createInvoice && formData.invoiceAmount && (
                    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                      <h4 className="font-semibold text-white mb-2">Invoice</h4>
                      <p className="text-sm text-gray-300">{formData.invoiceTitle || "Invoice"}</p>
                      <p className="text-sm text-gray-400">${formData.invoiceAmount.toLocaleString()}</p>
                      {formData.markInvoicePaid && <p className="text-sm text-green-400 mt-1">✓ Will be marked as paid</p>}
                    </div>
                  )}
                  {formData.createMaintenancePlan && (
                    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                      <h4 className="font-semibold text-white mb-2">Maintenance Plan</h4>
                      <p className="text-sm text-gray-300">{formData.maintenanceTier}</p>
                    </div>
                  )}
                  {formData.milestones && formData.milestones.length > 0 && (
                    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                      <h4 className="font-semibold text-white mb-2">Milestones</h4>
                      <ul className="space-y-2">
                        {formData.milestones.map((m, i) => (
                          <li key={i} className="text-sm text-gray-300">{m.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="border-t border-white/10 p-6 flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 rounded-lg bg-trinity-red text-white hover:bg-trinity-red/90 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  form="project-form"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-trinity-red text-white hover:bg-trinity-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiCheck className="h-4 w-4" />
                      Create Project
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

