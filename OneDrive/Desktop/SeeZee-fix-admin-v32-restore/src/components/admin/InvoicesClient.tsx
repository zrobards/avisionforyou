"use client";

/**
 * Invoices Client Component
 */

import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Plus, Download, Trash2, Edit2 } from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { arrayToCSV, downloadCSV, formatCurrencyForCSV, formatDateForCSV } from "@/lib/csv-export";
import { deleteInvoice, updateInvoice } from "@/server/actions";
import { createStripeInvoice, sendInvoiceViaStripe } from "@/server/actions/invoice";
import { CreateInvoiceModal } from "./CreateInvoiceModal";

interface Invoice {
  id: string;
  number: string;
  title: string;
  amount: any;
  total: any;
  status: string;
  dueDate: Date;
  organization: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  } | null;
}

interface InvoicesClientProps {
  invoices: Invoice[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  SENT: "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30",
  PAID: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30",
  OVERDUE: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30",
  CANCELLED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export function InvoicesClient({ invoices: initialInvoices }: InvoicesClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Invoice>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sendingStripe, setSendingStripe] = useState<string | null>(null);

  const isCEO = session?.user?.role === "CEO";

  const handleDelete = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    setDeleting(invoiceId);
    const result = await deleteInvoice(invoiceId);

    if (result.success) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    } else {
      alert(result.error || "Failed to delete invoice");
    }
    setDeleting(null);
    router.refresh();
  };

  const handleEdit = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(invoice.id);
    setEditForm({
      title: invoice.title,
      amount: parseFloat(invoice.total || invoice.amount),
      total: parseFloat(invoice.total || invoice.amount),
      status: invoice.status,
      dueDate: new Date(invoice.dueDate),
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;

    const result = await updateInvoice(editing, {
      title: editForm.title,
      amount: editForm.amount,
      total: editForm.total,
      status: editForm.status,
      dueDate: editForm.dueDate,
    });

    if (result.success) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editing
            ? {
                ...inv,
                ...editForm,
                total: editForm.total || inv.amount,
              }
            : inv
        )
      );
      setEditing(null);
      setEditForm({});
      router.refresh();
    } else {
      alert(result.error || "Failed to update invoice");
    }
  };

  const handleSendViaStripe = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("This will create a Stripe invoice and send it to the client. Continue?")) {
      return;
    }

    setSendingStripe(invoiceId);
    const result = await sendInvoiceViaStripe(invoiceId);

    if (result.success) {
      alert("Invoice sent successfully via Stripe!");
      router.refresh();
    } else {
      alert((result as any).error || "Failed to send invoice via Stripe");
    }
    setSendingStripe(null);
  };

  const columns: Column<Invoice>[] = [
    { key: "number", label: "Invoice #", sortable: true },
    {
      key: "title",
      label: "Title",
      sortable: true,
    },
    {
      key: "organization",
      label: "Client",
      sortable: true,
      render: (invoice) => invoice.organization.name,
    },
    {
      key: "total",
      label: "Amount",
      sortable: true,
      render: (invoice) => (
        <span className="font-medium">
          {formatCurrency(parseFloat(invoice.total || invoice.amount))}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (invoice) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
            statusColors[invoice.status] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
          }`}
        >
          {statusLabels[invoice.status] || invoice.status}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (invoice) => new Date(invoice.dueDate).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (invoice) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {invoice.status === "DRAFT" && isCEO && (
            <button
              onClick={(e) => handleSendViaStripe(invoice.id, e)}
              disabled={sendingStripe === invoice.id}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-all disabled:opacity-50"
            >
              {sendingStripe === invoice.id ? "Sending..." : "Send via Stripe"}
            </button>
          )}
          {invoice.status === "SENT" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/pipeline/invoices/${invoice.id}`);
              }}
              className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-all"
            >
              View Payment
            </button>
          )}
          {isCEO && (
            <>
              <button
                onClick={(e) => handleEdit(invoice, e)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Edit invoice"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
              </button>
              <button
                onClick={(e) => handleDelete(invoice.id, e)}
                disabled={deleting === invoice.id}
                className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Delete invoice"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleExport = () => {
    type CsvRow = {
      number: string;
      title: string;
      total: string;
      status: string;
      dueDate: string;
      organization: string;
      project: string;
    };

    const headers: { key: keyof CsvRow; label: string }[] = [
      { key: "number", label: "Invoice Number" },
      { key: "title", label: "Title" },
      { key: "total", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "dueDate", label: "Due Date" },
      { key: "organization", label: "Organization" },
      { key: "project", label: "Project" },
    ];

    const csvData: CsvRow[] = invoices.map((invoice) => ({
      number: invoice.number || invoice.id.slice(0, 8),
      title: invoice.title || "Invoice",
      total: formatCurrencyForCSV(Number(invoice.total)),
      status: statusLabels[invoice.status] || invoice.status,
      dueDate: formatDateForCSV(invoice.dueDate),
      organization: invoice.organization?.name || "N/A",
      project: invoice.project?.name || "N/A",
    }));

    const csvContent = arrayToCSV(csvData, headers);
    const filename = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  const handleCreateInvoice = () => {
    setShowCreateModal(true);
  };

  return (
    <>
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <div className="space-y-6">
        <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Search invoices..."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleCreateInvoice}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-semibold transition-all shadow-lg shadow-[#ef4444]/25 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        }
        onRowClick={(invoice) => router.push(`/admin/pipeline/invoices/${invoice.id}`)}
      />

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-[#0a1128]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-heading font-bold mb-6 text-white">Edit Invoice</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0f172a]/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount || 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditForm({ ...editForm, amount: val, total: val });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0f172a]/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <select
                  value={editForm.status || "DRAFT"}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0f172a]/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50 transition-all"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={
                    editForm.dueDate
                      ? new Date(editForm.dueDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditForm({ ...editForm, dueDate: new Date(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0f172a]/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditing(null);
                  setEditForm({});
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold transition-all shadow-lg shadow-[#ef4444]/25"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
