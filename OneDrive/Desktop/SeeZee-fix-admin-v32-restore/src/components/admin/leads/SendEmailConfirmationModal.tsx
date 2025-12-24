"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Check } from "lucide-react";

interface SendEmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectName: string;
  prospectEmail: string;
  subject: string;
  onConfirm: () => void;
  isSending: boolean;
}

export function SendEmailConfirmationModal({
  isOpen,
  onClose,
  prospectName,
  prospectEmail,
  subject,
  onConfirm,
  isSending,
}: SendEmailConfirmationModalProps) {
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
          className="relative w-full max-w-lg rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-heading font-bold text-white">
                Send Email?
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
          <div className="p-6 space-y-4">
            <p className="text-gray-300">
              You're about to send this email to:
            </p>
            <div className="p-4 rounded-lg border border-gray-700 bg-gray-900">
              <div className="font-medium text-white">{prospectName}</div>
              <div className="text-gray-400 text-sm">{prospectEmail}</div>
            </div>
            <div className="p-4 rounded-lg border border-gray-700 bg-gray-900">
              <div className="text-sm text-gray-400 mb-1">Subject:</div>
              <div className="text-white">{subject}</div>
            </div>

            {/* Pre-send Checklist */}
            <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
              <h4 className="text-sm font-semibold text-yellow-300 mb-2">
                ⚠️ BEFORE YOU SEND:
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Email address verified</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Personalization checked (no placeholders)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Links tested</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Tone appropriate for nonprofit</span>
                </li>
              </ul>
            </div>

            {/* Auto-actions */}
            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">
                AFTER SENDING:
              </h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Mark prospect as "CONTACTED"</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Set follow-up reminder for 7 days</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Log activity in timeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Track email opens and clicks</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-6 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSending}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


