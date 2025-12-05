'use client';

import { useState, useEffect } from 'react';
import { BarChart3, DollarSign, Users, TrendingUp, Download, Filter, Calendar, AlertCircle } from 'lucide-react';

interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  monthlyTrend: { month: string; amount: number }[];
  topDonors: { name: string; amount: number; count: number }[];
  donationMethods: { method: string; count: number; amount: number }[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersWithAssessment: number;
  userRetention: number;
}

interface ComplianceReport {
  generatedAt: string;
  totalDonations: number;
  totalAmount: number;
  donorCount: number;
  largestDonation: number;
  taxStatus: 'nonprofit_501c3' | 'pending_verification';
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'compliance' | 'stripe'>('overview');
  const [donationStats, setDonationStats] = useState<DonationStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch analytics data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        if (response.ok) {
          const data = await response.json();
          setDonationStats(data.donations);
          setUserStats(data.users);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportCSV = () => {
    // Generate CSV export
    const csv = generateDonationCSV(donationStats);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleGenerateComplianceReport = () => {
    // Generate IRS/tax compliance report
    const report = generateComplianceReport(donationStats);
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const generateDonationCSV = (stats: DonationStats | null) => {
    if (!stats) return '';
    let csv = 'Donation Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Monthly Trend\n';
    csv += 'Month,Amount\n';
    stats.monthlyTrend.forEach((m) => {
      csv += `${m.month},${m.amount}\n`;
    });
    csv += '\nDonation Methods\n';
    csv += 'Method,Count,Amount\n';
    stats.donationMethods.forEach((m) => {
      csv += `${m.method},${m.count},${m.amount}\n`;
    });
    return csv;
  };

  const generateComplianceReport = (stats: DonationStats | null): ComplianceReport => {
    return {
      generatedAt: new Date().toISOString(),
      totalDonations: stats?.monthlyTrend.reduce((sum, m) => sum + m.amount, 0) || 0,
      totalAmount: stats?.totalAmount || 0,
      donorCount: stats?.topDonors.length || 0,
      largestDonation: Math.max(...(stats?.topDonors.map((d) => d.amount) || [0])),
      taxStatus: 'nonprofit_501c3',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive nonprofit analytics and compliance reporting</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                activeTab === 'donations'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                activeTab === 'compliance'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab('stripe')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                activeTab === 'stripe'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Stripe Setup
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Donations</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${donationStats?.totalAmount.toLocaleString() || '0'}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Donation Count</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {donationStats?.monthlyTrend.reduce((sum, m) => sum + 1, 0) || '0'}
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {userStats?.totalUsers || '0'}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Donation</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${donationStats?.averageDonation.toFixed(2) || '0'}
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-orange-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* User Engagement */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Engagement</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{userStats?.activeUsers || '0'}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{userStats?.newUsersThisMonth || '0'}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed Assessment</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{userStats?.usersWithAssessment || '0'}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Retention Rate</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{userStats?.userRetention || '0'}%</p>
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            {donationStats && donationStats.monthlyTrend.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Donation Trend</h2>
                <div className="space-y-2">
                  {donationStats.monthlyTrend.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-gray-600">{month.month}</span>
                      <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(month.amount / (donationStats.totalAmount || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-900 font-semibold">${month.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter
              </button>
            </div>

            {/* Donation Methods */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Donation Methods</h2>
              <div className="space-y-3">
                {donationStats?.donationMethods.map((method) => (
                  <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{method.method}</p>
                      <p className="text-sm text-gray-600">{method.count} donations</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">${method.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Donors */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Supporters</h2>
              <div className="space-y-3">
                {donationStats?.topDonors.map((donor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{donor.name}</p>
                      <p className="text-sm text-gray-600">{donor.count} donations</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">${donor.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Donations as CSV
            </button>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Nonprofit Compliance</h3>
                <p className="text-sm text-blue-800">
                  All donation data is tracked and can be exported for IRS Form 990-N reporting and tax
                  documentation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">IRS Reporting</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Status:</span>
                    <span className="font-semibold text-gray-900">501(c)(3) Nonprofit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Donations:</span>
                    <span className="font-semibold text-gray-900">${donationStats?.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Donors:</span>
                    <span className="font-semibold text-gray-900">{donationStats?.topDonors.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Donation:</span>
                    <span className="font-semibold text-gray-900">
                      ${donationStats?.averageDonation.toFixed(2) || '0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Annual Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-semibold text-gray-900">{new Date().getFullYear()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Report Generated:</span>
                    <span className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateComplianceReport}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Generate IRS Compliance Report (JSON)
            </button>
          </div>
        )}

        {/* Stripe Setup Tab */}
        {activeTab === 'stripe' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Stripe Integration</h3>
                <p className="text-sm text-amber-800">
                  To enable live donations, you'll need to add your Stripe API keys to your environment
                  variables.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Step 1: Get Your Keys</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-600">1.</span>
                    <span>Go to <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stripe.com</a> and sign up</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-600">2.</span>
                    <span>Navigate to API Keys in your dashboard</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-600">3.</span>
                    <span>Copy your Publishable and Secret keys</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-600">4.</span>
                    <span>Add them to your .env.local file</span>
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Step 2: Update .env.local</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-1 overflow-x-auto">
                  <div>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."</div>
                  <div>STRIPE_SECRET_KEY="sk_live_..."</div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Replace pk_live_... and sk_live_... with your actual keys from Stripe
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Step 3: Set Up Webhooks</h3>
              <div className="space-y-3 text-gray-700">
                <p>Add this webhook endpoint to your Stripe dashboard:</p>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/donate/webhook` : 'https://yourdomain.com/api/donate/webhook'}
                </div>
                <p className="text-sm text-gray-600">
                  Listen for: <code className="bg-gray-100 px-2 py-1 rounded">charge.succeeded</code>,{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">charge.failed</code>
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">✓ Ready to Go</h3>
              <p className="text-green-800">
                Once you've added your Stripe keys and restarted the app, the donation page will be fully functional
                and start processing real donations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
