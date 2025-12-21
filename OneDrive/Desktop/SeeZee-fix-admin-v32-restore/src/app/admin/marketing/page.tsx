import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Mail, FileText, Send, BarChart3, Plus, 
  TrendingUp, Users, MousePointer, MessageSquare 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MarketingDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Only CEO, CFO, or OUTREACH roles can access
  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch templates
  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch campaigns
  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      template: true,
      _count: {
        select: { leads: true },
      },
    },
  });

  // Calculate stats
  const totalSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked, 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + c.replied, 0);
  
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-cyan-400" />
            Email Marketing
          </h1>
          <p className="text-slate-400 mt-1">
            Manage templates, campaigns, and track performance
          </p>
        </div>
        <Link
          href="/admin/marketing/campaigns/new"
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Sent"
          value={totalSent.toLocaleString()}
          icon={Send}
          color="blue"
        />
        <StatCard
          label="Open Rate"
          value={`${openRate}%`}
          icon={TrendingUp}
          color="green"
          subtext={`${totalOpened.toLocaleString()} opened`}
        />
        <StatCard
          label="Click Rate"
          value={`${clickRate}%`}
          icon={MousePointer}
          color="amber"
          subtext={`${totalClicked.toLocaleString()} clicks`}
        />
        <StatCard
          label="Replies"
          value={totalReplied.toLocaleString()}
          icon={MessageSquare}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              Recent Campaigns
            </h2>
            <Link href="/admin/marketing/campaigns" className="text-sm text-cyan-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {campaigns.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No campaigns yet</p>
                <Link
                  href="/admin/marketing/campaigns/new"
                  className="text-cyan-400 hover:underline mt-2 inline-block"
                >
                  Create your first campaign
                </Link>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/admin/marketing/campaigns/${campaign.id}`}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-white">{campaign.name}</h3>
                    <p className="text-sm text-slate-400">
                      {campaign.template.name} • {campaign._count.leads} recipients
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        campaign.status === "SENT"
                          ? "bg-green-500/20 text-green-400"
                          : campaign.status === "SENDING"
                          ? "bg-amber-500/20 text-amber-400"
                          : campaign.status === "SCHEDULED"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {campaign.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Email Templates
            </h2>
            <Link href="/admin/marketing/templates" className="text-sm text-cyan-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {templates.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No templates yet</p>
                <Link
                  href="/admin/marketing/templates/new"
                  className="text-cyan-400 hover:underline mt-2 inline-block"
                >
                  Create your first template
                </Link>
              </div>
            ) : (
              templates.map((template) => (
                <Link
                  key={template.id}
                  href={`/admin/marketing/templates/${template.id}`}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <p className="text-sm text-slate-400">{template.category}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      template.active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {template.active ? "Active" : "Inactive"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/marketing/templates/new"
          className="p-6 bg-slate-900/50 border border-white/10 rounded-xl hover:border-purple-500/50 transition-colors group"
        >
          <FileText className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
            Create Template
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Design a new email template with variables
          </p>
        </Link>
        <Link
          href="/admin/marketing/campaigns/new"
          className="p-6 bg-slate-900/50 border border-white/10 rounded-xl hover:border-cyan-500/50 transition-colors group"
        >
          <Send className="w-8 h-8 text-cyan-400 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
            New Campaign
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Send emails to leads based on filters
          </p>
        </Link>
        <Link
          href="/admin/leads/finder"
          className="p-6 bg-slate-900/50 border border-white/10 rounded-xl hover:border-green-500/50 transition-colors group"
        >
          <Users className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
            Find Leads
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Discover nonprofits that need websites
          </p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  subtext?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    amber: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6" />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm opacity-80">{label}</p>
          {subtext && <p className="text-xs opacity-60 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

