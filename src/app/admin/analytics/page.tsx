'use client';

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <p className="text-gray-600">Under maintenance - coming back soon</p>
      </div>
    </div>
  );
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsersLast30Days: number;
    newUsersLast30Days: number;
    userGrowthRate: number;
    retentionRate: number;
    userGrowthTrend: { month: string; count: number }[];
  };
  donations: {
    total: number;
    last30Days: number;
    totalAmount: number;
    amountLast30Days: number;
    averageDonation: number;
    conversionRate: number;
    recurringDonors: number;
    growthRate: number;
    donationTrend: { month: string; amount: number; count: number }[];
    donationMethods: { method: string; count: number; amount: number }[];
    topDonors: { name: string; amount: number; count: number }[];
  };
  engagement: {
    totalMeetings: number;
    upcomingMeetings: number;
    totalRSVPs: number;
    rsvpsLast30Days: number;
    attendanceRate: number;
    avgRSVPsPerUser: number;
    popularMeetings: { id: string; title: string; startDate: string; _count: { rsvps: number } }[];
  };
  programs: {
    assessmentsCompleted: number;
    programInterest: { program: string; count: number }[];
  };
  admissions: {
    totalInquiries: number;
    inquiriesLast30Days: number;
    responseRate: number;
  };
  content: {
    totalBlogPosts: number;
    totalBlogViews: number;
    avgViewsPerPost: number;
  };
  funnel: {
    assessmentCompleted: number;
    assessmentToRSVP: number;
    rsvpToDonation: number;
    assessmentToRSVPRate: number;
    rsvpToDonationRate: number;
  };
  insights: { type: string; title: string; message: string }[];
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      loadData();
    }
  }, [status, router, session]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getTrendIcon = (value: number) => {
    if (value > 5) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (value < -5) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 5) return 'text-green-600';
    if (value < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  const exportData = () => {
    if (!data) return;
    const csv = `Analytics Report - ${new Date().toLocaleDateString()}

OVERVIEW
Total Users,${data.overview.totalUsers}
Active Users (30d),${data.overview.activeUsersLast30Days}
Donation Conversion,${data.donations.conversionRate}%
`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights for nonprofit growth</p>
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Donation Methods */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Donation Methods Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.donations.donationMethods.map((method, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">{method.method}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(method.amount)}</p>
                <p className="text-sm text-gray-600">{method.count} donations</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Banner */}
        {data.insights.length > 0 && (
          <div className="mb-8 space-y-3">
            {data.insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'success'
                    ? 'bg-green-50 border-green-500'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    insight.type === 'success'
                      ? 'text-green-600'
                      : insight.type === 'warning'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {getTrendIcon(data.overview.userGrowthRate)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.totalUsers.toLocaleString()}</p>
            <p className={`text-sm mt-2 ${getTrendColor(data.overview.userGrowthRate)}`}>
              {data.overview.userGrowthRate > 0 ? '+' : ''}{data.overview.userGrowthRate}% this month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              {getTrendIcon(data.donations.growthRate)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.donations.totalAmount)}</p>
            <p className={`text-sm mt-2 ${getTrendColor(data.donations.growthRate)}`}>
              {data.donations.growthRate > 0 ? '+' : ''}{data.donations.growthRate}% this month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Retention Rate</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.retentionRate}%</p>
            <p className="text-sm text-gray-600 mt-2">90-day cohort</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-gray-900">{data.donations.conversionRate}%</p>
            <p className="text-sm text-gray-600 mt-2">Users who donate</p>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Journey Funnel</h2>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Assessment Completed</p>
                    <p className="text-sm text-gray-600">{data.funnel.assessmentCompleted} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">RSVP to Meeting</p>
                    <p className="text-sm text-gray-600">{data.funnel.assessmentToRSVP} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{data.funnel.assessmentToRSVPRate}%</p>
                  <p className="text-sm text-gray-600">conversion</p>
                </div>
              </div>
            </div>

            <div className="pl-12 border-l-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Made Donation</p>
                    <p className="text-sm text-gray-600">{data.funnel.rsvpToDonation} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{data.funnel.rsvpToDonationRate}%</p>
                  <p className="text-sm text-gray-600">conversion</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">User Growth Trend</h2>
            <div className="space-y-3">
              {data.overview.userGrowthTrend.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 w-20">{item.month}</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.max((item.count / Math.max(...data.overview.userGrowthTrend.map(i => i.count))) * 100, 5)}%`
                      }}
                    >
                      <span className="text-xs font-semibold text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donation Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Donation Revenue Trend</h2>
            <div className="space-y-3">
              {data.donations.donationTrend.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 w-20">{item.month}</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.max((item.amount / Math.max(...data.donations.donationTrend.map(i => i.amount))) * 100, 5)}%`
                      }}
                    >
                      <span className="text-xs font-semibold text-white">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Donors */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Donors</h2>
            <div className="space-y-3">
              {data.donations.topDonors.map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{donor.name}</p>
                      <p className="text-sm text-gray-600">{donor.count} donations</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(donor.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Program Interest */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Program Interest</h2>
            <div className="space-y-3">
              {data.programs.programInterest.map((program, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <p className="text-sm text-gray-700 w-40 truncate">{program.program}</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.max((program.count / Math.max(...data.programs.programInterest.map(p => p.count))) * 100, 10)}%`
                      }}
                    >
                      <span className="text-xs font-semibold text-white">{program.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Meeting Engagement</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Meetings:</span>
                <span className="font-semibold">{data.engagement.totalMeetings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total RSVPs:</span>
                <span className="font-semibold">{data.engagement.totalRSVPs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Attendance Rate:</span>
                <span className="font-semibold text-green-600">{data.engagement.attendanceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg RSVPs/User:</span>
                <span className="font-semibold">{data.engagement.avgRSVPsPerUser.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Content Performance</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Published Posts:</span>
                <span className="font-semibold">{data.content.totalBlogPosts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Views:</span>
                <span className="font-semibold">{data.content.totalBlogViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Views/Post:</span>
                <span className="font-semibold text-purple-600">{data.content.avgViewsPerPost}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Admission Inquiries</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Inquiries:</span>
                <span className="font-semibold">{data.admissions.totalInquiries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last 30 Days:</span>
                <span className="font-semibold">{data.admissions.inquiriesLast30Days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Rate:</span>
                <span className="font-semibold text-green-600">{data.admissions.responseRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Methods */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Donation Methods Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.donations.donationMethods.map((method, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">{method.method}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(method.amount)}</p>
                <p className="text-sm text-gray-600">{method.count} donations</p>
              </div>
            ))}
          </div>
        </div>

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
