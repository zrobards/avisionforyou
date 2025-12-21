import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export default async function DebugSessionPage() {
  const session = await auth();
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Session Debug Info</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Raw Session (from auth())</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current User (from getCurrentUser())</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Role Constants</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(ROLE, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Role Checks</h2>
          <div className="space-y-2">
            <p>Current user role: <span className="font-mono bg-blue-900 px-2 py-1 rounded">{currentUser?.role}</span></p>
            <p>ROLE.CEO value: <span className="font-mono bg-blue-900 px-2 py-1 rounded">{ROLE.CEO}</span></p>
            <p>Are they equal? <span className="font-mono bg-blue-900 px-2 py-1 rounded">{String(currentUser?.role === ROLE.CEO)}</span></p>
            <p>Type of current role: <span className="font-mono bg-blue-900 px-2 py-1 rounded">{typeof currentUser?.role}</span></p>
            <p>Type of ROLE.CEO: <span className="font-mono bg-blue-900 px-2 py-1 rounded">{typeof ROLE.CEO}</span></p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Admin Access Test</h2>
          <div className="space-y-2">
            <p>Required roles for admin: <span className="font-mono bg-blue-900 px-2 py-1 rounded">{[ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH].join(", ")}</span></p>
            <p>Is role in allowed list? <span className="font-mono bg-blue-900 px-2 py-1 rounded">{String([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH].includes(currentUser?.role as any))}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
