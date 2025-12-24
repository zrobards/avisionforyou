"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Mail, Sparkles, Send } from "lucide-react";

interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  websiteUrl: string | null;
  hasWebsite: boolean;
  leadScore: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  variables: string[];
}

interface ReachOutModalProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReachOutModal({
  prospect,
  isOpen,
  onClose,
  onSuccess,
}: ReachOutModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [useAIGenerated, setUseAIGenerated] = useState(true);
  const [aiEmail, setAiEmail] = useState<{ subject: string; body: string } | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customEmail, setCustomEmail] = useState({ subject: "", body: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch email templates
  useEffect(() => {
    if (isOpen) {
      fetch("/api/templates?category=CLIENT_OUTREACH")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTemplates(data.templates || []);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // Generate AI email when prospect changes
  useEffect(() => {
    if (isOpen && prospect && useAIGenerated) {
      generateAIEmail();
    }
  }, [isOpen, prospect?.id, useAIGenerated]);

  const generateAIEmail = async () => {
    if (!prospect) return;
    
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/prospects/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: prospect.id }),
      });
      const data = await res.json();
      if (data.subject && data.body) {
        setAiEmail({ subject: data.subject, body: data.body });
        setCustomEmail({ subject: data.subject, body: data.body });
      }
    } catch (error) {
      console.error("Failed to generate AI email:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!prospect) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        prospectId: prospect.id,
      };

      if (selectedTemplateId) {
        payload.emailTemplateId = selectedTemplateId;
      } else if (useAIGenerated && aiEmail) {
        payload.customEmail = {
          subject: aiEmail.subject,
          body: aiEmail.body,
        };
      } else {
        payload.customEmail = {
          subject: customEmail.subject || "Reaching out from SeeZee Studio",
          body: customEmail.body,
        };
      }

      const res = await fetch("/api/prospects/reachout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.error || "Failed to reach out");
      }
    } catch (error) {
      console.error("Failed to reach out:", error);
      alert("Failed to reach out");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !prospect) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-4 rounded-2xl border-2 border-gray-700 bg-[#151b2e] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Send className="w-6 h-6 text-purple-500" />
              Reach Out to {prospect.name}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Convert this prospect to a lead and send an email
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prospect Info */}
          <div className="rounded-lg border border-gray-700 bg-[#1a2235] p-4">
            <h3 className="font-semibold text-white mb-2">Prospect Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Category:</span>{" "}
                <span className="text-white">{prospect.category || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-400">Location:</span>{" "}
                <span className="text-white">
                  {[prospect.city, prospect.state].filter(Boolean).join(", ") || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>{" "}
                <span className="text-white">{prospect.email || "Not available"}</span>
              </div>
              <div>
                <span className="text-gray-400">Score:</span>{" "}
                <span className="text-white">{prospect.leadScore}</span>
              </div>
            </div>
          </div>

          {/* Email Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Email Options</h3>

            {/* Template Selection */}
            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Use Email Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setUseAIGenerated(false);
                  }}
                  className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* AI Generated */}
            <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-[#1a2235] p-4">
              <input
                type="checkbox"
                id="useAIGenerated"
                checked={useAIGenerated && !selectedTemplateId}
                onChange={(e) => {
                  setUseAIGenerated(e.target.checked);
                  if (e.target.checked) {
                    setSelectedTemplateId("");
                    generateAIEmail();
                  }
                }}
                disabled={!!selectedTemplateId}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="useAIGenerated" className="flex-1 text-sm text-gray-300">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI-Generated Email
                </span>
                <br />
                <span className="text-gray-400">
                  Generate a personalized email using AI
                </span>
              </label>
              {isGeneratingAI && (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
              )}
            </div>

            {/* Custom Email Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={customEmail.subject}
                onChange={(e) =>
                  setCustomEmail({ ...customEmail, subject: e.target.value })
                }
                placeholder="Email subject..."
                className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Body
              </label>
              <textarea
                value={customEmail.body}
                onChange={(e) =>
                  setCustomEmail({ ...customEmail, body: e.target.value })
                }
                placeholder="Email body..."
                rows={10}
                className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border-2 border-gray-700 bg-[#1a2235] px-4 py-3 font-semibold text-white hover:border-gray-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!selectedTemplateId && !customEmail.body)}
            className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Converting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Reach Out & Convert to Lead
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}




