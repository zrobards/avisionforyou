"use client";

import { useState, useEffect } from "react";
import { 
  Rocket, CheckCircle, Clock, AlertCircle, 
  ExternalLink, GitBranch, RefreshCw, Globe 
} from "lucide-react";
import { motion } from "framer-motion";

interface Deployment {
  id: string;
  url: string;
  state: "BUILDING" | "READY" | "ERROR" | "QUEUED" | "CANCELED";
  target: "production" | "preview";
  createdAt: number;
  buildingAt?: number;
  ready?: number;
  alias?: string[];
  meta: {
    branch?: string;
    commit?: string;
    message?: string;
    author?: string;
  };
}

interface DeploymentStatusProps {
  projectId: string;
}

export function DeploymentStatus({ projectId }: DeploymentStatusProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/vercel/deployments?projectId=${projectId}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch deployments");
      }

      const data = await response.json();
      setDeployments(data.deployments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDeployments, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (loading && deployments.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Deployments</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Deployments</h3>
        </div>
        <div className="text-center py-8 text-slate-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-amber-400" />
          <p>{error}</p>
          <button
            onClick={fetchDeployments}
            className="mt-4 text-sm text-cyan-400 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Get the latest production deployment
  const latestProduction = deployments.find(
    (d) => d.target === "production" && d.state === "READY"
  );

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Rocket className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Deployments</h3>
        </div>
        <button
          onClick={fetchDeployments}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Live Site Link */}
      {latestProduction && (
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Live Website</p>
                <p className="text-white font-medium">
                  {latestProduction.alias?.[0] || latestProduction.url}
                </p>
              </div>
            </div>
            <a
              href={`https://${latestProduction.alias?.[0] || latestProduction.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center gap-2"
            >
              Visit
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Deployments List */}
      <div className="divide-y divide-white/5">
        {deployments.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No deployments yet</p>
          </div>
        ) : (
          deployments.slice(0, 5).map((deployment) => (
            <DeploymentRow key={deployment.id} deployment={deployment} />
          ))
        )}
      </div>
    </div>
  );
}

function DeploymentRow({ deployment }: { deployment: Deployment }) {
  const stateConfig: Record<string, { icon: any; color: string; label: string }> = {
    READY: { icon: CheckCircle, color: "text-green-400", label: "Ready" },
    BUILDING: { icon: Clock, color: "text-amber-400", label: "Building" },
    QUEUED: { icon: Clock, color: "text-blue-400", label: "Queued" },
    ERROR: { icon: AlertCircle, color: "text-red-400", label: "Failed" },
    CANCELED: { icon: AlertCircle, color: "text-slate-400", label: "Canceled" },
  };

  const config = stateConfig[deployment.state] || stateConfig.QUEUED;
  const Icon = config.icon;

  const timeAgo = getTimeAgo(deployment.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-1 ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                deployment.target === "production"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-slate-500/20 text-slate-400"
              }`}>
                {deployment.target}
              </span>
              <span className={`text-xs ${config.color}`}>{config.label}</span>
            </div>
            {deployment.meta.branch && (
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                <GitBranch className="w-3 h-3" />
                <span>{deployment.meta.branch}</span>
                {deployment.meta.commit && (
                  <span className="text-xs text-slate-500">
                    ({deployment.meta.commit})
                  </span>
                )}
              </div>
            )}
            {deployment.meta.message && (
              <p className="text-sm text-slate-500 truncate mt-0.5">
                {deployment.meta.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-500">{timeAgo}</span>
          <a
            href={`https://${deployment.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

