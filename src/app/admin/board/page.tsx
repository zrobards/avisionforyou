'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, FileText, Users, Calendar, Lock, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function BoardPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    documentsCount: 0,
    meetingsCount: 0,
    membersCount: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch board stats
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/board/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch board stats:', error);
      }
    }

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || 'USER';
  const isBoardMember = userRole.startsWith('BOARD_') || userRole === 'ADMIN';

  if (!isBoardMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This area is restricted to board members only. If you believe you should have access,
            please contact an administrator.
          </p>
          <Link
            href="/admin"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const boardFeatures = [
    {
      title: 'Board Documents',
      description: 'Access financial reports, meeting minutes, bylaws, and confidential documents',
      icon: FileText,
      href: '/admin/board/documents',
      color: 'indigo',
      count: stats.documentsCount,
    },
    {
      title: 'Board Meetings',
      description: 'Schedule meetings, manage agendas, and track attendance',
      icon: Calendar,
      href: '/admin/board/meetings',
      color: 'blue',
      count: stats.meetingsCount,
    },
    {
      title: 'Board Members',
      description: 'Manage board member roster, roles, and contact information',
      icon: Users,
      href: '/admin/board/members',
      color: 'green',
      count: stats.membersCount,
    },
    {
      title: 'Financial Overview',
      description: 'View financial summaries, budgets, and donation reports',
      icon: TrendingUp,
      href: '/admin/board/financials',
      color: 'purple',
      count: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Board Portal</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            Welcome, {session?.user?.name || 'Board Member'}
          </p>
          <p className="text-indigo-200 text-sm mt-1">
            Role: {userRole.replace(/_/g, ' ').replace('BOARD ', 'Board ')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Security Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">Confidential Information</h3>
              <p className="text-yellow-800">
                All information in the Board Portal is strictly confidential. Do not share documents,
                discussions, or access credentials with anyone outside the board. All actions are logged
                for security and compliance purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Board Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {boardFeatures.map((feature) => {
            const Icon = feature.icon;
            const colorClasses = {
              indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
              blue: 'bg-blue-100 text-blue-600 border-blue-200',
              green: 'bg-green-100 text-green-600 border-green-200',
              purple: 'bg-purple-100 text-purple-600 border-purple-200',
            };

            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border-l-4 border-transparent hover:border-indigo-600"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      {feature.count !== null && (
                        <span className="text-2xl font-bold text-gray-400">{feature.count}</span>
                      )}
                    </div>
                    <p className="text-gray-600">{feature.description}</p>
                    <span className="text-indigo-600 font-semibold mt-3 inline-block">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition">
              <FileText className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Upload Document</h3>
              <p className="text-sm text-gray-600">Add new board document</p>
            </button>
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition">
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Schedule Meeting</h3>
              <p className="text-sm text-gray-600">Create new board meeting</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition">
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">View Reports</h3>
              <p className="text-sm text-gray-600">Access financial reports</p>
            </button>
          </div>
        </div>

        {/* Information Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Board Portal Features</h3>
              <p className="text-blue-800 mb-3">
                The Board Portal provides secure access to confidential organizational information.
                Features include:
              </p>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• Secure document storage and sharing</li>
                <li>• Board meeting management and minutes</li>
                <li>• Financial reports and budgets</li>
                <li>• Member directory and contact information</li>
                <li>• Audit trail for all board activities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
