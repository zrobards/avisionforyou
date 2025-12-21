"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Upload,
  MapPin,
  Building2,
  Globe,
  Phone,
  Mail,
  DollarSign,
  Users,
  Tag,
  Calendar,
  ChevronRight,
  X,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Send,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getScoreLabel, getMarkerColor } from "@/lib/leads/scoring";
import { LeadsMap } from "@/components/admin/leads/LeadsMap";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string | null;
  createdAt: Date;
  ein: string | null;
  websiteUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  subcategory: string | null;
  annualRevenue: number | null;
  employeeCount: number | null;
  leadScore: number;
  hasWebsite: boolean;
  websiteQuality: string | null;
  needsAssessment: any;
  lastContactedAt: Date | null;
  emailsSent: number;
  tags: string[];
}

interface Stats {
  total: number;
  hot: number;
  warm: number;
  contacted: number;
  withWebsite: number;
  withoutWebsite: number;
}

interface LeadFinderClientProps {
  initialLeads: Lead[];
  stats: Stats;
  categories: string[];
  states: string[];
}

export function LeadFinderClient({
  initialLeads,
  stats,
  categories,
  states,
}: LeadFinderClientProps) {
  const [leads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [websiteFilter, setWebsiteFilter] = useState<"all" | "yes" | "no">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          lead.name?.toLowerCase().includes(search) ||
          lead.company?.toLowerCase().includes(search) ||
          lead.city?.toLowerCase().includes(search) ||
          lead.email?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // State filter
      if (selectedState && lead.state !== selectedState) return false;

      // Category filter
      if (selectedCategory && lead.category !== selectedCategory) return false;

      // Score filter
      if (lead.leadScore < minScore) return false;

      // Status filter
      if (selectedStatus && lead.status !== selectedStatus) return false;

      // Website filter
      if (websiteFilter === "yes" && !lead.hasWebsite) return false;
      if (websiteFilter === "no" && lead.hasWebsite) return false;

      return true;
    });
  }, [leads, searchTerm, selectedState, selectedCategory, minScore, selectedStatus, websiteFilter]);

  // Open lead detail modal
  const openLeadDetail = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
    setGeneratedEmail(null);
  }, []);

  // Generate AI outreach email
  const generateOutreachEmail = async () => {
    if (!selectedLead) return;

    setIsGeneratingEmail(true);
    try {
      const response = await fetch("/api/leads/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLead.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedEmail(data);
      }
    } catch (error) {
      console.error("Failed to generate email:", error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Mark as contacted
  const markAsContacted = async () => {
    if (!selectedLead) return;

    try {
      await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONTACTED",
          emailsSent: selectedLead.emailsSent + 1,
          lastContactedAt: new Date().toISOString(),
        }),
      });

      // Refresh the page to update data
      window.location.reload();
    } catch (error) {
      console.error("Failed to update lead:", error);
    }
  };

  // Copy email to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Export filtered leads as CSV
  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "City", "State", "Category", "Score", "Has Website", "Revenue", "Employees"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email || "",
      lead.phone || "",
      lead.city || "",
      lead.state || "",
      lead.category || "",
      lead.leadScore.toString(),
      lead.hasWebsite ? "Yes" : "No",
      lead.annualRevenue?.toString() || "",
      lead.employeeCount?.toString() || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-cyan-400" />
            Nonprofit Finder
          </h1>
          <p className="text-slate-400 mt-1">
            Discover nonprofit organizations that need websites
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-800 border border-white/10 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import IRS Data
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-slate-800 border border-white/10 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatsCard label="Total Leads" value={stats.total} icon={Building2} />
        <StatsCard label="Hot (80+)" value={stats.hot} icon={Sparkles} color="red" />
        <StatsCard label="Warm (60+)" value={stats.warm} icon={Sparkles} color="amber" />
        <StatsCard label="Contacted" value={stats.contacted} icon={Send} color="blue" />
        <StatsCard label="No Website" value={stats.withoutWebsite} icon={AlertTriangle} color="green" />
        <StatsCard label="Has Website" value={stats.withWebsite} icon={Globe} color="slate" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* State Filter */}
          <select
            value={selectedState || ""}
            onChange={(e) => setSelectedState(e.target.value || null)}
            className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Score Filter */}
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value={0}>All Scores</option>
            <option value={40}>40+ (Cool+)</option>
            <option value={60}>60+ (Warm+)</option>
            <option value={80}>80+ (Hot)</option>
          </select>

          {/* Website Filter */}
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value as any)}
            className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Websites</option>
            <option value="no">No Website</option>
            <option value="yes">Has Website</option>
          </select>

          {/* Clear Filters */}
          {(searchTerm || selectedState || selectedCategory || minScore > 0 || websiteFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState(null);
                setSelectedCategory(null);
                setMinScore(0);
                setWebsiteFilter("all");
              }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <LeadsMap
          leads={filteredLeads}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLead}
        />

        {/* Lead List */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Organizations ({filteredLeads.length})
              </h2>
              <span className="text-sm text-slate-400">
                Sorted by score (highest first)
              </span>
            </div>
          </div>

          <div className="overflow-y-auto h-[520px] divide-y divide-white/5">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No organizations match your filters</p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const scoreInfo = getScoreLabel(lead.leadScore);
                return (
                  <div
                    key={lead.id}
                    onClick={() => openLeadDetail(lead)}
                    className="p-4 hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                            {lead.name || lead.company || "Unknown Organization"}
                          </h3>
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${getMarkerColor(lead.leadScore)}20`,
                              color: getMarkerColor(lead.leadScore),
                              border: `1px solid ${getMarkerColor(lead.leadScore)}40`,
                            }}
                          >
                            {lead.leadScore} {scoreInfo.emoji}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                          {lead.category && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {lead.category}
                            </span>
                          )}
                          {(lead.city || lead.state) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {[lead.city, lead.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                          {!lead.hasWebsite && (
                            <span className="text-green-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              No website
                            </span>
                          )}
                          {lead.hasWebsite && lead.websiteQuality && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {lead.websiteQuality} website
                            </span>
                          )}
                        </div>
                        {lead.annualRevenue && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <DollarSign className="w-3 h-3" />
                            ${(lead.annualRevenue / 1000).toFixed(0)}K annual revenue
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedLead.name || selectedLead.company}
                    </h2>
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full"
                      style={{
                        backgroundColor: `${getMarkerColor(selectedLead.leadScore)}20`,
                        color: getMarkerColor(selectedLead.leadScore),
                        border: `1px solid ${getMarkerColor(selectedLead.leadScore)}40`,
                      }}
                    >
                      {selectedLead.leadScore}/100 {getScoreLabel(selectedLead.leadScore).emoji}
                    </span>
                  </div>
                  <p className="text-slate-400">{selectedLead.category || "Nonprofit Organization"}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-200px)]">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedLead.email && (
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <Mail className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-white">{selectedLead.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-white">{selectedLead.phone}</p>
                      </div>
                    </div>
                  )}
                  {(selectedLead.city || selectedLead.state) && (
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="text-white">
                          {[selectedLead.address, selectedLead.city, selectedLead.state, selectedLead.zipCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedLead.websiteUrl && (
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-500">Website</p>
                        <a
                          href={selectedLead.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          Visit Site <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Financials */}
                {(selectedLead.annualRevenue || selectedLead.employeeCount) && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Financials</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLead.annualRevenue && (
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-xs text-slate-500">Annual Revenue</p>
                            <p className="text-white font-semibold">
                              ${selectedLead.annualRevenue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedLead.employeeCount && (
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                          <Users className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-xs text-slate-500">Employees</p>
                            <p className="text-white font-semibold">{selectedLead.employeeCount}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Website Analysis */}
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Website Analysis</h3>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    {!selectedLead.hasWebsite ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">No website found</p>
                          <p className="text-sm text-slate-400">
                            This organization needs a website - perfect opportunity!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Quality</span>
                          <span
                            className={`font-medium ${
                              selectedLead.websiteQuality === "POOR"
                                ? "text-red-400"
                                : selectedLead.websiteQuality === "FAIR"
                                ? "text-amber-400"
                                : selectedLead.websiteQuality === "GOOD"
                                ? "text-green-400"
                                : "text-cyan-400"
                            }`}
                          >
                            {selectedLead.websiteQuality || "Unknown"}
                          </span>
                        </div>
                        {selectedLead.needsAssessment?.issues && (
                          <div>
                            <p className="text-sm text-slate-500 mb-2">Issues Found:</p>
                            <div className="flex flex-wrap gap-2">
                              {(selectedLead.needsAssessment.issues as string[]).map((issue, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-md"
                                >
                                  {issue}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Generated Email */}
                {generatedEmail && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Generated Outreach Email</h3>
                    <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Subject:</p>
                        <p className="text-white font-medium">{generatedEmail.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Body:</p>
                        <p className="text-slate-300 whitespace-pre-wrap text-sm">{generatedEmail.body}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                        >
                          Copy to Clipboard
                        </button>
                        <button
                          onClick={markAsContacted}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Contacted
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedLead.tags && selectedLead.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={generateOutreachEmail}
                  disabled={isGeneratingEmail}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Outreach Email
                    </>
                  )}
                </button>
                {selectedLead.status !== "CONTACTED" && (
                  <button
                    onClick={markAsContacted}
                    className="px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Contacted
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  label,
  value,
  icon: Icon,
  color = "cyan",
}: {
  label: string;
  value: number;
  icon: any;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    cyan: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
    red: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400",
    amber: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
    blue: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    slate: "from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-400",
  };

  return (
    <div
      className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs opacity-80">{label}</p>
        </div>
      </div>
    </div>
  );
}

