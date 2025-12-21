"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Mail,
  FileText,
  Send,
  MessageSquare,
  Calendar,
  Repeat,
  Star,
  Wrench,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
} from "lucide-react";
import { TemplateEditor } from "./TemplateEditor";

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  variables: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

interface TemplatesClientProps {
  templates: EmailTemplate[];
}

const categoryConfig: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
  CLIENT_OUTREACH: { icon: Send, color: "text-blue-400 bg-blue-500/20", label: "Client Outreach" },
  PROPOSAL: { icon: FileText, color: "text-purple-400 bg-purple-500/20", label: "Proposal" },
  INVOICE: { icon: Mail, color: "text-green-400 bg-green-500/20", label: "Invoice" },
  PROJECT_UPDATE: { icon: MessageSquare, color: "text-yellow-400 bg-yellow-500/20", label: "Project Update" },
  MEETING_SCHEDULING: { icon: Calendar, color: "text-cyan-400 bg-cyan-500/20", label: "Meeting" },
  FOLLOW_UP: { icon: Repeat, color: "text-orange-400 bg-orange-500/20", label: "Follow-up" },
  WELCOME: { icon: Star, color: "text-pink-400 bg-pink-500/20", label: "Welcome" },
  MAINTENANCE: { icon: Wrench, color: "text-gray-400 bg-gray-500/20", label: "Maintenance" },
};

export function TemplatesClient({ templates }: TemplatesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const categories = ["all", ...Object.keys(categoryConfig)];

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          name: `${template.name} (Copy)`,
          id: undefined,
        }),
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to duplicate template:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
            Communications
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">
            Email Templates
          </h1>
        </div>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setIsCreating(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-trinity-red px-4 py-2.5 text-sm font-medium text-white hover:bg-trinity-maroon transition"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </header>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl border-2 border-gray-700 bg-[#151b2e]">
        {categories.map((cat) => {
          const config = categoryConfig[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-trinity-red text-white"
                  : "bg-[#1a2235] text-gray-400 hover:text-white hover:bg-[#1e2840]"
              }`}
            >
              {cat === "all" ? "All" : config?.label || cat}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      {!isCreating && !selectedTemplate ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, index) => {
            const config = categoryConfig[template.category] || categoryConfig.CLIENT_OUTREACH;
            const Icon = config.icon;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-5 hover:border-trinity-red/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === template.id ? null : template.id)
                      }
                      className="p-1.5 rounded hover:bg-gray-800 transition"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>

                    {openMenuId === template.id && (
                      <div className="absolute right-0 mt-1 w-36 rounded-lg border-2 border-gray-700 bg-[#151b2e] shadow-xl z-10">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1a2235] hover:text-white transition"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDuplicate(template);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1a2235] hover:text-white transition"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(template.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#1a2235] transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm text-gray-400 truncate">
                  {template.subject}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>{config.label}</span>
                  <span>
                    {template.usageCount} use{template.usageCount !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {template.variables.slice(0, 3).map((variable) => (
                    <span
                      key={variable}
                      className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                  {template.variables.length > 3 && (
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400">
                      +{template.variables.length - 3} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View & Edit
                </button>
              </motion.div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No templates in this category</p>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsCreating(true);
                }}
                className="mt-4 text-trinity-red hover:text-trinity-maroon text-sm"
              >
                Create your first template
              </button>
            </div>
          )}
        </div>
      ) : (
        <TemplateEditor
          template={selectedTemplate}
          onClose={() => {
            setSelectedTemplate(null);
            setIsCreating(false);
          }}
          onSave={() => window.location.reload()}
        />
      )}
    </div>
  );
}

export default TemplatesClient;


