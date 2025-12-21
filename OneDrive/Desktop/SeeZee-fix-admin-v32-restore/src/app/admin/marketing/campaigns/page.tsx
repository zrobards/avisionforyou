import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Send, Plus, Calendar, Users, TrendingUp, MousePointer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch all campaigns
  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      template: true,
      _count: {
        select: { leads: true },
      },
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Send className="w-8 h-8 text-cyan-400" />
            Email Campaigns
          </h1>
          <p className="text-slate-400 mt-1">
            Create and track email campaigns to your leads
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

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center">
          <Send className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
          <p className="text-slate-400 mb-6">
            Create your first email campaign to reach out to leads
          </p>
          <Link
            href="/admin/marketing/campaigns/new"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/80 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Campaign</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Template</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Recipients</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Sent</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Opens</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Clicks</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((campaign) => {
                  const openRate = campaign.totalSent > 0
                    ? Math.round((campaign.opened / campaign.totalSent) * 100)
                    : 0;
                  const clickRate = campaign.opened > 0
                    ? Math.round((campaign.clicked / campaign.opened) * 100)
                    : 0;

                  return (
                    <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/admin/marketing/campaigns/${campaign.id}`}
                          className="font-medium text-white hover:text-cyan-400 transition-colors"
                        >
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-400">{campaign.template.name}</td>
                      <td className="p-4 text-center text-white">{campaign._count.leads}</td>
                      <td className="p-4 text-center text-white">{campaign.totalSent}</td>
                      <td className="p-4 text-center">
                        <span className={`${openRate >= 50 ? "text-green-400" : openRate >= 25 ? "text-amber-400" : "text-slate-400"}`}>
                          {openRate}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`${clickRate >= 20 ? "text-green-400" : clickRate >= 10 ? "text-amber-400" : "text-slate-400"}`}>
                          {clickRate}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.status === "SENT"
                              ? "bg-green-500/20 text-green-400"
                              : campaign.status === "SENDING"
                              ? "bg-amber-500/20 text-amber-400"
                              : campaign.status === "SCHEDULED"
                              ? "bg-blue-500/20 text-blue-400"
                              : campaign.status === "PAUSED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-400 text-sm">
                        {campaign.sentAt
                          ? new Date(campaign.sentAt).toLocaleDateString()
                          : campaign.scheduledFor
                          ? new Date(campaign.scheduledFor).toLocaleDateString()
                          : new Date(campaign.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

