"use client";

import { useEffect, useState } from "react";
import PipelineBoard from "@/components/admin/pipeline/PipelineBoard";
import { getPipeline } from "@/server/actions";
import { EnhancedStatCard } from "@/components/admin/shared/EnhancedStatCard";
import { FiTrendingUp, FiUsers, FiCheckCircle, FiPercent } from "react-icons/fi";
import Link from "next/link";

const STAGES = [
  { id: "NEW", label: "New Lead" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent" },
  { id: "CONVERTED", label: "Converted" },
];

export default function PipelineOverview() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPipeline = async () => {
    const pipelineResult = await getPipeline();
    setLeads(pipelineResult.success ? pipelineResult.leads : []);
    setLoading(false);
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  // Refresh data when page becomes visible (handles case when user navigates back after deletion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadPipeline();
      }
    };

    const handleFocus = () => {
      loadPipeline();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const stages = STAGES.map((stage) => ({
    id: stage.id,
    label: stage.label,
    leads: leads
      .filter((lead: any) => lead.status === stage.id)
      .map((lead: any) => ({
        id: lead.id,
        name: lead.name ?? "Unnamed Lead",
        email: lead.email,
        phone: lead.phone,
        company: lead.company ?? lead.organization?.name ?? null,
        status: lead.status,
        source: lead.source,
        message: lead.message,
        notes: lead.notes,
        serviceType: lead.serviceType,
        timeline: lead.timeline,
        budget: lead.budget,
      })),
  }));

  const totalLeads = leads.length;
  const converted = leads.filter((lead: any) => lead.status === "CONVERTED").length;
  const contacted = leads.filter((lead: any) => lead.status === "CONTACTED").length;
  const qualified = leads.filter((lead: any) => lead.status === "QUALIFIED").length;

  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-3 relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
            Growth Engine
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">
            Pipeline
          </h1>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading pipeline...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
              Growth Engine
            </span>
            <h1 className="text-4xl font-heading font-bold gradient-text">
              Pipeline
            </h1>
          </div>
          <Link
            href="/admin/pipeline/leads"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-trinity-red/40 bg-trinity-red/10 px-5 py-2.5 text-sm font-medium text-trinity-red transition-all hover:bg-trinity-red hover:text-white hover:shadow-large hover:border-trinity-red"
          >
            View All Leads →
          </Link>
        </div>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Visualize deal flow at every stage—from discovery to signature. Stay ahead of follow-ups, velocity, and revenue forecasting.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatCard
          label="Total Leads"
          value={totalLeads}
          icon={FiTrendingUp}
          iconColor="text-trinity-red"
          iconBgColor="bg-trinity-red/20"
          subtitle="In pipeline"
        />
        <EnhancedStatCard
          label="Contacted"
          value={contacted}
          icon={FiUsers}
          iconColor="text-purple-400"
          iconBgColor="bg-purple-500/20"
          subtitle="Active conversations"
        />
        <EnhancedStatCard
          label="Qualified"
          value={qualified}
          icon={FiCheckCircle}
          iconColor="text-green-400"
          iconBgColor="bg-green-500/20"
          subtitle="Ready to propose"
        />
        <EnhancedStatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={FiPercent}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/20"
          subtitle={`${converted} converted`}
        />
      </section>

      <PipelineBoard stages={stages} />
    </div>
  );
}


