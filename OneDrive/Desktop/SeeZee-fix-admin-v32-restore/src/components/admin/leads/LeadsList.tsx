"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  MoreVertical,
  Eye,
  Send,
  CheckCircle,
  X,
} from "lucide-react";
import { getScoreColor, getScoreLabel } from "@/lib/leads/scoring";

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
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  lastContactedAt: Date | null;
  createdAt: Date;
  // Additional fields for compatibility
  source: string | null;
  ein: string | null;
  address: string | null;
  zipCode: string | null;
  subcategory: string | null;
  annualRevenue: number | null;
  employeeCount: number | null;
  needsAssessment: any;
  emailsSent: number;
}

interface LeadsListProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead | null) => void;
}

const statusStyles: Record<string, string> = {
  NEW: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  CONTACTED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  QUALIFIED: "bg-green-500/20 text-green-400 border-green-500/30",
  PROPOSAL_SENT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CONVERTED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  LOST: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function LeadsList({ leads, selectedLead, onSelectLead }: LeadsListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setOpenMenuId(null);
  };

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-700 bg-[#151b2e] p-12 text-center">
        <p className="text-gray-400">No leads match your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-gray-700 glass-effect overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 bg-[#1a2235]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Organization
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Website
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Contact
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {leads.map((lead, index) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onSelectLead(lead)}
                className={`cursor-pointer transition-colors ${
                  selectedLead?.id === lead.id
                    ? "bg-trinity-red/10"
                    : "hover:bg-[#1a2235]"
                }`}
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {lead.company || lead.name}
                    </p>
                    <p className="text-xs text-gray-500">{lead.email}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-400">
                    {lead.category || "—"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {lead.city && lead.state ? (
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {lead.city}, {lead.state}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: getScoreColor(lead.leadScore) }}
                    >
                      {lead.leadScore}
                    </div>
                    <span className="text-xs text-gray-500">
                      {getScoreLabel(lead.leadScore).label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {lead.hasWebsite ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          lead.websiteQuality === "POOR"
                            ? "bg-red-500/20 text-red-400"
                            : lead.websiteQuality === "FAIR"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : lead.websiteQuality === "GOOD"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {lead.websiteQuality || "Unknown"}
                      </span>
                      {lead.websiteUrl && (
                        <a
                          href={lead.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                      No Website
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                      statusStyles[lead.status] || statusStyles.NEW
                    }`}
                  >
                    {lead.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === lead.id ? null : lead.id);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-800 transition"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>

                    {openMenuId === lead.id && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg border-2 border-gray-700 bg-[#151b2e] shadow-xl z-10">
                        <button
                          onClick={() => handleStatusChange(lead.id, "CONTACTED")}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2235] hover:text-white transition"
                        >
                          <Send className="w-4 h-4" />
                          Mark Contacted
                        </button>
                        <button
                          onClick={() => handleStatusChange(lead.id, "QUALIFIED")}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-[#1a2235] transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Qualified
                        </button>
                        <button
                          onClick={() => handleStatusChange(lead.id, "LOST")}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#1a2235] transition"
                        >
                          <X className="w-4 h-4" />
                          Mark Lost
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadsList;

