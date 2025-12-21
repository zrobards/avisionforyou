import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AuthDebugPage() {
  let session = null;
  let sessionError: string | null = null;
  
  try {
    session = await auth();
  } catch (error) {
    sessionError = error instanceof Error ? error.message : String(error);
  }

  let dbHealthy = false;
  let dbError: string | null = null;
  let userCount = 0;

  try {
    userCount = await prisma.user.count();
    dbHealthy = true;
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Authentication Debug</h1>
        
        {/* Session Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          {sessionError ? (
            <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded">
              <p className="font-semibold">Error getting session:</p>
              <p className="text-sm mt-2">{sessionError}</p>
            </div>
          ) : session?.user ? (
            <div className="space-y-2">
              <div className="bg-green-900/30 border border-green-700 text-green-300 p-4 rounded">
                <p className="font-semibold">✅ Session found!</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-gray-400 text-sm">User ID</p>
                  <p className="font-mono">{session.user.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p>{session.user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p>{session.user.name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Role</p>
                  <p className="font-semibold">{session.user.role}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 p-4 rounded">
              <p className="font-semibold">⚠️ No session found</p>
              <p className="text-sm mt-2">User is not authenticated</p>
            </div>
          )}
        </div>

        {/* Database Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          {dbError ? (
            <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded">
              <p className="font-semibold">❌ Database connection failed:</p>
              <p className="text-sm mt-2 font-mono break-all">{dbError}</p>
            </div>
          ) : (
            <div className="bg-green-900/30 border border-green-700 text-green-300 p-4 rounded">
              <p className="font-semibold">✅ Database connected</p>
              <p className="text-sm mt-2">Total users: {userCount}</p>
            </div>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">AUTH_SECRET</p>
              <p className="font-mono text-sm">
                {process.env.AUTH_SECRET ? "✅ Set" : "❌ Not set"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">NEXTAUTH_SECRET</p>
              <p className="font-mono text-sm">
                {process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">AUTH_URL</p>
              <p className="font-mono text-sm">
                {process.env.AUTH_URL || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">NEXTAUTH_URL</p>
              <p className="font-mono text-sm">
                {process.env.NEXTAUTH_URL || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">NODE_ENV</p>
              <p className="font-mono text-sm">{process.env.NODE_ENV}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">DATABASE_URL</p>
              <p className="font-mono text-sm">
                {process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {!session?.user && (
          <div className="bg-blue-900/30 border border-blue-700 text-blue-300 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Try signing out and signing in again</li>
              <li>Clear your browser cookies for this site</li>
              <li>Check if database is running and accessible</li>
              <li>Verify AUTH_SECRET or NEXTAUTH_SECRET is set in .env.local</li>
              <li>Check browser console for any errors</li>
              <li>Try accessing /api/auth/session directly</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}





