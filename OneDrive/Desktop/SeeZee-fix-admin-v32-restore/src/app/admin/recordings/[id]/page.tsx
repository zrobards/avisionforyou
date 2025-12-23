'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mic, 
  FileText, 
  Sparkles, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  Play,
  RefreshCw
} from "lucide-react";
import { CopyButton } from "@/components/admin/recordings/CopyButton";

interface Recording {
  id: string;
  title: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  duration: number | null;
  status: string;
  category: string | null;
  isClientVisible: boolean;
  transcript: string | null;
  summary: string | null;
  actionItems: any;
  projectBrief: any;
  createdAt: string;
  transcribedAt: string | null;
  project: { id: string; name: string } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// Helper function to normalize file paths for older recordings
const normalizeFilePath = (filePath: string): string => {
  // If path starts with /, it's already absolute
  if (filePath.startsWith('/')) {
    return filePath;
  }
  // If path starts with 'recordings/', it's an old format - prepend /uploads/
  if (filePath.startsWith('recordings/')) {
    return `/uploads/${filePath}`;
  }
  // Otherwise, assume it's relative and prepend /uploads/recordings/
  return `/uploads/recordings/${filePath}`;
};

export default function RecordingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const fetchRecording = async () => {
      try {
        const res = await fetch(`/api/recordings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRecording(data.recording);
        } else {
          router.push('/admin/recordings');
        }
      } catch (error) {
        console.error('Failed to fetch recording:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecording();
  }, [id, router]);

  const handleProcessNow = async () => {
    if (isProcessing || !recording) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/recordings/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: recording.id })
      });

      if (res.ok) {
        setRecording({ ...recording, status: 'PROCESSING' });
        // Poll for updates every 5 seconds
        const interval = setInterval(async () => {
          const checkRes = await fetch(`/api/recordings/${recording.id}`);
          if (checkRes.ok) {
            const data = await checkRes.json();
            if (data.recording.status !== 'PROCESSING') {
              clearInterval(interval);
              router.refresh();
            }
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to process recording:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TRANSCRIBED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PROCESSING":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "ERROR":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  if (!recording) {
    return null;
  }

  const actionItems = recording.actionItems 
    ? (Array.isArray(recording.actionItems) 
        ? recording.actionItems 
        : JSON.parse(recording.actionItems as string))
    : null;

  const projectBrief = recording.projectBrief 
    ? (typeof recording.projectBrief === 'object' 
        ? recording.projectBrief 
        : JSON.parse(recording.projectBrief as string))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/recordings"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Mic className="w-8 h-8 text-pink-400" />
              {recording.title}
            </h1>
            <p className="text-slate-400 mt-1">
              Uploaded {new Date(recording.createdAt).toLocaleDateString()} at{" "}
              {new Date(recording.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(recording.status)}`}
          >
            {recording.status}
          </span>
        </div>
      </div>

      {/* Audio Player and Controls */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Play className="w-6 h-6 text-pink-400" />
            <h2 className="text-xl font-semibold text-white">Recording</h2>
          </div>
          <a
            href={normalizeFilePath(recording.filePath)}
            download={recording.filename}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
        {recording.mimeType.startsWith('audio/') && (
          <audio controls className="w-full" preload="metadata">
            <source src={normalizeFilePath(recording.filePath)} type={recording.mimeType} />
            Your browser does not support the audio element.
          </audio>
        )}
        {recording.mimeType.startsWith('video/') && (
          <video controls className="w-full rounded-lg" preload="metadata">
            <source src={normalizeFilePath(recording.filePath)} type={recording.mimeType} />
            Your browser does not support the video element.
          </video>
        )}
      </div>

      {/* Category & Visibility Controls */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-400" />
          Recording Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Selector */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Category (AI-tagged)</label>
            <select
              value={recording.category || ''}
              onChange={async (e) => {
                const newCategory = e.target.value || null;
                try {
                  const res = await fetch(`/api/recordings/${recording.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: newCategory })
                  });
                  if (res.ok) {
                    setRecording({ ...recording, category: newCategory });
                  }
                } catch (err) {
                  console.error('Failed to update category:', err);
                }
              }}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white"
            >
              <option value="">Uncategorized</option>
              <option value="DISCOVERY_CALL">📞 Discovery Call</option>
              <option value="DESIGN_REVIEW">🎨 Design Review</option>
              <option value="TECHNICAL_DISCUSSION">💻 Technical Discussion</option>
              <option value="PROJECT_UPDATE">📊 Project Update</option>
              <option value="BRAINSTORMING">💡 Brainstorming</option>
              <option value="TRAINING">📚 Training</option>
              <option value="SUPPORT">🛠️ Support</option>
              <option value="INTERNAL">🏢 Internal</option>
              <option value="OTHER">📁 Other</option>
            </select>
          </div>
          
          {/* Client Visibility Toggle */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Client Visibility</label>
            <button
              onClick={async () => {
                const newVisibility = !recording.isClientVisible;
                try {
                  const res = await fetch(`/api/recordings/${recording.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isClientVisible: newVisibility })
                  });
                  if (res.ok) {
                    setRecording({ ...recording, isClientVisible: newVisibility });
                  }
                } catch (err) {
                  console.error('Failed to update visibility:', err);
                }
              }}
              className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-all flex items-center justify-center gap-2 ${
                recording.isClientVisible
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {recording.isClientVisible ? (
                <>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  Visible to Client
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-slate-500 rounded-full" />
                  Hidden from Client
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recording Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Duration</span>
          </div>
          <p className="text-white font-semibold">
            {formatDuration(recording.duration)}
          </p>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">File Size</span>
          </div>
          <p className="text-white font-semibold">
            {(recording.fileSize / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
        {recording.project && (
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Project</span>
            </div>
            <Link
              href={`/admin/projects/${recording.project.id}`}
              className="text-white font-semibold hover:text-pink-400 transition-colors block"
            >
              {recording.project.name}
            </Link>
            {recording.isClientVisible && (
              <Link
                href={`/client/meetings`}
                target="_blank"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-2 inline-flex items-center gap-1"
              >
                View in Client Portal →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* AI-Generated Content */}
      {recording.status === "TRANSCRIBED" && (
        <div className="space-y-6">
          {/* Summary */}
          {recording.summary && (
            <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-pink-400" />
                <h2 className="text-xl font-semibold text-white">AI Summary</h2>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {recording.summary}
              </p>
            </div>
          )}

          {/* Action Items */}
          {actionItems && Array.isArray(actionItems) && actionItems.length > 0 && (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Action Items</h2>
              </div>
              <ul className="space-y-3">
                {actionItems.map((item: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      {typeof item === "string" ? (
                        <p className="text-slate-300">{item}</p>
                      ) : (
                        <>
                          {item.task && (
                            <p className="text-white font-medium">{item.task}</p>
                          )}
                          {item.assignee && (
                            <p className="text-sm text-slate-400 mt-1">
                              Assigned to: {item.assignee}
                            </p>
                          )}
                          {item.dueDate && (
                            <p className="text-sm text-slate-400">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Project Brief */}
          {projectBrief && (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Project Brief</h2>
              </div>
              <div className="space-y-4">
                {typeof projectBrief === "string" ? (
                  <p className="text-slate-300 whitespace-pre-wrap">{projectBrief}</p>
                ) : (
                  <>
                    {projectBrief.title && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {projectBrief.title}
                        </h3>
                      </div>
                    )}
                    {projectBrief.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-1">Description</h4>
                        <p className="text-slate-300">{projectBrief.description}</p>
                      </div>
                    )}
                    {projectBrief.requirements && projectBrief.requirements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2">Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {Array.isArray(projectBrief.requirements) ? (
                            projectBrief.requirements.map((req: string, i: number) => (
                              <li key={i}>{req}</li>
                            ))
                          ) : (
                            <li>{String(projectBrief.requirements)}</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {projectBrief.deliverables && projectBrief.deliverables.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2">Deliverables</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {Array.isArray(projectBrief.deliverables) ? (
                            projectBrief.deliverables.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))
                          ) : (
                            <li>{String(projectBrief.deliverables)}</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {projectBrief.technologies && projectBrief.technologies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2">Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(projectBrief.technologies) ? (
                            projectBrief.technologies.map((tech: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                                {tech}
                              </span>
                            ))
                          ) : (
                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                              {String(projectBrief.technologies)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      {projectBrief.timeline && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-400 mb-1">Timeline</h4>
                          <p className="text-white">{projectBrief.timeline}</p>
                        </div>
                      )}
                      {projectBrief.budget && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-400 mb-1">Budget</h4>
                          <p className="text-white">{projectBrief.budget}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Full Transcript */}
          {recording.transcript && (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Full Transcript</h2>
                </div>
                <CopyButton text={recording.transcript || ""} />
              </div>
              <div className="bg-slate-950/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                  {recording.transcript}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing State */}
      {recording.status === "PROCESSING" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-12 text-center">
          <Loader2 className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Processing Recording
          </h3>
          <p className="text-slate-400">
            AI is transcribing and analyzing your recording. This may take a few minutes.
          </p>
        </div>
      )}

      {/* Error State */}
      {recording.status === "ERROR" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Processing Error</h3>
          </div>
          <p className="text-slate-300 mb-4">
            There was an error processing this recording. You can try processing it again.
          </p>
          <button
            onClick={handleProcessNow}
            disabled={isProcessing}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Retry Processing
              </>
            )}
          </button>
        </div>
      )}

      {/* Pending State */}
      {recording.status === "PENDING" && (
        <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-12 text-center">
          <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Recording Queued
          </h3>
          <p className="text-slate-400 mb-6">
            Your recording is queued for processing. Processing will begin shortly.
          </p>
          <button
            onClick={handleProcessNow}
            disabled={isProcessing}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Process Now
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

