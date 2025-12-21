import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
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
  Copy
} from "lucide-react";
import { CopyButton } from "@/components/admin/recordings/CopyButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecordingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Only admin roles can access recordings
  const allowedRoles = [ROLE.CEO, ROLE.CFO];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch recording with related data
  const recording = await prisma.recording.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!recording) {
    notFound();
  }

  // Parse JSON fields
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
              className="text-white font-semibold hover:text-pink-400 transition-colors"
            >
              {recording.project.name}
            </Link>
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
              <div className="prose prose-invert max-w-none">
                {typeof projectBrief === "string" ? (
                  <p className="text-slate-300 whitespace-pre-wrap">{projectBrief}</p>
                ) : (
                  <div className="space-y-4">
                    {projectBrief.title && (
                      <h3 className="text-lg font-semibold text-white">
                        {projectBrief.title}
                      </h3>
                    )}
                    {projectBrief.description && (
                      <p className="text-slate-300">{projectBrief.description}</p>
                    )}
                    {projectBrief.requirements && (
                      <div>
                        <h4 className="text-md font-semibold text-white mb-2">
                          Requirements
                        </h4>
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
                    {projectBrief.timeline && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Timeline:</span>{" "}
                        {projectBrief.timeline}
                      </p>
                    )}
                    {projectBrief.budget && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Budget:</span>{" "}
                        {projectBrief.budget}
                      </p>
                    )}
                  </div>
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
          <p className="text-slate-300">
            There was an error processing this recording. Please try uploading again.
          </p>
        </div>
      )}

      {/* Pending State */}
      {recording.status === "PENDING" && (
        <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-12 text-center">
          <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Recording Queued
          </h3>
          <p className="text-slate-400">
            Your recording is queued for processing. Processing will begin shortly.
          </p>
        </div>
      )}
    </div>
  );
}

