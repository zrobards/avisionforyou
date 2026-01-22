/**
 * Community Dashboard
 * Main dashboard for community members and alumni
 */

import { getCurrentUser } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function CommunityDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Community Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome, {user?.name || user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Community Resources</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Access to community events, forums, and resources
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Alumni Network</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with fellow alumni and community members
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Client Portal</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Access to the standard client dashboard features
          </p>
        </div>
      </div>
    </div>
  );
}
