"use client";

import { Settings, Package, Calendar, User, Link as LinkIcon, Github } from "lucide-react";

interface SettingsTabProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    githubRepo: string | null;
    questionnaire?: any;
  };
  assignee?: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  isAdmin?: boolean;
}

export function SettingsTab({ project, assignee, isAdmin = false }: SettingsTabProps) {
  // Extract questionnaire data
  const questionnaireData = project.questionnaire?.data as any;
  const packageName = questionnaireData?.selectedPackage || 'Not specified';
  const selectedFeatures = questionnaireData?.selectedFeatures || [];
  const timeline = questionnaireData?.questionnaire?.timeline || 'Not specified';
  const totals = questionnaireData?.totals;
  const totalAmount = totals?.finalTotal || totals?.subtotal || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">Project Settings</h3>
      </div>

      {/* Project Information */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
          <h4 className="text-sm font-semibold text-white/60 mb-4">Project Information</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">Project Name</span>
              <span className="font-medium text-white">{project.name}</span>
            </div>
            {project.description && (
              <div className="py-2 border-b border-white/5">
                <span className="text-white/60 text-sm block mb-1">Description</span>
                <span className="text-white">{project.description}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                project.status === 'ACTIVE' || project.status === 'IN_PROGRESS'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : project.status === 'COMPLETED'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Package & Features */}
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white/60">Package & Features</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">Package</span>
              <span className="font-medium text-white capitalize">{packageName}</span>
            </div>
            {totalAmount && (
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/60 text-sm">Total Amount</span>
                <span className="font-medium text-emerald-400">
                  ${Number(totalAmount / 100).toLocaleString()}
                </span>
              </div>
            )}
            {selectedFeatures.length > 0 && (
              <div className="py-2">
                <span className="text-white/60 text-sm block mb-2">Selected Features</span>
                <div className="flex flex-wrap gap-2">
                  {selectedFeatures.map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                    >
                      {feature.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-white/60 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </span>
              <span className="font-medium text-white">{timeline}</span>
            </div>
          </div>
        </div>

        {/* Team Assignment */}
        {assignee && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-white/60">Assigned Team Member</h4>
            </div>
            <div className="flex items-center gap-3">
              {assignee.image ? (
                <img
                  src={assignee.image}
                  alt={assignee.name || "Team member"}
                  className="w-10 h-10 rounded-full border-2 border-cyan-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-2 border-cyan-500/30" />
              )}
              <div>
                <p className="font-medium text-white text-sm">{assignee.name || "Unassigned"}</p>
                {assignee.email && (
                  <p className="text-xs text-white/60">{assignee.email}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Repository Link */}
        {project.githubRepo && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Github className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-white/60">Repository</h4>
            </div>
            <a
              href={project.githubRepo.startsWith('http') ? project.githubRepo : `https://github.com/${project.githubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors break-all"
            >
              <LinkIcon className="w-4 h-4" />
              {project.githubRepo}
            </a>
          </div>
        )}

        {/* Admin-only section */}
        {isAdmin && (
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
            <p className="text-sm text-amber-300">
              Admin view: You can edit project settings from the admin dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

