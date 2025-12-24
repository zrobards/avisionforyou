"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { EmailStatus } from "@prisma/client";
import { EmailDetailsModal } from "./EmailDetailsModal";

interface SentEmail {
  id: string;
  createdAt: Date;
  from: string;
  to: string;
  subject: string;
  body: string;
  status: EmailStatus;
  sentAt: Date | null;
  deliveredAt: Date | null;
  openedAt: Date | null;
  clickedAt: Date | null;
  repliedAt: Date | null;
  bouncedAt: Date | null;
  resendId: string | null;
  prospect: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
}

interface EmailsDashboardProps {
  initialEmails: SentEmail[];
}

export function EmailsDashboard({ initialEmails }: EmailsDashboardProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [statusFilter, setStatusFilter] = useState<EmailStatus | "all">("all");
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);

  const filteredEmails = useMemo(() => {
    if (statusFilter === "all") return emails;
    return emails.filter((email) => email.status === statusFilter);
  }, [emails, statusFilter]);

  const getStatusIcon = (status: EmailStatus) => {
    switch (status) {
      case "DELIVERED":
      case "OPENED":
      case "CLICKED":
      case "REPLIED":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "SENT":
        return <Mail className="w-4 h-4 text-blue-400" />;
      case "BOUNCED":
      case "FAILED":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: EmailStatus) => {
    switch (status) {
      case "SENT":
        return "✅ Sent";
      case "DELIVERED":
        return "✅ Delivered";
      case "OPENED":
        return "✅ Opened";
      case "CLICKED":
        return "✅ Clicked";
      case "REPLIED":
        return "✅ Replied";
      case "BOUNCED":
        return "⚠️ Bounced";
      case "FAILED":
        return "❌ Failed";
      default:
        return status;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
            Email Tracking
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">
            Sent Emails
          </h1>
        </div>
        <button
          onClick={() => {
            const csv = [
              ["Date", "To", "Subject", "Status"].join(","),
              ...filteredEmails.map((email) =>
                [
                  formatDate(email.sentAt),
                  email.to,
                  `"${email.subject}"`,
                  email.status,
                ].join(",")
              ),
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `emails-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
          }}
          className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
        >
          Export to CSV
        </button>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {["all", "SENT", "DELIVERED", "OPENED", "REPLIED", "BOUNCED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === status
                  ? "border-purple-500 bg-purple-500/20 text-purple-300"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {status === "all" ? "All" : status}
            </button>
          )
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-700 bg-[#0a0e1a] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Subject
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
            {filteredEmails.map((email) => (
              <motion.tr
                key={email.id}
                whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                className="cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-gray-300">
                  {formatDate(email.sentAt || email.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-white">
                    {email.prospect.company || email.prospect.name}
                  </div>
                  <div className="text-xs text-gray-400">{email.to}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {email.subject}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(email.status)}
                    <span className="text-sm text-gray-300">
                      {getStatusLabel(email.status)}
                    </span>
                  </div>
                  {email.status === "OPENED" && email.openedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Opened {formatDate(email.openedAt)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedEmail(email)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition"
                  >
                    View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filteredEmails.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No emails found matching the selected filter
          </div>
        )}
      </div>

      {/* Email Details Modal */}
      {selectedEmail && (
        <EmailDetailsModal
          isOpen={!!selectedEmail}
          onClose={() => setSelectedEmail(null)}
          email={selectedEmail}
          prospectName={selectedEmail.prospect.company || selectedEmail.prospect.name}
        />
      )}
    </div>
  );
}

