"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  List,
  Grid,
  Plus,
  Download,
  Upload,
  Mail,
  Phone,
  ExternalLink,
  Target,
} from "lucide-react";
import { LeadsMap } from "./LeadsMap";
import { LeadsList } from "./LeadsList";
import { LeadScoreCard } from "./LeadScoreCard";
import { AddLeadModal } from "./AddLeadModal";
import { getScoreLabel, getScoreColor } from "@/lib/leads/scoring";

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
  // Additional fields for compatibility with LeadsMap
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

interface Stats {
  total: number;
  hot: number;
  warm: number;
  contacted: number;
  converted: number;
}

interface ClientFinderClientProps {
  initialLeads: Lead[];
  stats: Stats;
  categories: string[];
  states: string[];
}

export function ClientFinderClient({
  initialLeads,
  stats,
  categories,
  states,
}: ClientFinderClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          lead.name?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.city?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (selectedState !== "all" && lead.state !== selectedState) return false;
      if (selectedCategory !== "all" && lead.category !== selectedCategory) return false;
      if (lead.leadScore < minScore) return false;
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;

      return true;
    });
  }, [leads, searchQuery, selectedState, selectedCategory, minScore, statusFilter]);

  const handleImportIRS = async () => {
    try {
      const res = await fetch("/api/leads/import-irs", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Imported ${data.count} organizations`);
        window.location.reload();
      } else {
        alert(data.error || "Import failed");
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
            Prospect Discovery
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">
            Client Finder
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleImportIRS}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-700 bg-[#151b2e] px-4 py-2.5 text-sm font-medium text-white hover:border-trinity-red/50 transition"
          >
            <Download className="w-4 h-4" />
            Import IRS Data
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-trinity-red px-4 py-2.5 text-sm font-medium text-white hover:bg-trinity-maroon transition"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total Leads", value: stats.total, color: "text-white" },
          { label: "Hot (80+)", value: stats.hot, color: "text-green-400" },
          { label: "Warm (60-79)", value: stats.warm, color: "text-yellow-400" },
          { label: "Contacted", value: stats.contacted, color: "text-blue-400" },
          { label: "Converted", value: stats.converted, color: "text-cyan-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4 text-center"
          >
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className={`text-xs ${stat.color}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border-2 border-gray-700 bg-[#151b2e]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizations..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 bg-[#1a2235] text-white placeholder-gray-500 focus:border-trinity-red focus:outline-none text-sm"
          />
        </div>

        {/* State Filter */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
        >
          <option value="all">All States</option>
          {states.sort().map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.sort().map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Min Score */}
        <select
          value={minScore}
          onChange={(e) => setMinScore(parseInt(e.target.value))}
          className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
        >
          <option value="0">Any Score</option>
          <option value="40">40+ (Cool+)</option>
          <option value="60">60+ (Warm+)</option>
          <option value="80">80+ (Hot)</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="PROPOSAL_SENT">Proposal Sent</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-700 p-1">
          <button
            onClick={() => setViewMode("map")}
            className={`p-2 rounded ${
              viewMode === "map" ? "bg-trinity-red text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <MapPin className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${
              viewMode === "list" ? "bg-trinity-red text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map or List */}
        <div className={viewMode === "map" ? "lg:col-span-3" : "lg:col-span-5"}>
          {viewMode === "map" ? (
            <LeadsMap
              leads={filteredLeads}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
            />
          ) : (
            <LeadsList
              leads={filteredLeads}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
            />
          )}
        </div>

        {/* Side Panel */}
        {viewMode === "map" && (
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">
                  Results ({filteredLeads.length})
                </h3>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredLeads.slice(0, 50).map((lead) => (
                  <motion.div
                    key={lead.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedLead?.id === lead.id
                        ? "border-trinity-red bg-trinity-red/10"
                        : "border-gray-800 bg-[#1a2235] hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {lead.company || lead.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {lead.category || "Uncategorized"}
                        </p>
                        {lead.city && lead.state && (
                          <p className="text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {lead.city}, {lead.state}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${getScoreColor(lead.leadScore)}20`,
                            color: getScoreColor(lead.leadScore),
                          }}
                        >
                          {lead.leadScore}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getScoreLabel(lead.leadScore).label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredLeads.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No leads match your filters
                  </p>
                )}
              </div>
            </div>

            {/* Selected Lead Details */}
            {selectedLead && (
              <LeadScoreCard lead={selectedLead} onClose={() => setSelectedLead(null)} />
            )}
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

export default ClientFinderClient;

