"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, DollarSign, FileText, Mail, Phone, Building, Calendar, CheckCircle, XCircle } from "lucide-react";
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

export function LeadDetailClient({ lead, questionnaire }: LeadDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [updating, setUpdating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const result = await updateLeadStatus(lead.id, newStatus as any);

    if (result.success) {
      setStatus(newStatus);
    }
    setUpdating(false);
    router.refresh();
  };

  const handleApproveAndCreateProject = async () => {
    setApproving(true);
    setApprovalError(null);
    setApprovalSuccess(false);
    
    try {
      const result = await convertLeadToProject(lead.id);
      
      if (result.success) {
        setApprovalSuccess(true);
        setStatus("CONVERTED");
        // Refresh the page to show updated status
        router.refresh();
        // Redirect to the new project after a short delay
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
      // Fallback error handling in case of unexpected errors
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setApprovalError(errorMessage);
      console.error("Error converting lead:", error);
    } finally {
      setApproving(false);
    }
  };

  const questionnaireData = questionnaire?.data as any;
  const metadata = lead.metadata as any;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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

          {/* Package Selection */}
          {questionnaireData?.package && (
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

          {/* Selected Features */}
          {questionnaireData?.selectedFeatures && questionnaireData.selectedFeatures.length > 0 && (
            <div className="glass p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Selected Features</h2>
              <div className="grid grid-cols-2 gap-3">
                {questionnaireData.selectedFeatures.map((feature: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{feature.name}</div>
                      {feature.price > 0 && (
                        <div className="text-xs text-slate-400">+{formatPrice(feature.price)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questionnaire Responses */}
          {questionnaireData?.questionnaire && (
            <div className="glass p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Questionnaire Responses</h2>
              <div className="space-y-4">
                {Object.entries(questionnaireData.questionnaire).map(([key, value]: [string, any]) => (
                  <div key={key} className="border-b border-white/10 pb-3 last:border-0">
                    <div className="text-slate-400 text-sm mb-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="font-medium">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {lead.message && (
            <div className="glass p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
              <p className="text-slate-300 whitespace-pre-wrap">{lead.message}</p>
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
              {/* CEO Approval Button - Primary Action */}
              {lead.status !== 'CONVERTED' && (
                <button
                  onClick={handleApproveAndCreateProject}
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
                href={`mailto:${lead.email}`}
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
    </div>
  );
}
