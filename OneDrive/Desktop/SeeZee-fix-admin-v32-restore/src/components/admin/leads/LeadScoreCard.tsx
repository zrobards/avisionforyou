"use client";

import { X, Mail, Phone, Globe, MapPin, Target, Send, Sparkles } from "lucide-react";
import { getScoreColor, getScoreLabel, calculateLeadScoreDetailed } from "@/lib/leads/scoring";
import { useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  status: string;
  leadScore: number;
  hasWebsite: boolean;
  websiteUrl: string | null;
  websiteQuality: string | null;
  category: string | null;
  annualRevenue?: number | null;
  employeeCount?: number | null;
  city: string | null;
  state: string | null;
}

interface LeadScoreCardProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadScoreCard({ lead, onClose }: LeadScoreCardProps) {
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [outreachEmail, setOutreachEmail] = useState<string | null>(null);

  const scoreResult = calculateLeadScoreDetailed({
    hasWebsite: lead.hasWebsite,
    websiteQuality: lead.websiteQuality as "POOR" | "FAIR" | "GOOD" | "EXCELLENT" | null | undefined,
    annualRevenue: lead.annualRevenue,
    category: lead.category,
    city: lead.city,
    state: lead.state,
    employeeCount: lead.employeeCount,
  });

  const handleGenerateOutreach = async () => {
    setIsGeneratingOutreach(true);
    try {
      const res = await fetch("/api/leads/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.success) {
        setOutreachEmail(data.email);
      } else {
        alert(data.error || "Failed to generate outreach email");
      }
    } catch (error) {
      console.error("Failed to generate outreach:", error);
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  const handleContactLead = async () => {
    try {
      await fetch(`/api/leads/${lead.id}/contact`, { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to log contact:", error);
    }
  };

  return (
    <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-trinity-red/20 to-transparent border-b border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {lead.company || lead.name}
            </h3>
            <p className="text-sm text-gray-400">{lead.category || "Uncategorized"}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: getScoreColor(lead.leadScore) }}
          >
            {lead.leadScore}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {getScoreLabel(lead.leadScore).label}
            </p>
            <p className="text-sm text-gray-400">{scoreResult.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-4 border-b border-gray-800">
        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Score Breakdown
        </h4>
        <div className="space-y-2">
          {[
            { label: "Website Opportunity", value: scoreResult.breakdown.websiteScore, max: 30 },
            { label: "Revenue Potential", value: scoreResult.breakdown.revenueScore, max: 25 },
            { label: "Category Fit", value: scoreResult.breakdown.categoryScore, max: 20 },
            { label: "Location", value: scoreResult.breakdown.locationScore, max: 15 },
            { label: "Organization Size", value: scoreResult.breakdown.sizeScore, max: 10 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-32">{item.label}</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-trinity-red"
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">
                {item.value}/{item.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 border-b border-gray-800 space-y-2">
        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Contact
        </h4>
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <Mail className="w-4 h-4" />
            {lead.email}
          </a>
        )}
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <Phone className="w-4 h-4" />
            {lead.phone}
          </a>
        )}
        {lead.websiteUrl && (
          <a
            href={lead.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <Globe className="w-4 h-4" />
            Visit Website
          </a>
        )}
        {lead.city && lead.state && (
          <p className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            {lead.city}, {lead.state}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={handleGenerateOutreach}
          disabled={isGeneratingOutreach}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-trinity-red text-white hover:bg-trinity-maroon disabled:opacity-50 transition"
        >
          <Sparkles className="w-4 h-4" />
          {isGeneratingOutreach ? "Generating..." : "Generate AI Outreach"}
        </button>
        <button
          onClick={handleContactLead}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition"
        >
          <Send className="w-4 h-4" />
          Log Contact Attempt
        </button>
      </div>

      {/* Generated Outreach */}
      {outreachEmail && (
        <div className="p-4 border-t border-gray-800 bg-[#1a2235]">
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            Generated Outreach Email
          </h4>
          <div className="p-3 rounded-lg bg-[#151b2e] border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
            {outreachEmail}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(outreachEmail);
              alert("Copied to clipboard!");
            }}
            className="mt-2 text-xs text-trinity-red hover:text-trinity-maroon"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default LeadScoreCard;

