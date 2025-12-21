"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Download, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import { SectionCard } from "@/components/admin/SectionCard";

interface InvoiceDetailClientProps {
  invoice: {
    id: string;
    number: string;
    title: string;
    description: string | null;
    amount: number;
    tax: number;
    total: number;
    currency: string;
    status: string;
    dueDate: Date | string;
    sentAt: Date | string | null;
    paidAt: Date | string | null;
    createdAt: Date | string;
    organization: {
      id: string;
      name: string;
    };
    project: {
      id: string;
      name: string;
    } | null;
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    payments: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      method: string | null;
      processedAt: Date | string | null;
      createdAt: Date | string;
    }>;
  };
  paymentUrl: string | null;
  stripeInvoiceUrl: string | null;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export function InvoiceDetailClient({
  invoice,
  paymentUrl,
  stripeInvoiceUrl,
}: InvoiceDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [updating, setUpdating] = useState(false);

  // Check for payment success/cancelled query params and refresh
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success" || payment === "cancelled") {
      // Refresh the page to get updated invoice status
      router.refresh();
      // Remove query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update invoice status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePayNow = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="admin-page-title">Invoice {invoice.number}</h1>
            <p className="admin-page-subtitle">{invoice.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === "PAID" && stripeInvoiceUrl && (
            <a
              href={stripeInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          )}
          {invoice.status === "SENT" && paymentUrl && (
            <button
              onClick={handlePayNow}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${
            statusColors[invoice.status] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
          }`}
        >
          {statusLabels[invoice.status] || invoice.status}
        </span>
        {invoice.status === "SENT" && (
          <select
            value={invoice.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updating}
            className="px-3 py-1 rounded-lg bg-slate-800 border border-white/10 text-white text-sm"
          >
            <option value="SENT">Sent</option>
            <option value="PAID">Mark as Paid</option>
            <option value="CANCELLED">Cancel</option>
          </select>
        )}
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Invoice Information">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Invoice Number</span>
              <span className="text-white font-medium">{invoice.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Client</span>
              <span className="text-white font-medium">{invoice.organization.name}</span>
            </div>
            {invoice.project && (
              <div className="flex justify-between">
                <span className="text-slate-400">Project</span>
                <span className="text-white font-medium">{invoice.project.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Due Date</span>
              <span className="text-white font-medium">{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Created</span>
              <span className="text-white font-medium">{formatDate(invoice.createdAt)}</span>
            </div>
            {invoice.sentAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Sent</span>
                <span className="text-white font-medium">{formatDate(invoice.sentAt)}</span>
              </div>
            )}
            {invoice.paidAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Paid</span>
                <span className="text-white font-medium">{formatDate(invoice.paidAt)}</span>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Amount Summary">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white font-medium">{formatCurrency(invoice.amount)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Tax</span>
                <span className="text-white font-medium">{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-white font-semibold">Total</span>
              <span className="text-white font-semibold text-lg">
                {formatCurrency(invoice.total)} {invoice.currency}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Invoice Items */}
      {invoice.items.length > 0 && (
        <SectionCard title="Line Items">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-sm font-medium text-slate-400">Description</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-slate-400">Quantity</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-slate-400">Rate</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-2 px-3 text-white">{item.description}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{item.quantity}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{formatCurrency(item.rate)}</td>
                    <td className="py-2 px-3 text-right text-white font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <SectionCard title="Payment History">
          <div className="space-y-3">
            {invoice.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/5"
              >
                <div>
                  <div className="text-white font-medium">
                    {formatCurrency(payment.amount)} {payment.currency}
                  </div>
                  <div className="text-xs text-slate-400">
                    {payment.method || "Unknown method"} • {formatDate(payment.processedAt || payment.createdAt)}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    payment.status === "COMPLETED"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : payment.status === "PENDING"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Description */}
      {invoice.description && (
        <SectionCard title="Description">
          <p className="text-slate-300">{invoice.description}</p>
        </SectionCard>
      )}
    </div>
  );
}









