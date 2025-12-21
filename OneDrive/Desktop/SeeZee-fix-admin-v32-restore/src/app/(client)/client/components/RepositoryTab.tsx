"use client";

import { useState, useEffect } from "react";
import { ExternalLink, GitBranch, Calendar, User, Code, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface RepositoryTabProps {
  projectId: string;
}

interface RepositoryData {
  url: string;
  fullUrl?: string;
  owner?: string;
  repo?: string;
  description?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  lastCommit?: {
    sha: string | null;
    message: string | null;
    author: string | null;
    date: string | null;
    url: string | null;
  } | null;
  error?: string;
}

export function RepositoryTab({ projectId }: RepositoryTabProps) {
  const [repository, setRepository] = useState<RepositoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/repository`);
        if (!response.ok) {
          throw new Error("Failed to fetch repository information");
        }
        const data = await response.json();
        setRepository(data.repository);
      } catch (err: any) {
        setError(err.message || "Failed to load repository information");
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60 mb-2">
          {error || "No repository information available"}
        </p>
        <p className="text-sm text-white/40">
          {repository?.error || "Connect a GitHub repository to see details here"}
        </p>
      </div>
    );
  }

  if (repository.error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 font-medium">Repository Connection Issue</span>
          </div>
          <p className="text-sm text-amber-200/80 mb-4">{repository.error}</p>
          {repository.fullUrl && (
            <a
              href={repository.fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open Repository
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Repository Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">GitHub Repository</h3>
          {repository.owner && repository.repo && (
            <p className="text-white/60 text-sm">
              {repository.owner} / {repository.repo}
            </p>
          )}
        </div>
        {repository.fullUrl && (
          <a
            href={repository.fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Repository
          </a>
        )}
      </div>

      {/* Repository Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repository.description && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h4 className="text-sm font-semibold text-white/60 mb-2">Description</h4>
            <p className="text-white">{repository.description}</p>
          </div>
        )}

        {repository.language && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h4 className="text-sm font-semibold text-white/60 mb-2">Language</h4>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="text-white">{repository.language}</span>
            </div>
          </div>
        )}

        {repository.stars !== undefined && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h4 className="text-sm font-semibold text-white/60 mb-2">Stars</h4>
            <p className="text-2xl font-bold text-white">{repository.stars}</p>
          </div>
        )}

        {repository.forks !== undefined && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h4 className="text-sm font-semibold text-white/60 mb-2">Forks</h4>
            <p className="text-2xl font-bold text-white">{repository.forks}</p>
          </div>
        )}
      </div>

      {/* Last Commit */}
      {repository.lastCommit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-900 rounded-xl border border-gray-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h4 className="text-lg font-semibold text-white">Last Commit</h4>
          </div>

          <div className="space-y-3">
            {repository.lastCommit.message && (
              <div>
                <p className="text-white font-medium">{repository.lastCommit.message}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-white/60">
              {repository.lastCommit.sha && (
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span className="font-mono">{repository.lastCommit.sha}</span>
                </div>
              )}

              {repository.lastCommit.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{repository.lastCommit.author}</span>
                </div>
              )}

              {repository.lastCommit.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(repository.lastCommit.date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {repository.lastCommit.url && (
              <a
                href={repository.lastCommit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Commit
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Repository URL (fallback) */}
      {!repository.fullUrl && repository.url && (
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
          <h4 className="text-sm font-semibold text-white/60 mb-2">Repository URL</h4>
          <a
            href={repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 break-all"
          >
            {repository.url}
          </a>
        </div>
      )}
    </div>
  );
}









