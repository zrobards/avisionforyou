"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Sparkles, RefreshCw } from "lucide-react";

interface DraftEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  prospectName: string;
  prospectEmail: string;
  onSend: (subject: string, body: string) => void;
}

export function DraftEmailModal({
  isOpen,
  onClose,
  prospectId,
  prospectName,
  prospectEmail,
  onSend,
}: DraftEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fromEmail] = useState("sean@see-zee.com");

  useEffect(() => {
    if (isOpen && prospectId) {
      generateDraft();
    }
  }, [isOpen, prospectId]);

  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/prospects/${prospectId}/draft-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to generate email");
      }

      const data = await res.json();
      setSubject(data.subject || "");
      setBody(data.draft || data.body || "");
    } catch (error) {
      console.error("Error generating draft:", error);
      alert("Failed to generate email draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      alert("Please fill in subject and body");
      return;
    }
    // Show the email in a confirmation modal via onSend callback
    // The parent component will handle showing the send confirmation modal
    onSend(subject, body);
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
                Draft Outreach Email
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* To/From */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  TO
                </label>
                <div className="text-white">
                  {prospectName}
                  <br />
                  <span className="text-gray-400">{prospectEmail}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  FROM
                </label>
                <select
                  value={fromEmail}
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled
                >
                  <option value={fromEmail}>{fromEmail}</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SUBJECT
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                MESSAGE
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email body..."
                rows={15}
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
            </div>

            {/* AI Tips */}
            <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/10">
              <h4 className="text-sm font-semibold text-purple-300 mb-2">
                💡 AI Tips
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Email has been personalized with prospect-specific details</li>
                <li>• Review and edit before sending</li>
                <li>• Ensure all placeholders are replaced</li>
                <li>• Check tone matches your brand voice</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generateDraft}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
                />
                Regenerate with AI
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-800 bg-[#0a0e1a] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!subject.trim() || !body.trim() || isGenerating}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              Send Now →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

