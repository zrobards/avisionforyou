'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, FileText, Calendar, Users, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function BoardDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || 'USER';
  const isBoardMember = [
    'BOARD_PRESIDENT',
    'BOARD_VP',
    'BOARD_TREASURER',
    'BOARD_SECRETARY',
    'BOARD_MEMBER',
    'ADMIN'
  ].includes(userRole);

  if (!isBoardMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            This area is restricted to board members only. If you believe you should have access,
            please contact an administrator.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getRoleDisplay = (role: string): string => {
    const roleMap: Record<string, string> = {
      BOARD_PRESIDENT: 'Board President',
      BOARD_VP: 'Board Vice President',
      BOARD_TREASURER: 'Board Treasurer',
      BOARD_SECRETARY: 'Board Secretary',
      BOARD_MEMBER: 'Board Member',
      ADMIN: 'Administrator',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <div>
              <h1 className="text-4xl font-bold">Board Member Portal</h1>
              <p className="text-indigo-100 text-lg mt-1">
                Welcome, {session?.user?.name || 'Board Member'}
              </p>
              <p className="text-indigo-200 text-sm mt-1">
                Role: {getRoleDisplay(userRole)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Board Documents */}
          <Link
            href="/admin/board/documents"
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border-l-4 border-indigo-600"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                <FileText className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Board Documents</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Access financial reports, meeting minutes, bylaws, and confidential documents
                </p>
                <span className="text-indigo-600 font-semibold text-sm">View Documents →</span>
              </div>
            </div>
          </Link>

          {/* Board Meetings */}
          <Link
            href="/admin/board/meetings"
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border-l-4 border-blue-600"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Board Meetings</h3>
                <p className="text-gray-600 text-sm mb-3">
                  View upcoming meetings, agendas, and access past meeting minutes
                </p>
                <span className="text-blue-600 font-semibold text-sm">View Meetings →</span>
              </div>
            </div>
          </Link>

          {/* Board Members */}
          <Link
            href="/admin/board/members"
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border-l-4 border-green-600"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Users className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Board Directory</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Access board member contact information and directory
                </p>
                <span className="text-green-600 font-semibold text-sm">View Directory →</span>
              </div>
            </div>
          </Link>

          {/* Organizational Overview */}
          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border-l-4 border-purple-600"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics & Reports</h3>
                <p className="text-gray-600 text-sm mb-3">
                  View program outcomes, financial summaries, and key metrics
                </p>
                <span className="text-purple-600 font-semibold text-sm">View Analytics →</span>
              </div>
            </div>
          </Link>

          {/* Public Website */}
          <Link
            href="/"
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border-l-4 border-gray-600"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gray-100 text-gray-600">
                <ExternalLink className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Public Website</h3>
                <p className="text-gray-600 text-sm mb-3">
                  View the public-facing AVFY website
                </p>
                <span className="text-gray-600 font-semibold text-sm">Go to Website →</span>
              </div>
            </div>
          </Link>

          {/* Admin Portal (if admin) */}
          {userRole === 'ADMIN' && (
            <Link
              href="/admin"
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border-l-4 border-red-600"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-red-100 text-red-600">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Portal</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Full administrator access to manage the system
                  </p>
                  <span className="text-red-600 font-semibold text-sm">Go to Admin →</span>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Confidentiality Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Confidentiality Notice
            </h3>
            <p className="text-yellow-800 text-sm">
              All information accessed through the Board Member Portal is strictly confidential.
              Do not share documents, discussions, or access credentials with anyone outside the
              board. All actions are logged for security and compliance.
            </p>
          </div>

          {/* Board Resources */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Board Resources</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Quarterly board meetings - Second Thursday of each quarter</li>
              <li>• Monthly financial reports available by the 10th</li>
              <li>• Committee meetings scheduled separately</li>
              <li>• Emergency board meetings called as needed</li>
            </ul>
          </div>
        </div>

        {/* Governance Statement */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Board Governance</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              As a board member of A Vision For You, you play a critical role in organizational
              governance, strategic direction, and financial oversight. Your responsibilities
              include:
            </p>
            <ul className="space-y-2 mb-4">
              <li>Reviewing and approving annual budgets and major expenditures</li>
              <li>Ensuring compliance with legal and regulatory requirements</li>
              <li>Providing strategic guidance for programs and services</li>
              <li>Supporting fundraising and community engagement efforts</li>
              <li>Attending quarterly board meetings and relevant committee meetings</li>
            </ul>
            <p className="text-sm text-gray-500 mt-6">
              For questions about board responsibilities or governance matters, please contact the
              Board President or Executive Director.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
