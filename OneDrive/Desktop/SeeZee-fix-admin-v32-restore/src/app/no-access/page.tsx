/**
 * No Access Page - Shows when user doesn't have permission
 * This page does NOT redirect anywhere to prevent redirect loops
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import Link from "next/link";
import { ROLE } from "@/lib/role";

export default async function NoAccessPage() {
  const user = await getCurrentUser();

  // Determine where to send the user based on their role
  const getDashboardLink = () => {
    if (!user) return "/login";
    
    if (user.role === ROLE.CEO || user.role === ROLE.CFO || 
        user.role === ROLE.FRONTEND || user.role === ROLE.BACKEND || 
        user.role === ROLE.OUTREACH) {
      return "/admin";
    }
    
    return "/client";
  };

  const dashboardLink = getDashboardLink();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">
            Access Denied
          </h1>
          
          <p className="text-gray-300 mb-6">
            You don't have permission to access this page.
            {user && (
              <span className="block mt-2 text-sm text-gray-400">
                Your current role: <span className="font-semibold text-gray-300">{user.role}</span>
              </span>
            )}
          </p>

          <div className="space-y-3">
            <Link
              href={dashboardLink}
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 text-center"
            >
              {user ? "Go to Dashboard" : "Go to Login"}
            </Link>
            
            {user && (
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Go to Home
              </Link>
            )}
          </div>

          {!user && (
            <p className="mt-6 text-sm text-gray-400">
              If you believe this is an error, please contact support.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}





