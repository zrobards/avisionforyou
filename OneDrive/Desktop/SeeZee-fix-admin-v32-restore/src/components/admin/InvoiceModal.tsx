"use client";

import { useState } from "react";
import { Modal } from "./shared/Modal";
import { updateInvoice, deleteInvoice } from "@/server/actions/pipeline";
import { useRouter } from "next/navigation";
import { FiFileText, FiDollarSign, FiCalendar, FiTag, FiAlignLeft } from "react-icons/fi";

interface Invoice {
  id: string;
  number: string;
  title?: string | null;
  description?: string | null;
  amount: number;
  tax?: number;
  total: number;
  status: string;
  dueDate?: string | null;
  client: string;
  project: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: invoice?.title || "",
    description: invoice?.description || "",
    amount: invoice?.amount || 0,
    tax: invoice?.tax || 0,
    status: invoice?.status || "DRAFT",
    dueDate: invoice?.dueDate ? invoice.dueDate.split("T")[0] : "",
  });

  // Calculate total
  const calculatedTotal = formData.amount + formData.tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setLoading(true);
    setError(null);

    const result = await updateInvoice(invoice.id, {
      title: formData.title,
      description: formData.description,
      amount: formData.amount,
      tax: formData.tax,
      total: calculatedTotal,
      status: formData.status,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Failed to update invoice");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!invoice || !confirm("Are you sure you want to delete this invoice?")) return;

    setLoading(true);
    const result = await deleteInvoice(invoice.id);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || "Failed to delete invoice");
    }
    setLoading(false);
  };

  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Invoice ${invoice.number}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg border-2 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            Delete Invoice
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
              form="invoice-form"
              disabled={loading}
              className="px-6 py-2 rounded-lg border-2 border-trinity-red/50 bg-trinity-red text-white hover:bg-trinity-maroon transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Client and Project Info */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Client:</span>
              <span className="ml-2 text-white font-medium">{invoice.client}</span>
            </div>
            <div>
              <span className="text-gray-500">Project:</span>
              <span className="ml-2 text-white font-medium">{invoice.project}</span>
            </div>
          </div>
        </div>

        {/* Invoice Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiFileText className="h-4 w-4 text-trinity-red" />
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Invoice title"
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiDollarSign className="h-4 w-4 text-trinity-red" />
              Amount
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiDollarSign className="h-4 w-4 text-trinity-red" />
              Tax
            </label>
            <input
              type="number"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiTag className="h-4 w-4 text-trinity-red" />
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiCalendar className="h-4 w-4 text-trinity-red" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <FiAlignLeft className="h-4 w-4 text-trinity-red" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-trinity-red/50 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Total */}
        <div className="rounded-lg border-2 border-trinity-red/30 bg-trinity-red/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-heading font-semibold text-white">Total</span>
            <span className="text-2xl font-heading font-bold text-trinity-red">
              ${calculatedTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
















