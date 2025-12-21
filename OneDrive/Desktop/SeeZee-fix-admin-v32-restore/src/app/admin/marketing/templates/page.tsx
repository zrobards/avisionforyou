import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Plus, Edit } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch all templates
  const templates = await prisma.emailTemplate.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // Group by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  const categoryLabels: Record<string, string> = {
    CLIENT_OUTREACH: "Client Outreach",
    PROPOSAL: "Proposals",
    INVOICE: "Invoices",
    PROJECT_UPDATE: "Project Updates",
    MEETING_SCHEDULING: "Meeting Scheduling",
    FOLLOW_UP: "Follow Up",
    WELCOME: "Welcome Emails",
    MAINTENANCE: "Maintenance",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-400" />
            Email Templates
          </h1>
          <p className="text-slate-400 mt-1">
            Create and manage reusable email templates
          </p>
        </div>
        <Link
          href="/admin/marketing/templates/new"
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      </div>

      {/* Templates by Category */}
      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No templates yet</h3>
          <p className="text-slate-400 mb-6">
            Create your first email template to get started
          </p>
          <Link
            href="/admin/marketing/templates/new"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category} className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-slate-900/80">
                <h2 className="text-lg font-semibold text-white">
                  {categoryLabels[category] || category}
                </h2>
                <p className="text-sm text-slate-400">
                  {categoryTemplates.length} template{categoryTemplates.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {categoryTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-400 truncate">{template.subject}</p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {template.variables.map((variable, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded"
                            >
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {template.active ? "Active" : "Inactive"}
                      </span>
                      <Link
                        href={`/admin/marketing/templates/${template.id}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pre-built Template Suggestions */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">💡 Suggested Templates</h3>
        <p className="text-slate-400 text-sm mb-4">
          Click to create pre-designed templates for common scenarios
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Nonprofit Outreach", category: "CLIENT_OUTREACH" },
            { name: "Welcome Email", category: "WELCOME" },
            { name: "Invoice Sent", category: "INVOICE" },
            { name: "Project Update", category: "PROJECT_UPDATE" },
          ].map((suggestion) => (
            <Link
              key={suggestion.name}
              href={`/admin/marketing/templates/new?preset=${encodeURIComponent(suggestion.name)}`}
              className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg hover:border-purple-500/50 transition-colors text-center"
            >
              <span className="text-white font-medium">{suggestion.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

