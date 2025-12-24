"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface DiagnosticData {
  userId: string;
  email: string;
  role: string;
  databaseState: {
    tosAcceptedAt: string | null;
    profileDoneAt: string | null;
    questionnaireCompleted: string | null;
    emailVerified: boolean;
    hasPassword: boolean;
  };
  tokenState: {
    tosAccepted: boolean;
    profileDone: boolean;
    role: string;
  };
  mismatches: string[] | null;
  recommendation: string;
}

export default function AccountStatusPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (sessionStatus === "unauthenticated" || !session?.user) {
      router.push("/login?returnUrl=/account-status");
      return;
    }

    // Fetch diagnostic data
    fetch("/api/auth/refresh-session")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDiagnostic(data.diagnostic);
        } else {
          setError(data.error || "Failed to fetch account status");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch account status");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [sessionStatus, session, router]);

  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Checking account status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!diagnostic) {
    return null;
  }

  const hasMismatches = diagnostic.mismatches && diagnostic.mismatches.length > 0;
  const isHealthy = !hasMismatches;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Account Status</h1>
          <p className="text-slate-400">Diagnostic information about your account</p>
        </div>

        {/* Status Card */}
        <div
          className={`rounded-xl border p-6 mb-6 ${
            isHealthy
              ? "bg-green-900/20 border-green-500/50"
              : "bg-yellow-900/20 border-yellow-500/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {isHealthy ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            )}
            <h2 className="text-xl font-bold text-white">
              {isHealthy ? "Account Status: Healthy" : "Account Status: Needs Attention"}
            </h2>
          </div>

          {diagnostic.recommendation && (
            <p className={`text-sm ${isHealthy ? "text-green-300" : "text-yellow-300"}`}>
              {diagnostic.recommendation}
            </p>
          )}
        </div>

        {/* User Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">User Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-white font-mono">{diagnostic.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">User ID:</span>
              <span className="text-white font-mono text-xs">{diagnostic.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role:</span>
              <span className="text-white font-semibold">{diagnostic.role}</span>
            </div>
          </div>
        </div>

        {/* Database State */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Database State</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Terms Accepted:</span>
              {diagnostic.databaseState.tosAcceptedAt ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Yes
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  No
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Profile Completed:</span>
              {diagnostic.databaseState.profileDoneAt ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Yes
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  No
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email Verified:</span>
              {diagnostic.databaseState.emailVerified ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Yes
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  No
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Has Password:</span>
              {diagnostic.databaseState.hasPassword ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Yes
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  OAuth Only
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Token State */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session Token State</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Terms Accepted:</span>
              {diagnostic.tokenState.tosAccepted ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Yes
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  No
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Profile Completed:</span>
              {diagnostic.tokenState.profileDone ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Yes
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  No
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mismatches */}
        {hasMismatches && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Mismatches Detected
            </h3>
            <ul className="list-disc list-inside space-y-2 text-yellow-300">
              {diagnostic.mismatches!.map((mismatch, idx) => (
                <li key={idx} className="text-sm">
                  {mismatch}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              // Sign out and sign back in to refresh session
              window.location.href = "/api/auth/signout?callbackUrl=/login";
            }}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Sign Out & Sign Back In
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Go Home
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          If you're still having issues after signing out and back in, please contact support.
        </p>
      </div>
    </div>
  );
}






