/**
 * Board Member Dashboard
 * Main dashboard for board members
 */

import { getCurrentUser } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function BoardDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Board Member Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome, {user?.name || user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Board Overview</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Access to board-specific information and resources
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Community Access</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Board members have full access to community features
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
