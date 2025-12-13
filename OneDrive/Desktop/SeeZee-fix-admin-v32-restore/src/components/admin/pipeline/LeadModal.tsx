"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { updateLead, deleteLead, LeadStatus } from "@/server/actions/pipeline";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiPhone, FiBriefcase, FiMessageSquare, FiDollarSign, FiCalendar, FiTag } from "react-icons/fi";
import { ServiceCategory } from "@prisma/client";

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  status: string;
  source?: string | null;
  message?: string | null;
  serviceType?: string | null;
  timeline?: string | null;
  budget?: string | null;
}

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New Lead" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

export function LeadModal({ isOpen, onClose, lead }: LeadModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    status: (lead?.status || "NEW") as LeadStatus,
    source: lead?.source || "",
    message: lead?.message || "",
    serviceType: lead?.serviceType || "",
    timeline: lead?.timeline || "",
    budget: lead?.budget || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setLoading(true);
    setError(null);

    const result = await updateLead(lead.id, {
      ...formData,
      serviceType: formData.serviceType ? (formData.serviceType as ServiceCategory) : null,
    });

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Failed to update lead");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!lead || !confirm("Are you sure you want to delete this lead?")) return;

    setLoading(true);
    const result = await deleteLead(lead.id);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Failed to delete lead");
    }
    setLoading(false);
  };

  if (!lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Lead"
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg border-2 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            Delete Lead
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 rounded-lg border-2 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lead-form"
              disabled={loading}
              className="px-6 py-2 rounded-lg border-2 border-trinity-red/50 bg-trinity-red text-white hover:bg-trinity-maroon transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      }
    >
      <form id="lead-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiUser className="h-4 w-4 text-trinity-red" />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiMail className="h-4 w-4 text-trinity-red" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiPhone className="h-4 w-4 text-trinity-red" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Company */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiBriefcase className="h-4 w-4 text-trinity-red" />
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiTag className="h-4 w-4 text-trinity-red" />
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiTag className="h-4 w-4 text-trinity-red" />
              Source
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g., Website, Referral"
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiDollarSign className="h-4 w-4 text-trinity-red" />
              Budget
            </label>
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="e.g., $10,000 - $25,000"
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Timeline */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiCalendar className="h-4 w-4 text-trinity-red" />
              Timeline
            </label>
            <input
              type="text"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              placeholder="e.g., 2-3 months"
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Service Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <FiBriefcase className="h-4 w-4 text-trinity-red" />
            Service Type
          </label>
          <input
            type="text"
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            placeholder="e.g., Web Development, Design"
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Message/Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <FiMessageSquare className="h-4 w-4 text-trinity-red" />
            Notes / Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
















