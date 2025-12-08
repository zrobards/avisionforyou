"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiBriefcase, FiMail, FiPhone, FiEdit2, FiEye } from "react-icons/fi";
import { LeadModal } from "./LeadModal";
import { updateLeadStatus, LeadStatus } from "@/server/actions/pipeline";
import { getPipeline } from "@/server/actions";
import { useRouter } from "next/navigation";

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  status: string;
  source?: string | null;
  message?: string | null;
  notes?: string | null;
  serviceType?: string | null;
  timeline?: string | null;
  budget?: string | null;
}

interface PipelineStage {
  id: string;
  label: string;
  leads: Lead[];
}

interface PipelineBoardProps {
  stages: PipelineStage[];
}

const stageColors: Record<string, string> = {
  NEW: "border-blue-500/30 bg-blue-500/5",
  CONTACTED: "border-purple-500/30 bg-purple-500/5",
  QUALIFIED: "border-green-500/30 bg-green-500/5",
  PROPOSAL_SENT: "border-yellow-500/30 bg-yellow-500/5",
  CONVERTED: "border-emerald-500/30 bg-emerald-500/5",
};

export function PipelineBoard({ stages }: PipelineBoardProps) {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggingLead, setDraggingLead] = useState<string | null>(null);

  const handleLeadClick = async (lead: Lead) => {
    try {
      // Verify lead exists before opening modal
      const result = await getPipeline();
      if (result.success) {
        const leadExists = result.leads.some((l: any) => l.id === lead.id);
        if (!leadExists) {
          // Lead was deleted, refresh page
          alert('This lead has been deleted. The page will refresh.');
          router.refresh();
          return;
        }
      }
      setSelectedLead(lead);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error verifying lead:', error);
      alert('Unable to access this lead. The page will refresh.');
      router.refresh();
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggingLead(lead.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.setData("currentStatus", lead.status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const currentStatus = e.dataTransfer.getData("currentStatus");
    
    setDraggingLead(null);

    if (currentStatus !== newStatus) {
      await updateLeadStatus(leadId, newStatus as LeadStatus);
      router.refresh();
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stages.map((stage) => (
          <div
            key={stage.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            className={`rounded-2xl border-2 glass-effect p-4 transition-all ${
              stageColors[stage.id] || "border-gray-700"
            } ${draggingLead ? "ring-2 ring-trinity-red/30" : ""}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-semibold text-white">
                {stage.label}
              </h3>
              <span className="rounded-full bg-gray-800/70 border border-gray-700 px-2.5 py-1 text-xs font-semibold text-gray-300">
                {stage.leads.length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {stage.leads.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800/30 p-6 text-center text-xs text-gray-500">
                  No leads yet
                </div>
              ) : (
                stage.leads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, lead)}
                    onDragEnd={() => setDraggingLead(null)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`group relative rounded-xl border-2 border-gray-700 glass-effect p-4 text-sm text-gray-200 cursor-move transition-all hover:border-trinity-red/50 hover:shadow-medium ${
                      draggingLead === lead.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-white truncate">
                          {lead.name}
                        </p>
                        {lead.company && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 truncate">
                            <FiBriefcase className="h-3 w-3 shrink-0" />
                            {lead.company}
                          </p>
                        )}
                        {lead.email && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 truncate">
                            <FiMail className="h-3 w-3 shrink-0" />
                            {lead.email}
                          </p>
                        )}
                        {lead.phone && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 truncate">
                            <FiPhone className="h-3 w-3 shrink-0" />
                            {lead.phone}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleLeadClick(lead)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 rounded-lg border border-gray-700 bg-gray-800/50 text-gray-400 hover:border-trinity-red/50 hover:text-trinity-red"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {(lead.message || lead.notes) && (
                      <p className="mt-2 line-clamp-2 text-xs text-gray-500 border-t border-gray-700/50 pt-2">
                        {lead.message ?? lead.notes}
                      </p>
                    )}
                    {(lead.budget || lead.timeline) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {lead.budget && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-[10px] font-medium text-green-400">
                            {lead.budget}
                          </span>
                        )}
                        {lead.timeline && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-medium text-blue-400">
                            {lead.timeline}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedLead && (
        <LeadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
        />
      )}
    </>
  );
}

export default PipelineBoard;

