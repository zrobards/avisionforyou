"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SessionTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Session Test (Client-Side)</h1>
        
        {/* Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p>
              <span className="text-gray-400">Status:</span>{" "}
              <span className="font-semibold">
                {status === "loading" && "🔄 Loading..."}
                {status === "authenticated" && "✅ Authenticated"}
                {status === "unauthenticated" && "❌ Not authenticated"}
              </span>
            </p>
          </div>
        </div>

        {/* Session Data */}
        {status === "authenticated" && session?.user && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Session Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">User ID</p>
                <p className="font-mono">{session.user.id || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p>{session.user.email || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p>{session.user.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <p className="font-semibold">{session.user.role || "Not set"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Navigation */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Navigation</h2>
          <p className="text-gray-400 mb-4">
            Try accessing these protected routes to see if your session is working:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/client"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Client Dashboard
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/auth-debug"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Server-Side Debug
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {status === "unauthenticated" && (
              <Link
                href="/login?returnUrl=/session-test"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
            {status === "authenticated" && (
              <button
                onClick={() => {
                  router.push("/api/auth/signout");
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Raw Session Data */}
        {session && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
            <pre className="text-xs text-gray-400 overflow-auto p-4 bg-gray-950 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}





