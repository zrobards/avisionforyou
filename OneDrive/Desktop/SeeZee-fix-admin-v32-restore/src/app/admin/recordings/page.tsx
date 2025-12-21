import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Mic, Plus, Play, Clock, FileText, Sparkles, Calendar, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RecordingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Only admin roles can access recordings
  const allowedRoles = [ROLE.CEO, ROLE.CFO];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch recordings from database (all recordings for admins)
  const recordings = await prisma.recording.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Mic className="w-8 h-8 text-pink-400" />
            Session Recordings
          </h1>
          <p className="text-slate-400 mt-1">
            Upload meeting recordings for AI transcription and summaries
          </p>
        </div>
        <Link
          href="/admin/recordings/upload"
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-pink-500/20"
        >
          <Plus className="w-4 h-4" />
          Upload Recording
        </Link>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI-Powered Meeting Transcription
            </h3>
            <p className="text-slate-400 text-sm">
              Upload audio or video recordings from client meetings. Our AI will:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              <li>• Transcribe the entire conversation</li>
              <li>• Generate a meeting summary</li>
              <li>• Extract action items and next steps</li>
              <li>• Create a project brief from requirements discussed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recordings List */}
      {recordings.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center">
          <Mic className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No recordings yet</h3>
          <p className="text-slate-400 mb-6">
            Upload your first meeting recording to get started
          </p>
          <Link
            href="/admin/recordings/upload"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Recording
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {recordings.map((recording) => (
              <Link
                key={recording.id}
                href={`/admin/recordings/${recording.id}`}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      recording.status === "TRANSCRIBED"
                        ? "bg-green-500/20"
                        : recording.status === "PROCESSING"
                        ? "bg-amber-500/20"
                        : "bg-slate-700/50"
                    }`}
                  >
                    {recording.status === "TRANSCRIBED" ? (
                      <FileText className="w-6 h-6 text-green-400" />
                    ) : recording.status === "PROCESSING" ? (
                      <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
                    ) : (
                      <Play className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-pink-400 transition-colors">
                      {recording.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(recording.createdAt).toLocaleDateString()}
                      </span>
                      {recording.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(recording.duration)}
                        </span>
                      )}
                      {recording.project && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {recording.project.name}
                        </span>
                      )}
                      {recording.transcript && (
                        <span className="flex items-center gap-1 text-pink-400">
                          <Sparkles className="w-3 h-3" />
                          AI Processed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    recording.status === "TRANSCRIBED"
                      ? "bg-green-500/20 text-green-400"
                      : recording.status === "PROCESSING"
                      ? "bg-amber-500/20 text-amber-400"
                      : recording.status === "ERROR"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-slate-500/20 text-slate-400"
                  }`}
                >
                  {recording.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

