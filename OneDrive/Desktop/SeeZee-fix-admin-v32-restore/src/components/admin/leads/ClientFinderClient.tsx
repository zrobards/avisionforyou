"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { DiscoverLeadsModal } from "./DiscoverLeadsModal";
import { ProspectCard } from "./ProspectCard";
import { DraftEmailModal } from "./DraftEmailModal";
import { SendEmailConfirmationModal } from "./SendEmailConfirmationModal";
import { ActivityFeed } from "./ActivityFeed";
import { getScoreLabel, getScoreColor, getScoreBadgeClasses } from "@/lib/leads/scoring";
import { getStatusBadgeClasses, getStatusLabel } from "@/lib/leads/prospect-status";
import { ProspectStatus } from "@prisma/client";

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
  status?: ProspectStatus;
  archived?: boolean;
  googleRating?: number | null;
  googleReviews?: number | null;
  websiteQualityScore?: number | null;
  revenuePotential?: number | null;
  categoryFit?: number | null;
  locationScore?: number | null;
  organizationSize?: number | null;
  urgencyLevel?: string | null;
  opportunities?: string[];
  redFlags?: string[];
  aiAnalysis?: any;
  internalNotes?: string | null;
  emailDraft?: string | null;
  emailSentAt?: Date | null;
  emailOpenedAt?: Date | null;
  emailRepliedAt?: Date | null;
  lastContactedAt?: Date | null;
  followUpDate?: Date | null;
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
  initialLeads?: Lead[];
  initialProspects?: Prospect[];
  stats?: Stats;
  categories?: string[];
  states?: string[];
}

