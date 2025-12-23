"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Package, DollarSign, FileText, Mail, Phone, Building, Calendar, 
  CheckCircle, XCircle, AlertCircle, Clock, Globe, Zap, Target, 
  TrendingUp, Edit2, Save, X, ExternalLink, Activity
} from "lucide-react";
import { updateLeadStatus } from "@/server/actions";
import { convertLeadToProject } from "@/server/actions/leads";
import { formatPrice } from "@/lib/qwiz/pricing";
import { getPackage } from "@/lib/qwiz/packages";

interface LeadDetailClientProps {
  lead: any;
  questionnaire: any;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/20 border-blue-500/30",
  CONTACTED: "bg-teal-500/20 border-teal-500/30",
  QUALIFIED: "bg-green-500/20 border-green-500/30",
  PROPOSAL_SENT: "bg-purple-500/20 border-purple-500/30",
  CONVERTED: "bg-emerald-500/20 border-emerald-500/30",
  LOST: "bg-red-500/20 border-red-500/30",
};

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

// Status timeline for visualization
const statusTimeline = [
  { value: "NEW", label: "Submitted", icon: "📥" },
  { value: "CONTACTED", label: "Contacted", icon: "✉️" },
  { value: "QUALIFIED", label: "Qualified", icon: "✅" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent", icon: "📄" },
  { value: "CONVERTED", label: "Approved", icon: "🎯" },
];

// Helper: Parse maintenance data from lead
function parseMaintenanceData(lead: any) {
  const metadata = lead.metadata as any || {};
  const message = lead.message || '';
  
  return {
    maintenanceNeeds: metadata.maintenanceNeeds || [],
    urgency: metadata.urgency || '',
    websiteUrl: metadata.websiteUrl || lead.websiteUrl || '',
    websitePlatform: metadata.websitePlatform || '',
    maintenanceTier: metadata.maintenanceTier || '',
    hasAccessCredentials: metadata.hasAccessCredentials || false,
  };
}

// Helper: Suggest maintenance plan based on data
function suggestMaintenancePlan(data: ReturnType<typeof parseMaintenanceData>) {
  const { maintenanceNeeds, urgency } = data;
  const needsCount = maintenanceNeeds?.length || 0;
  const isUrgent = urgency?.toLowerCase().includes('immediate') || urgency?.toLowerCase().includes('urgent');
  
  // Rules-based suggestion
  if (isUrgent && needsCount >= 3) {
    return { tier: 'COO', confidence: 'High', reason: 'Urgent + multiple services' };
  }
  if (needsCount >= 2 || isUrgent) {
    return { tier: 'Director', confidence: 'High', reason: 'Multiple services or urgent' };
  }
  if (needsCount === 1 && !isUrgent) {
    return { tier: 'Essentials', confidence: 'Medium', reason: 'Single service, not urgent' };
  }
  return { tier: 'Essentials', confidence: 'Low', reason: 'Default recommendation' };
}

// Helper: Determine urgency level
function getUrgencyLevel(urgency: string): { level: 'high' | 'medium' | 'low', icon: string, color: string } {
  if (!urgency) return { level: 'low', icon: '🟢', color: 'text-green-400' };
  
  const urgent = urgency.toLowerCase();
  if (urgent.includes('immediate') || urgent.includes('urgent') || urgent.includes('asap')) {
    return { level: 'high', icon: '🔴', color: 'text-red-400' };
  }
  if (urgent.includes('soon') || urgent.includes('quick')) {
    return { level: 'medium', icon: '🟡', color: 'text-yellow-400' };
  }
  return { level: 'low', icon: '🟢', color: 'text-green-400' };
}

// Helper: Extract structured data from message
function parseMessage(message: string) {
  if (!message) return { services: [], website: '', priority: '', details: message };
  
  const lines = message.split('\n');
  const services: string[] = [];
  let website = '';
  let priority = '';
  let details = '';
  
  for (const line of lines) {
    if (line.toLowerCase().includes('services needed:')) {
      const servicesText = line.split(':')[1]?.trim() || '';
      services.push(...servicesText.split(',').map(s => s.trim()).filter(Boolean));
    } else if (line.toLowerCase().includes('website:')) {
      website = line.split(':')[1]?.trim() || '';
    } else if (line.toLowerCase().includes('priority:') || line.toLowerCase().includes('urgency:')) {
      priority = line.split(':')[1]?.trim() || '';
    } else if (line.trim()) {
      details += (details ? '\n' : '') + line.trim();
    }
  }
  
  return { services, website, priority, details };
}

export function LeadDetailClient({ lead, questionnaire }: LeadDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [updating, setUpdating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState(lead.internalNotes || '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const questionnaireData = questionnaire?.data as any;
  const metadata = lead.metadata as any;
  const isMaintenance = lead.serviceType === 'MAINTENANCE_PLAN';
  const maintenanceData = parseMaintenanceData(lead);
  const planSuggestion = isMaintenance ? suggestMaintenancePlan(maintenanceData) : null;
  const urgencyInfo = getUrgencyLevel(maintenanceData.urgency);
  const parsedMessage = parseMessage(lead.message || '');
  
  // Combine maintenance needs from metadata and parsed message
  const allServices = [
    ...(maintenanceData.maintenanceNeeds || []),
    ...(parsedMessage.services || [])
  ].filter((v, i, a) => a.indexOf(v) === i); // unique

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const result = await updateLeadStatus(lead.id, newStatus as any);

    if (result.success) {
      setStatus(newStatus);
    }
    setUpdating(false);
    router.refresh();
  };

  const handleSaveAdminNotes = async () => {
    setSavingNotes(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: adminNotes }),
      });
      
      if (response.ok) {
        setEditingNotes(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to save admin notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleApproveAndCreateProject = async (tier?: string) => {
    setApproving(true);
    setApprovalError(null);
    setApprovalSuccess(false);
    
    try {
      // If tier is provided, we might need to pass it to the conversion
      // For now, using the existing convertLeadToProject
      const result = await convertLeadToProject(lead.id);
      
      if (result.success) {
        setApprovalSuccess(true);
        setStatus("CONVERTED");
        setShowApprovalModal(false);
        router.refresh();
        setTimeout(() => {
          if (result.projectId) {
            router.push(`/admin/pipeline/projects/${result.projectId}`);
          } else {
            router.push(`/admin/pipeline/projects`);
          }
        }, 2000);
      } else {
        setApprovalError(result.error || "Failed to create project");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setApprovalError(errorMessage);
      console.error("Error converting lead:", error);
    } finally {
      setApproving(false);
    }
  };

  const currentStatusIndex = statusOptions.findIndex(s => s.value === status);
  const suggestedTier = planSuggestion?.tier || 'essentials';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Lead ID: {lead.id}
            </p>
          </div>
        </div>

        {/* Status Selector */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium border
            bg-slate-900 cursor-pointer
            ${statusColors[status] || statusColors.NEW}
            ${updating ? "opacity-50 cursor-wait" : ""}
            text-white
          `}
          style={{
            color: 'white',
          }}
        >
          {statusOptions.map((opt) => (
            <option 
              key={opt.value} 
              value={opt.value}
              style={{
                backgroundColor: '#1e293b',
                color: 'white',
              }}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Timeline */}
      <div className="glass p-4 rounded-lg">
        <div className="flex items-center justify-between">
          {statusTimeline.map((step, index) => {
            const stepIndex = statusOptions.findIndex(s => s.value === step.value);
            const isActive = stepIndex <= currentStatusIndex;
            const isCurrent = step.value === status;
            
            return (
              <div key={step.value} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg
                    ${isActive ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-slate-700/50 border-2 border-slate-600'}
                    ${isCurrent ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}
                  `}>
                    {step.icon}
                  </div>
                  <div className={`text-xs mt-2 ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                    {step.label}
                  </div>
                </div>
                {index < statusTimeline.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${isActive ? 'bg-blue-500' : 'bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Snapshot - NEW */}
          {isMaintenance && planSuggestion && (
            <div className="glass p-6 rounded-lg border-2 border-blue-500/30">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Lead Snapshot
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-slate-400 text-xs mb-1">Urgency</div>
                  <div className={`font-semibold flex items-center gap-1 ${urgencyInfo.color}`}>
                    <span>{urgencyInfo.icon}</span>
                    <span className="capitalize">{urgencyInfo.level}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">Likely Plan</div>
                  <div className="font-semibold text-blue-400">
                    {planSuggestion.tier}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">Scope</div>
                  <div className="font-semibold">
                    {allServices.length > 0 ? `${allServices.length} Services` : 'Ongoing Maintenance'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">Confidence</div>
                  <div className={`font-semibold ${
                    planSuggestion.confidence === 'High' ? 'text-green-400' :
                    planSuggestion.confidence === 'Medium' ? 'text-yellow-400' : 'text-slate-400'
                  }`}>
                    {planSuggestion.confidence}
                  </div>
                </div>
              </div>
              {planSuggestion.reason && (
                <div className="mt-3 text-xs text-slate-400 italic">
                  💡 {planSuggestion.reason}
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="glass p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Contact Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-slate-400 text-sm mb-1">Name</div>
                <div className="font-medium">{lead.name}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </div>
                <a href={`mailto:${lead.email}`} className="font-medium text-blue-400 hover:underline">
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div>
                  <div className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </div>
                  <a href={`tel:${lead.phone}`} className="font-medium text-blue-400 hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
              {lead.company && (
                <div>
                  <div className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Company
                  </div>
                  <div className="font-medium">{lead.company}</div>
                </div>
              )}
              <div>
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Created
                </div>
                <div className="font-medium">
                  {new Date(lead.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Source</div>
                <div className="font-medium capitalize">{lead.source || 'Website'}</div>
              </div>
            </div>
          </div>

          {/* Structured Request Details - NEW */}
          {isMaintenance && (allServices.length > 0 || maintenanceData.websiteUrl || maintenanceData.urgency) && (
            <div className="glass p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Request Details
              </h2>
              
              {/* Requested Services */}
              {allServices.length > 0 && (
                <div className="mb-4">
                  <div className="text-slate-400 text-sm mb-2 font-medium">Requested Services</div>
                  <div className="flex flex-wrap gap-2">
                    {allServices.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Website */}
              {(maintenanceData.websiteUrl || parsedMessage.website) && (
                <div className="mb-4">
                  <div className="text-slate-400 text-sm mb-2 font-medium flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Website
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://${(maintenanceData.websiteUrl || parsedMessage.website).replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {maintenanceData.websiteUrl || parsedMessage.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {maintenanceData.websitePlatform && (
                      <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
                        {maintenanceData.websitePlatform}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Priority */}
              {(maintenanceData.urgency || parsedMessage.priority) && (
                <div>
                  <div className="text-slate-400 text-sm mb-2 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Priority
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${
                    urgencyInfo.level === 'high' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
                    urgencyInfo.level === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
                    'bg-green-500/20 border border-green-500/30 text-green-300'
                  }`}>
                    <span>{urgencyInfo.icon}</span>
                    <span className="font-medium">{maintenanceData.urgency || parsedMessage.priority}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Notes (if there's unstructured content) */}
          {parsedMessage.details && (
            <div className="glass p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
              <p className="text-slate-300 whitespace-pre-wrap">{parsedMessage.details}</p>
            </div>
          )}

          {/* Fallback: Original message if not maintenance or no structured data */}
          {!isMaintenance && lead.message && (
            <div className="glass p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
              <p className="text-slate-300 whitespace-pre-wrap">{lead.message}</p>
            </div>
          )}

          {/* Admin Notes - NEW */}
          <div className="glass p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-yellow-400" />
                Admin Notes
                <span className="text-xs text-slate-500 font-normal">(Internal Only)</span>
              </h2>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this lead (e.g., 'Seems needy', 'Nonprofit, tight budget', 'Good long-term fit')..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAdminNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setAdminNotes(lead.internalNotes || '');
                      setEditingNotes(false);
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-300 whitespace-pre-wrap min-h-[60px]">
                {adminNotes || <span className="text-slate-500 italic">No admin notes yet...</span>}
              </div>
            )}
          </div>

          {/* Package Selection (for non-maintenance) */}
          {questionnaireData?.package && !isMaintenance && (
            <div className="glass p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Selected Package
              </h2>
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getPackage(questionnaireData.package).icon}</span>
                  <div>
                    <h3 className="text-xl font-bold">
                      {getPackage(questionnaireData.package).title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {getPackage(questionnaireData.package).description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          {questionnaireData?.totals && (
            <div className="glass p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Pricing Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Base Package</span>
                  <span className="font-semibold">
                    {formatPrice(questionnaireData.totals.packageBase)}
                  </span>
                </div>
                {questionnaireData.totals.addons > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Additional Features</span>
                    <span className="font-semibold text-purple-400">
                      +{formatPrice(questionnaireData.totals.addons)}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total Project Cost</span>
                    <span className="text-xl font-bold text-blue-400">
                      {formatPrice(questionnaireData.totals.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Monthly Maintenance</span>
                    <span className="font-semibold text-green-400">
                      {formatPrice(questionnaireData.totals.monthly)}/mo
                    </span>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Deposit to Start</span>
                    <span className="text-lg font-bold text-green-400">
                      {formatPrice(questionnaireData.totals.deposit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            
            {/* Success Message */}
            {approvalSuccess && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                ✓ Project created successfully! Redirecting...
              </div>
            )}
            
            {/* Error Message */}
            {approvalError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {approvalError}
              </div>
            )}
            
            <div className="space-y-2">
              {/* Smart Approve Button */}
              {lead.status !== 'CONVERTED' && (
                <button
                  onClick={() => {
                    if (isMaintenance) {
                      setShowApprovalModal(true);
                    } else {
                      handleApproveAndCreateProject();
                    }
                  }}
                  disabled={approving || approvalSuccess}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-center font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  {approving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Creating Project...
                    </span>
                  ) : (
                    "✓ Approve & Create Project"
                  )}
                </button>
              )}
              
              {/* Show link to project if already converted */}
              {lead.status === 'CONVERTED' && lead.project && (
                <a
                  href={`/admin/pipeline/projects/${lead.project.id}`}
                  className="block w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-center font-medium transition-colors"
                >
                  View Project →
                </a>
              )}
              
              <a
                href={`mailto:${lead.email}?subject=Re: Your ${isMaintenance ? 'Maintenance Plan' : 'Project'} Request`}
                className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium transition-colors"
              >
                Send Email
              </a>
              {lead.status !== 'CONVERTED' && (
                <button
                  onClick={() => handleStatusChange('CONVERTED')}
                  disabled={updating}
                  className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-center font-medium transition-colors disabled:opacity-50"
                >
                  Mark as Converted
                </button>
              )}
              {lead.status !== 'LOST' && (
                <button
                  onClick={() => handleStatusChange('LOST')}
                  disabled={updating}
                  className="block w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-center font-medium transition-colors disabled:opacity-50"
                >
                  Mark as Lost
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal for Maintenance Plans */}
      {showApprovalModal && isMaintenance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl border-2 border-blue-500/30 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create Maintenance Plan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Plan Tier</label>
                <select
                  value={selectedTier || suggestedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                >
                  <option value="essentials">Essentials ($500/mo)</option>
                  <option value="director">Director ($750/mo)</option>
                  <option value="coo">COO ($2,000/mo)</option>
                </select>
                {planSuggestion && (
                  <p className="text-xs text-slate-400 mt-1">
                    💡 Suggested: {planSuggestion.tier} ({planSuggestion.confidence} confidence)
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleApproveAndCreateProject(selectedTier || suggestedTier)}
                  disabled={approving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
                >
                  {approving ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalError(null);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
