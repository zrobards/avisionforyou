"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Package, Calendar, User, Link as LinkIcon, Github, Trash2, AlertTriangle, Globe } from "lucide-react";

interface SettingsTabProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    githubRepo: string | null;
    vercelUrl: string | null;
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
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Extract questionnaire data
  const questionnaireData = project.questionnaire?.data as any;
  const packageName = questionnaireData?.selectedPackage || 'Not specified';
  const selectedFeatures = questionnaireData?.selectedFeatures || [];
  const timeline = questionnaireData?.questionnaire?.timeline || 'Not specified';
  const totals = questionnaireData?.totals;
  const totalAmount = totals?.finalTotal || totals?.subtotal || null;

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently remove all project data, files, and history.`)) {
      return;
    }

    // Double confirmation for destructive action
    if (!confirm('This is your final confirmation. The project will be permanently deleted. Continue?')) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/client/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete project';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Redirect to projects page after successful deletion
      router.push('/client/projects');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete project. Please try again.';
      console.error('Failed to delete project:', error);
      setDeleteError(errorMessage);
      setIsDeleting(false);
    }
  };

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

        {/* Vercel Deployment Link */}
        {project.vercelUrl && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-white/60">Vercel Deployment</h4>
            </div>
            <a
              href={project.vercelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors break-all"
            >
              <LinkIcon className="w-4 h-4" />
              {project.vercelUrl}
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

        {/* Delete Project Section - Only for clients */}
        {!isAdmin && (
          <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-300 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-200/80 mb-4">
                  Once you delete a project, there is no going back. All project data, files, messages, and history will be permanently removed.
                </p>
              </div>
            </div>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                <p className="text-sm text-red-300">{deleteError}</p>
              </div>
            )}

            <button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}




