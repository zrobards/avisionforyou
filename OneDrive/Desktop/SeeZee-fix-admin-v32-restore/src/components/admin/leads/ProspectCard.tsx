"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  ExternalLink,
  MapPin,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Star,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { getScoreBadgeClasses, getScoreLabel } from "@/lib/leads/scoring";
import { getStatusBadgeClasses, getStatusLabel } from "@/lib/leads/prospect-status";
import { ProspectStatus } from "@prisma/client";

interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  googlePlaceId?: string | null;
  websiteUrl: string | null;
  hasWebsite: boolean;
  leadScore: number;
  tags: string[];
  createdAt: Date;
  address: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ProspectStatus;
  archived: boolean;
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

interface ProspectCardProps {
  prospect: Prospect;
  onDraftEmail: (prospectId: string) => void;
  onAddNote: (prospectId: string) => void;
  onArchive: (prospectId: string) => void;
  onDelete: (prospectId: string) => void;
  onConvertToLead: (prospectId: string) => void;
  onStatusChange: (prospectId: string, status: ProspectStatus) => void;
  onViewDetails: (prospectId: string) => void;
  onRefreshDetails?: (prospectId: string) => void;
}

export function ProspectCard({
  prospect,
  onDraftEmail,
  onAddNote,
  onArchive,
  onDelete,
  onConvertToLead,
  onStatusChange,
  onViewDetails,
  onRefreshDetails,
}: ProspectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const scoreInfo = getScoreLabel(prospect.leadScore);
  const aiAnalysis = prospect.aiAnalysis as any;

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRelative = (date: Date | null) => {
    if (!date) return "N/A";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return formatDate(date);
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-[#0a0e1a] overflow-hidden hover:border-purple-500/50 transition">
      {/* Card Header - More Compact */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-base font-semibold text-white truncate">
                {prospect.company || prospect.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getScoreBadgeClasses(
                  prospect.leadScore
                )}`}
              >
                {prospect.leadScore} {scoreInfo.emoji}
              </span>
              {prospect.status && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeClasses(
                    prospect.status
                  )}`}
                >
                  {getStatusLabel(prospect.status)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              {prospect.category && (
                <span>{prospect.category}</span>
              )}
              {prospect.city && prospect.state && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {prospect.city}, {prospect.state}
                </span>
              )}
              {prospect.email && (
                <span className="text-blue-400 truncate max-w-[200px]">{prospect.email}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              {prospect.googleRating && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>{prospect.googleRating}</span>
                  {prospect.googleReviews && (
                    <span>({prospect.googleReviews})</span>
                  )}
                </div>
              )}
              {prospect.hasWebsite && (
                <span className="text-green-400">✓ Website</span>
              )}
              {prospect.opportunities && prospect.opportunities.length > 0 && (
                <span className="text-purple-400 truncate max-w-[250px]" title={prospect.opportunities[0]}>
                  💡 {prospect.opportunities[0].substring(0, 40)}{prospect.opportunities[0].length > 40 ? '...' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button
            onClick={() => onDraftEmail(prospect.id)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition"
          >
            <Mail className="w-3 h-3" />
            Email
          </button>
          <button
            onClick={() => onConvertToLead(prospect.id)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30 transition"
          >
            Convert
          </button>
          <button
            onClick={() => onAddNote(prospect.id)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition"
          >
            <FileText className="w-3 h-3" />
            Note
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition ml-auto"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                More
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-700 bg-[#050812]"
          >
            <div className="p-4 space-y-4">
              {/* Score Breakdown */}
              {(prospect.websiteQualityScore !== null ||
                prospect.revenuePotential !== null ||
                prospect.categoryFit !== null ||
                prospect.locationScore !== null ||
                prospect.organizationSize !== null) && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    📊 Score Breakdown
                  </h4>
                  <div className="space-y-2">
                    {prospect.websiteQualityScore !== null && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Website Quality</span>
                          <span className="text-white">
                            {prospect.websiteQualityScore}/20
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${((prospect.websiteQualityScore || 0) / 20) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {prospect.revenuePotential !== null && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Revenue Potential</span>
                          <span className="text-white">
                            {prospect.revenuePotential}/25
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${((prospect.revenuePotential || 0) / 25) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {prospect.categoryFit !== null && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Category Fit</span>
                          <span className="text-white">
                            {prospect.categoryFit}/25
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${((prospect.categoryFit || 0) / 25) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {prospect.locationScore !== null && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Location</span>
                          <span className="text-white">
                            {prospect.locationScore}/15
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${((prospect.locationScore || 0) / 15) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {prospect.organizationSize !== null && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Organization Size</span>
                          <span className="text-white">
                            {prospect.organizationSize}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${((prospect.organizationSize || 0) / 10) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">📧 Contact</h4>
                <div className="space-y-1 text-sm">
                  {prospect.email && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {prospect.email}
                    </div>
                  )}
                  {prospect.phone && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {prospect.phone}
                    </div>
                  )}
                  {prospect.websiteUrl && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                      <a
                        href={prospect.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {prospect.websiteUrl.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {prospect.address && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {prospect.address}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Analysis */}
              {aiAnalysis && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    🤖 AI Analysis
                  </h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {aiAnalysis.reasoning || aiAnalysis.contactStrategy || "No analysis available"}
                  </p>
                </div>
              )}

              {/* Opportunities */}
              {prospect.opportunities && prospect.opportunities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    💡 Opportunities
                  </h4>
                  <ul className="space-y-1">
                    {prospect.opportunities.map((opp, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags */}
              {prospect.redFlags && prospect.redFlags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    ⚠️ Red Flags
                  </h4>
                  <ul className="space-y-1">
                    {prospect.redFlags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-300 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">📅 Timeline</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>Discovered: {formatDate(prospect.createdAt)}</div>
                  {prospect.emailSentAt && (
                    <div>Email Sent: {formatDate(prospect.emailSentAt)}</div>
                  )}
                  {prospect.emailOpenedAt && (
                    <div>Email Opened: {formatDate(prospect.emailOpenedAt)}</div>
                  )}
                  {prospect.emailRepliedAt && (
                    <div>Email Replied: {formatDate(prospect.emailRepliedAt)}</div>
                  )}
                  {prospect.followUpDate && (
                    <div className="text-yellow-400">
                      Follow-up: {formatDate(prospect.followUpDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              {prospect.internalNotes && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    📝 Internal Notes
                  </h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {prospect.internalNotes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-700 flex-wrap">
                <button
                  onClick={() => onStatusChange(prospect.id, "QUALIFIED")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition"
                >
                  Mark Qualified
                </button>
                <button
                  onClick={() => onConvertToLead(prospect.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30 transition"
                >
                  Convert to Lead
                </button>
                {onRefreshDetails && prospect.googlePlaceId && (
                  <button
                    onClick={() => onRefreshDetails(prospect.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition flex items-center gap-1"
                    title="Refresh details from Google Places"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                )}
                <button
                  onClick={() => onArchive(prospect.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 transition"
                >
                  Archive
                </button>
                <button
                  onClick={() => onDelete(prospect.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

