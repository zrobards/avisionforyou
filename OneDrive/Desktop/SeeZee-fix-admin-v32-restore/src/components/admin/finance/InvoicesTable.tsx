"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Send,
  Check,
  X,
  ExternalLink,
  Eye,
  Mail,
} from "lucide-react";
import { format, isPast } from "date-fns";

interface Invoice {
  id: string;
  number: string;
  title: string;
  status: string;
  total: number;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
  organization: { id: string; name: string };
  project: { id: string; name: string } | null;
}

interface InvoicesTableProps {
  invoices: Invoice[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED: "bg-gray-500/20 text-gray-500 border-gray-500/30",
};

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-reminder`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Reminder sent successfully!");
      }
    } catch (error) {
      console.error("Failed to send reminder:", error);
    }
    setOpenMenuId(null);
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID", paidAt: new Date() }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to mark as paid:", error);
    }
    setOpenMenuId(null);
  };

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-700 bg-[#151b2e] p-12 text-center">
        <p className="text-gray-400">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-gray-700 glass-effect overflow-hidden">
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-gray-700 bg-[#1a2235]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Invoice
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {invoices.map((invoice, index) => {
              const dueDate = new Date(invoice.dueDate);
              const isOverdue =
                isPast(dueDate) && invoice.status !== "PAID";

              return (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-[#1a2235] transition-colors"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/pipeline/invoices/${invoice.id}`}
                      className="flex flex-col"
                    >
                      <span className="text-sm font-semibold text-white hover:text-trinity-red transition">
                        {invoice.number}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {invoice.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white">
                        {invoice.organization.name}
                      </span>
                      {invoice.project && (
                        <span className="text-xs text-gray-500">
                          {invoice.project.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-white">
                      {currencyFormatter.format(invoice.total)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-sm ${
                        isOverdue ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      {format(dueDate, "MMM d, yyyy")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        statusStyles[invoice.status] || statusStyles.DRAFT
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === invoice.id ? null : invoice.id
                          )
                        }
                        className="p-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>

                      {openMenuId === invoice.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg border-2 border-gray-700 bg-[#151b2e] shadow-xl z-10">
                          <Link
                            href={`/admin/pipeline/invoices/${invoice.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2235] hover:text-white transition"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                          {invoice.status !== "PAID" && (
                            <>
                              <button
                                onClick={() => handleSendReminder(invoice.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2235] hover:text-white transition"
                              >
                                <Mail className="w-4 h-4" />
                                Send Reminder
                              </button>
                              <button
                                onClick={() => handleMarkPaid(invoice.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-[#1a2235] transition"
                              >
                                <Check className="w-4 h-4" />
                                Mark as Paid
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvoicesTable;