export function ClientFinderClient({
  initialLeads = [],
  initialProspects = [],
  stats: initialStats,
  categories: initialCategories = [],
  states: initialStates = [],
}: ClientFinderClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [stats, setStats] = useState<Stats>(initialStats || {
    total: 0,
    hot: 0,
    warm: 0,
    contacted: 0,
    converted: 0,
    prospects: 0,
  });
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [states, setStates] = useState<string[]>(initialStates);
  const [loading, setLoading] = useState(!initialLeads.length && !initialProspects.length);
  
  // Filter states - must be declared before useEffect and fetchData
  const [websiteFilter, setWebsiteFilter] = useState<string>("all"); // "all", "yes", "no"

  // Fetch data from API on mount and when needed
  useEffect(() => {
    fetchData();
  }, [websiteFilter]); // Refetch when website filter changes

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        archived: "false",
        limit: "1000",
      });
      if (websiteFilter !== "all") {
        params.append("hasWebsite", websiteFilter === "yes" ? "true" : "false");
      }

      // Fetch prospects (non-archived, non-converted)
      const prospectsRes = await fetch(`/api/prospects?${params.toString()}`);
      if (!prospectsRes.ok) {
        const errorData = await prospectsRes.json().catch(() => ({}));
        console.error("Failed to fetch prospects:", errorData);
        throw new Error(errorData.error || `Failed to fetch prospects: ${prospectsRes.status}`);
      }
      const prospectsData = await prospectsRes.json();
      
      // Leads are managed separately - use empty array for now
      // TODO: Create /api/leads endpoint if needed for lead finder
      const allLeads: Lead[] = [];

      const allProspects = prospectsData.prospects || [];
      setProspects(allProspects);
      setLeads(allLeads);
      
      // Calculate stats
      setStats({
        total: allLeads.length,
        hot: allProspects.filter((p: Prospect) => p.leadScore >= 80).length,
        warm: allProspects.filter((p: Prospect) => p.leadScore >= 60 && p.leadScore < 80).length,
        contacted: allProspects.filter((p: Prospect) => p.status === "CONTACTED" || p.status === "RESPONDED").length,
        converted: allProspects.filter((p: Prospect) => p.status === "CONVERTED").length,
        prospects: allProspects.length,
      });

      // Extract categories and states
      const allCats = [...allLeads.map((l: Lead) => l.category), ...allProspects.map((p: Prospect) => p.category)].filter(Boolean);
      const allSts = [...allLeads.map((l: Lead) => l.state), ...allProspects.map((p: Prospect) => p.state)].filter(Boolean);
      setCategories([...new Set(allCats)] as string[]);
      setStates([...new Set(allSts)] as string[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  const [viewMode, setViewMode] = useState<"cards" | "list" | "map">("cards");
  const [tab, setTab] = useState<"leads" | "prospects">("prospects"); // Show prospects by default
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [prospectStatusFilter, setProspectStatusFilter] = useState<string>("all");
  const [archivedFilter, setArchivedFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [showReachOutModal, setShowReachOutModal] = useState(false);
  const [showDraftEmailModal, setShowDraftEmailModal] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState<{ subject: string; body: string } | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
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
      if (archivedFilter && !prospect.archived) return false;
      if (!archivedFilter && prospect.archived) return false;

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
      if (prospect.leadScore < minScore || prospect.leadScore > maxScore) return false;

      if (prospectStatusFilter !== "all" && prospect.status !== prospectStatusFilter) return false;

      if (dateFilter !== "all") {
        const now = new Date();
        const createdAt = new Date(prospect.createdAt);
        if (dateFilter === "today") {
          if (createdAt.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (createdAt < weekAgo) return false;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (createdAt < monthAgo) return false;
        }
      }

      return true;
    });
  }, [prospects, searchQuery, selectedState, selectedCategory, minScore, maxScore, prospectStatusFilter, archivedFilter, dateFilter]);

  const handleDiscoverPlaces = async (params: {
    location: string;
    radius: number;
    types: string[];
    keyword?: string;
    hasWebsite?: boolean;
    minRating?: number;
    minReviews?: number;
    analyzeWithAI: boolean;
    autoGenerateDrafts: boolean;
  }) => {
    setIsDiscovering(true);
    setDiscoveryResults(null);

    try {
      // Convert types array to single type for API (use first type)
      const res = await fetch("/api/leads/discover-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: params.location,
          radius: params.radius,
          type: params.types[0] || "nonprofit",
          keyword: params.keyword,
          analyzeWithAI: params.analyzeWithAI,
          filters: {
            hasWebsite: params.hasWebsite,
            minRating: params.minRating,
            minReviews: params.minReviews,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDiscoveryResults(data);
        
        // Refresh prospects after discovery
        if (data.prospects && data.prospects.length > 0 || data.saved > 0) {
          // Refresh data from API
          await fetchData();
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

  const handleDraftEmail = async (prospectId: string) => {
    setSelectedProspect(prospects.find((p) => p.id === prospectId) || null);
    setShowDraftEmailModal(true);
  };

  const handleSendEmail = async (subject: string, body: string) => {
    if (!selectedProspect) return;

    setEmailDraft({ subject, body });
    setShowDraftEmailModal(false);
    setShowSendEmailModal(true);
  };

  const handleConfirmSendEmail = async () => {
    if (!selectedProspect || !emailDraft) return;

    setIsSendingEmail(true);
    try {
      const res = await fetch(`/api/prospects/${selectedProspect.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailDraft.subject,
          emailBody: emailDraft.body,
          fromEmail: "sean@see-zee.com",
        }),
      });

      if (res.ok) {
        alert("Email sent successfully!");
        setShowSendEmailModal(false);
        setEmailDraft(null);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleArchiveProspect = async (prospectId: string) => {
    if (!confirm("Are you sure you want to archive this prospect?")) return;
    
    try {
      const res = await fetch(`/api/prospects/${prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });

      if (res.ok) {
        setProspects(prospects.filter((p) => p.id !== prospectId));
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Error archiving prospect:", error);
      alert("Failed to archive prospect");
    }
  };

  const handleDeleteProspect = async (prospectId: string) => {
    if (!confirm("Are you sure you want to permanently delete this prospect? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/prospects/${prospectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProspects(prospects.filter((p) => p.id !== prospectId));
        fetchData(); // Refresh data
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete prospect");
      }
    } catch (error) {
      console.error("Error deleting prospect:", error);
      alert("Failed to delete prospect");
    }
  };

  const handleRefreshDetails = async (prospectId: string) => {
    try {
      const res = await fetch(`/api/prospects/${prospectId}/refresh-details`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        alert("Prospect details refreshed successfully!");
        fetchData(); // Refresh data to show updates
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to refresh details");
      }
    } catch (error) {
      console.error("Error refreshing details:", error);
      alert("Failed to refresh prospect details");
    }
  };

  const handleConvertToLead = async (prospectId: string) => {
    if (!confirm("Convert this prospect to a lead? This will move it to the leads section.")) return;
    
    try {
      // First, create a lead from the prospect
      const prospect = prospects.find((p) => p.id === prospectId);
      if (!prospect) return;

      const leadData: any = {
        name: prospect.name,
        email: prospect.email || "",
        phone: prospect.phone || "",
        company: prospect.company || prospect.name,
        category: prospect.category || "",
        city: prospect.city || "",
        state: prospect.state || "",
        address: prospect.address || "",
        websiteUrl: prospect.websiteUrl || "",
        leadScore: prospect.leadScore || 0,
        hasWebsite: prospect.hasWebsite || false,
        source: "PROSPECT_DISCOVERY",
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });

      if (res.ok) {
        const leadResult = await res.json();
        
        // Mark prospect as converted and link to lead
        await fetch(`/api/prospects/${prospectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: "CONVERTED",
            convertedAt: new Date().toISOString(),
            convertedToLeadId: leadResult.lead?.id || leadResult.id,
          }),
        });
        
        setProspects(prospects.filter((p) => p.id !== prospectId));
        fetchData(); // Refresh data
        alert("Prospect converted to lead successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to convert prospect to lead");
      }
    } catch (error) {
      console.error("Error converting prospect:", error);
      alert("Failed to convert prospect to lead");
    }
  };

  const handleStatusChange = async (prospectId: string, status: ProspectStatus) => {
    try {
      const res = await fetch(`/api/prospects/${prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setProspects(
          prospects.map((p) => (p.id === prospectId ? { ...p, status } : p))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAddNote = (prospectId: string) => {
    const note = prompt("Enter internal note:");
    if (note) {
      fetch(`/api/prospects/${prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: note }),
      }).then(() => {
        fetchData(); // Refresh data instead of full page reload
      }).catch((error) => {
        console.error("Error adding note:", error);
        alert("Failed to add note");
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
            Lead Finder
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">
            Lead Finder
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDiscoverModal(true)}
            disabled={isDiscovering}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            🔍 Discover Leads
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
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4">
          <p className="text-2xl font-bold text-white">{stats.prospects || 0}</p>
          <p className="text-xs text-purple-400">Total Prospects</p>
        </div>
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4">
          <p className="text-2xl font-bold text-white">
            {prospects.filter((p) => p.status === "QUALIFIED" || p.status === "CONTACTED" || p.status === "RESPONDED").length}
          </p>
          <p className="text-xs text-blue-400">Qualified Leads</p>
        </div>
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4">
          <p className="text-2xl font-bold text-white">
            {prospects.filter((p) => p.status === "CONTACTED" || p.status === "RESPONDED").length}
          </p>
          <p className="text-xs text-green-400">Contacted This Week</p>
        </div>
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4">
          <p className="text-2xl font-bold text-white">
            {prospects.filter((p) => p.status === "CONVERTED").length}
          </p>
          <p className="text-xs text-cyan-400">Converted This Month</p>
        </div>
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
      <div className="space-y-3 p-4 rounded-xl border-2 border-gray-700 bg-[#151b2e]">
        {/* First Row - Main Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          {tab === "prospects" && (
            <select
              value={prospectStatusFilter}
              onChange={(e) => setProspectStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="PROSPECT">Prospects</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONTACTED">Contacted</option>
              <option value="RESPONDED">Responded</option>
              <option value="CONVERTED">Converted</option>
            </select>
          )}

          {/* Score Range */}
          <div className="flex items-center gap-2">
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
            >
              <option value="0">All Scores</option>
              <option value="90">90-100</option>
              <option value="80">80-89</option>
              <option value="70">70-79</option>
              <option value="0">&lt;70</option>
            </select>
            {minScore > 0 && (
              <select
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value))}
                className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
              >
                <option value={minScore + 9}>{minScore}-{minScore + 9}</option>
                <option value={minScore + 19}>{minScore}-{minScore + 19}</option>
                <option value={100}>{minScore}-100</option>
              </select>
            )}
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

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

          {/* Website Filter */}
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#1a2235] px-3 py-2 text-sm text-white focus:border-trinity-red focus:outline-none"
          >
            <option value="all">All Websites</option>
            <option value="yes">Has Website</option>
            <option value="no">No Website</option>
          </select>
        </div>

        {/* Second Row - Search and View Toggle */}
        <div className="flex items-center justify-between gap-4">
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

          {/* View Toggle */}
          {tab === "prospects" && (
            <div className="flex items-center gap-1 rounded-lg border border-gray-700 p-1 bg-[#1a2235]">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded ${
                  viewMode === "cards" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded ${
                  viewMode === "map" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Map View"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hide Archived Toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={archivedFilter}
              onChange={(e) => setArchivedFilter(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
            />
            Hide Archived
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map or List or Cards */}
        <div className={viewMode === "map" ? "lg:col-span-3" : "lg:col-span-4"}>
          {tab === "prospects" ? (
            viewMode === "cards" ? (
              // Card View
              <div className="grid gap-4 md:grid-cols-2">
                {filteredProspects.map((prospect) => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={{
                      ...prospect,
                      status: prospect.status || 'PROSPECT' as any,
                    } as any}
                    onDraftEmail={handleDraftEmail}
                    onAddNote={handleAddNote}
                    onArchive={handleArchiveProspect}
                    onDelete={handleDeleteProspect}
                    onConvertToLead={handleConvertToLead}
                    onStatusChange={handleStatusChange}
                    onViewDetails={(id) => {
                      const p = prospects.find((p) => p.id === id);
                      if (p) setSelectedProspect(p);
                    }}
                    onRefreshDetails={handleRefreshDetails}
                  />
                ))}
                {filteredProspects.length === 0 && (
                  <div className="col-span-2 p-12 text-center text-gray-500 rounded-xl border-2 border-dashed border-gray-700 bg-[#151b2e]">
                    No prospects found. Use "Discover Leads" to find new prospects.
                  </div>
                )}
              </div>
            ) : viewMode === "list" ? (
              // List View
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
                          Status
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
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBadgeClasses(
                                prospect.leadScore
                              )}`}
                            >
                              {prospect.leadScore}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {prospect.status && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                                  prospect.status
                                )}`}
                              >
                                {getStatusLabel(prospect.status)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDraftEmail(prospect.id);
                              }}
                              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 transition"
                            >
                              <Mail className="w-4 h-4" />
                              Draft Email
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                      {filteredProspects.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                            No prospects found. Use "Discover Leads" to find new prospects.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Map View for Prospects
              <div className="rounded-2xl border-2 border-gray-700 bg-[#151b2e] p-8 text-center text-gray-400">
                Map view for prospects coming soon. Use Card or List view.
              </div>
            )
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

        {/* Side Panel - Activity Feed */}
        {tab === "prospects" && (
          <div className="lg:col-span-1">
            <ActivityFeed limit={10} />
          </div>
        )}

        {/* Side Panel - Leads Map */}
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
        <DiscoverLeadsModal
          isOpen={showDiscoverModal}
          onClose={() => setShowDiscoverModal(false)}
          onDiscover={handleDiscoverPlaces}
          isDiscovering={isDiscovering}
        />
      )}

      {/* Draft Email Modal */}
      {showDraftEmailModal && selectedProspect && (
        <DraftEmailModal
          isOpen={showDraftEmailModal}
          onClose={() => {
            setShowDraftEmailModal(false);
            setSelectedProspect(null);
          }}
          prospectId={selectedProspect.id}
          prospectName={selectedProspect.company || selectedProspect.name}
          prospectEmail={selectedProspect.email}
          onSend={handleSendEmail}
        />
      )}

      {/* Send Email Confirmation Modal */}
      {showSendEmailModal && selectedProspect && emailDraft && (
        <SendEmailConfirmationModal
          isOpen={showSendEmailModal}
          onClose={() => {
            setShowSendEmailModal(false);
            setEmailDraft(null);
          }}
          prospectName={selectedProspect.company || selectedProspect.name}
          prospectEmail={selectedProspect.email}
          subject={emailDraft.subject}
          onConfirm={handleConfirmSendEmail}
          isSending={isSendingEmail}
        />
      )}

      {/* Reach Out Modal - For converting to lead with email */}
      {selectedProspect && (
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
            fetchData();
          }}
        />
      )}
    </div>
  );
}

export default ClientFinderClient;

