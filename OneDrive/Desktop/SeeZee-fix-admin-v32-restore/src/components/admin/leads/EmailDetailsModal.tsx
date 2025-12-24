"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { EmailStatus } from "@prisma/client";

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
}

interface EmailDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: SentEmail;
  prospectName: string;
}

export function EmailDetailsModal({
  isOpen,
  onClose,
  email,
  prospectName,
}: EmailDetailsModalProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Not yet";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusIcon = () => {
    switch (email.status) {
      case "DELIVERED":
      case "OPENED":
      case "CLICKED":
      case "REPLIED":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "SENT":
        return <Clock className="w-5 h-5 text-blue-400" />;
      case "BOUNCED":
      case "FAILED":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Mail className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (email.status) {
      case "DELIVERED":
      case "OPENED":
      case "CLICKED":
      case "REPLIED":
        return "text-green-400";
      case "SENT":
        return "text-blue-400";
      case "BOUNCED":
      case "FAILED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-heading font-bold text-white">
                Email to {prospectName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-700 bg-gray-900">
              {getStatusIcon()}
              <div>
                <div className={`font-medium ${getStatusColor()}`}>
                  {email.status === "DELIVERED" && !email.openedAt
                    ? "✅ Delivered (Not yet opened)"
                    : email.status === "OPENED"
                    ? "✅ Opened"
                    : email.status === "REPLIED"
                    ? "✅ Replied"
                    : email.status === "BOUNCED"
                    ? "⚠️ Bounced"
                    : email.status === "FAILED"
                    ? "❌ Failed"
                    : `✅ ${email.status}`}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">📅 Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Drafted:</span>
                  <span className="text-white">{formatDate(email.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sent:</span>
                  <span className="text-white">{formatDate(email.sentAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivered:</span>
                  <span className="text-white">{formatDate(email.deliveredAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Opened:</span>
                  <span className="text-white">{formatDate(email.openedAt)}</span>
                </div>
                {email.clickedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clicked:</span>
                    <span className="text-white">{formatDate(email.clickedAt)}</span>
                  </div>
                )}
                {email.repliedAt && (
                  <div className="flex justify-between">
                    <span className="text-green-400">Replied:</span>
                    <span className="text-green-400">{formatDate(email.repliedAt)}</span>
                  </div>
                )}
                {email.bouncedAt && (
                  <div className="flex justify-between">
                    <span className="text-red-400">Bounced:</span>
                    <span className="text-red-400">{formatDate(email.bouncedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Email Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  FROM
                </label>
                <div className="text-white">{email.from}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  TO
                </label>
                <div className="text-white">{email.to}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  SUBJECT
                </label>
                <div className="text-white">{email.subject}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  MESSAGE
                </label>
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-900 text-white whitespace-pre-wrap font-mono text-sm">
                  {email.body}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


