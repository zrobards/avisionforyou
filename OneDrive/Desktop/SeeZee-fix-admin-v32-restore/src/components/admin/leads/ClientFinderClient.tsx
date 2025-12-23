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
  Mail,
  Phone,
  ExternalLink,
  Target,
  Sparkles,
  X,
  Send,
} from "lucide-react";
import { LeadsMap } from "./LeadsMap";
import { LeadsList } from "./LeadsList";
import { LeadScoreCard } from "./LeadScoreCard";
import { AddLeadModal } from "./AddLeadModal";
import { ReachOutModal } from "./ReachOutModal";
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
  tags: string[];
  createdAt: Date;
  address: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface Stats {
  total: number;
  hot: number;
  warm: number;
  contacted: number;
  converted: number;
  prospects?: number;
}

interface ClientFinderClientProps {
  initialLeads: Lead[];
  initialProspects?: Prospect[];
  stats: Stats;
  categories: string[];
  states: string[];
}

export function ClientFinderClient({
  initialLeads,
  initialProspects = [],
  stats,
  categories,
  states,
}: ClientFinderClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [tab, setTab] = useState<"leads" | "prospects">("prospects"); // Show prospects by default
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [showReachOutModal, setShowReachOutModal] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any>(null);

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

  // Filter prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter((prospect) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          prospect.name?.toLowerCase().includes(query) ||
          prospect.company?.toLowerCase().includes(query) ||
          prospect.email?.toLowerCase().includes(query) ||
          prospect.city?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (selectedState !== "all" && prospect.state !== selectedState) return false;
      if (selectedCategory !== "all" && prospect.category !== selectedCategory) return false;
      if (prospect.leadScore < minScore) return false;

      return true;
    });
  }, [prospects, searchQuery, selectedState, selectedCategory, minScore]);

  const handleDiscoverPlaces = async (searchParams: {
    location: string;
    radius: number;
    type: string;
    keyword: string;
    analyzeWithAI: boolean;
    filters: {
      hasWebsite?: boolean;
      minRating?: number;
      minReviews?: number;
    };
  }) => {
    setIsDiscovering(true);
    setDiscoveryResults(null);

    try {
      const res = await fetch("/api/leads/discover-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      });

      const data = await res.json();

      if (data.success) {
        setDiscoveryResults(data);
        
        // Refresh prospects after discovery
        if (data.prospects && data.prospects.length > 0) {
          // Reload page to show new prospects
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        alert(data.error || "Discovery failed");
      }
    } catch (error) {
      console.error("Discovery failed:", error);
      alert("Discovery failed");
    } finally {
      setIsDiscovering(false);
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
            onClick={() => setShowDiscoverModal(true)}
            disabled={isDiscovering}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {isDiscovering ? "Discovering..." : "🔍 Discover from Google"}
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
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { label: "Prospects", value: stats.prospects || 0, color: "text-purple-400" },
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setTab("prospects")}
          className={`px-4 py-2 font-medium transition ${
            tab === "prospects"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Prospects ({prospects.length})
        </button>
        <button
          onClick={() => setTab("leads")}
          className={`px-4 py-2 font-medium transition ${
            tab === "leads"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Leads ({leads.length})
        </button>
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

        {/* Status Filter - Only show for leads tab */}
        {tab === "leads" && (
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
        )}

        {/* View Toggle - Only show for leads tab */}
        {tab === "leads" && (
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
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map or List */}
        <div className={viewMode === "map" ? "lg:col-span-3" : "lg:col-span-5"}>
          {tab === "prospects" ? (
            // Prospects List
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
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredProspects.map((prospect) => (
                      <motion.tr
                        key={prospect.id}
                        whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                        className="cursor-pointer"
                        onClick={() => setSelectedProspect(prospect)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">
                            {prospect.company || prospect.name}
                          </div>
                          {prospect.email && (
                            <div className="text-sm text-gray-400">{prospect.email}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {prospect.category || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {[prospect.city, prospect.state].filter(Boolean).join(", ") || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${getScoreColor(prospect.leadScore)}20`,
                              color: getScoreColor(prospect.leadScore),
                            }}
                          >
                            {prospect.leadScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProspect(prospect);
                              setShowReachOutModal(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 transition"
                          >
                            <Send className="w-4 h-4" />
                            Reach Out
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredProspects.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                          No prospects found. Use "Discover from Google" to find new prospects.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewMode === "map" ? (
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
        {viewMode === "map" && tab === "leads" && (
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

      {/* Google Places Discovery Modal */}
      {showDiscoverModal && (
        <PlacesDiscoveryModal
          onClose={() => setShowDiscoverModal(false)}
          onDiscover={handleDiscoverPlaces}
          isDiscovering={isDiscovering}
          results={discoveryResults}
        />
      )}

      {/* Reach Out Modal */}
      <ReachOutModal
        prospect={selectedProspect}
        isOpen={showReachOutModal}
        onClose={() => {
          setShowReachOutModal(false);
          setSelectedProspect(null);
        }}
        onSuccess={() => {
          // Remove prospect from list and refresh
          setProspects(prospects.filter((p) => p.id !== selectedProspect?.id));
          window.location.reload();
        }}
      />
    </div>
  );
}

// Google Places Discovery Modal
function PlacesDiscoveryModal({
  onClose,
  onDiscover,
  isDiscovering,
  results,
}: {
  onClose: () => void;
  onDiscover: (params: any) => void;
  isDiscovering: boolean;
  results: any;
}) {
  const [location, setLocation] = useState("Louisville, KY");
  const [radius, setRadius] = useState(16000); // 10 miles
  const [type, setType] = useState("nonprofit");
  const [keyword, setKeyword] = useState("charity OR community");
  const [analyzeWithAI, setAnalyzeWithAI] = useState(true);
  const [hasWebsite, setHasWebsite] = useState<string>("any"); // Changed from "no" to get all first
  const [minRating, setMinRating] = useState(0); // Changed from 4.0 to accept all
  const [minReviews, setMinReviews] = useState(0); // Changed from 10 to accept all

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: any = {};
    if (hasWebsite === "no") filters.hasWebsite = false;
    if (hasWebsite === "yes") filters.hasWebsite = true;
    if (minRating > 0) filters.minRating = minRating;
    if (minReviews > 0) filters.minReviews = minReviews;

    onDiscover({
      location,
      radius,
      type,
      keyword,
      analyzeWithAI,
      filters,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-4 rounded-2xl border-2 border-gray-700 bg-[#151b2e] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Discover Leads with Google Places
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Find businesses and nonprofits in real-time with AI-powered analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {results ? (
          // Show results
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-green-500/30 bg-green-500/10 p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                ✅ Discovery Complete!
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Found</p>
                  <p className="text-2xl font-bold text-white">{results.totalFound}</p>
                </div>
                <div>
                  <p className="text-gray-400">After Filters</p>
                  <p className="text-2xl font-bold text-white">{results.filtered}</p>
                </div>
                <div>
                  <p className="text-gray-400">AI Analyzed</p>
                  <p className="text-2xl font-bold text-blue-400">{results.analyzed}</p>
                </div>
                <div>
                  <p className="text-gray-400">New Prospects Saved</p>
                  <p className="text-2xl font-bold text-green-400">{results.saved}</p>
                </div>
              </div>
              {results.skippedExisting > 0 && (
                <p className="text-xs text-gray-400 mt-3">
                  Skipped {results.skippedExisting} existing prospects/leads
                </p>
              )}
            </div>

            {results.prospects?.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.prospects.map((prospect: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-700 bg-[#1a2235] p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{prospect.name}</p>
                        <p className="text-xs text-gray-400">{prospect.category}</p>
                        <p className="text-xs text-gray-500 mt-1">{prospect.address}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: prospect.leadScore >= 80 ? "#10b98120" : prospect.leadScore >= 60 ? "#fbbf2420" : "#3b82f620",
                            color: prospect.leadScore >= 80 ? "#10b981" : prospect.leadScore >= 60 ? "#fbbf24" : "#3b82f6"
                          }}
                        >
                          {prospect.leadScore}
                        </span>
                        <span className="text-xs text-gray-500">{prospect.urgencyLevel}</span>
                      </div>
                    </div>
                    {prospect.opportunities?.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        💡 {prospect.opportunities[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 transition"
            >
              View All Prospects
            </button>
          </div>
        ) : (
          // Show form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Louisville, KY"
                  required
                  className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Radius
                </label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="8000">5 miles</option>
                  <option value="16000">10 miles</option>
                  <option value="32000">20 miles</option>
                  <option value="50000">31 miles (max)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="nonprofit">Nonprofit / Charity</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="store">Retail Store</option>
                  <option value="gym">Gym / Fitness</option>
                  <option value="spa">Spa / Salon</option>
                  <option value="lawyer">Law Firm</option>
                  <option value="doctor">Medical Practice</option>
                  <option value="dentist">Dental Practice</option>
                  <option value="school">School / Education</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website Status
                </label>
                <select
                  value={hasWebsite}
                  onChange={(e) => setHasWebsite(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="no">No Website (Best Leads)</option>
                  <option value="any">Any</option>
                  <option value="yes">Has Website</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords (Optional)
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., charity OR foundation OR community"
                className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="0">Any Rating</option>
                  <option value="3.0">3.0+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Reviews
                </label>
                <select
                  value={minReviews}
                  onChange={(e) => setMinReviews(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-[#1a2235] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="0">Any</option>
                  <option value="10">10+ Reviews</option>
                  <option value="50">50+ Reviews</option>
                  <option value="100">100+ Reviews</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-[#1a2235] p-4">
              <input
                type="checkbox"
                id="analyzeWithAI"
                checked={analyzeWithAI}
                onChange={(e) => setAnalyzeWithAI(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="analyzeWithAI" className="flex-1 text-sm text-gray-300">
                <span className="font-semibold text-white">Analyze with AI</span>
                <br />
                Uses Claude to score leads, identify opportunities, and generate insights
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isDiscovering}
                className="flex-1 rounded-lg border-2 border-gray-700 bg-[#1a2235] px-4 py-3 font-semibold text-white hover:border-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDiscovering}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDiscovering ? (
                  <>
                    <span className="animate-pulse">Discovering...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="inline w-4 h-4 mr-2" />
                    Discover Leads
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Estimated time: 30-60 seconds • Cost: ~$0.10-0.30 per search
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default ClientFinderClient;

