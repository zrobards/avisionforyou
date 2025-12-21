"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, Mail, Phone, DollarSign, Folder, FileText, Users, Calendar, MapPin, Globe, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { CurrentUser } from "@/lib/auth/requireRole";

interface ClientDetailClientProps {
  clientData: {
    id: string;
    type: "organization" | "lead" | "project";
    organization: any;
    lead: any;
    project: any;
  };
  user: CurrentUser;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const invoiceStatusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const projectStatusColors: Record<string, string> = {
  PLANNING: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  LEAD: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  ACTIVE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  REVIEW: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function ClientDetailClient({ clientData, user }: ClientDetailClientProps) {
  const router = useRouter();
  
  const org = clientData.organization;
  const lead = clientData.lead;
  const project = clientData.project;

  // Determine client name and basic info
  const clientName = org?.name || lead?.name || project?.name || "Unknown Client";
  const clientEmail = org?.email || lead?.email || "No email";
  const clientCompany = org?.name || lead?.company || project?.organization?.name || "N/A";

  // Get projects and invoices
  const projects = org?.projects || (lead?.organization?.projects) || (project ? [project] : []) || [];
  const invoices = org?.invoices || (lead?.organization?.invoices) || project?.invoices || [];
  const leads = org?.leads || (lead ? [lead] : []) || [];

  // Calculate totals
  const totalRevenue = invoices
    .filter((inv: any) => inv.status === "PAID")
    .reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);
  
  const totalInvoices = invoices.length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => 
    ["ACTIVE", "IN_PROGRESS", "REVIEW"].includes(p.status)
  ).length;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-heading font-bold gradient-text">{clientName}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {clientData.type === "organization" && "Organization"}
                {clientData.type === "lead" && "Lead"}
                {clientData.type === "project" && "Project"}
                {" • "}
                {clientEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-effect rounded-xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Projects</span>
              <Folder className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalProjects}</div>
            <div className="text-xs text-gray-500 mt-1">{activeProjects} active</div>
          </div>

          <div className="glass-effect rounded-xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Invoices</span>
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalInvoices}</div>
            <div className="text-xs text-gray-500 mt-1">
              {invoices.filter((inv: any) => inv.status === "PAID").length} paid
            </div>
          </div>

          <div className="glass-effect rounded-xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Revenue</span>
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{currencyFormatter.format(totalRevenue)}</div>
            <div className="text-xs text-gray-500 mt-1">Paid invoices</div>
          </div>

          <div className="glass-effect rounded-xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Leads</span>
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">{leads.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {leads.filter((l: any) => l.status === "CONVERTED").length} converted
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800/50 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects ({totalProjects})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({totalInvoices})</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Information */}
              <div className="glass-effect rounded-xl border-2 border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Client Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Name</div>
                    <div className="font-medium text-white">{clientName}</div>
                  </div>
                  {clientEmail && clientEmail !== "No email" && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </div>
                      <a
                        href={`mailto:${clientEmail}`}
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {clientEmail}
                      </a>
                    </div>
                  )}
                  {org?.phone && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </div>
                      <a
                        href={`tel:${org.phone}`}
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {org.phone}
                      </a>
                    </div>
                  )}
                  {org?.website && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Website
                      </div>
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {org.website}
                      </a>
                    </div>
                  )}
                  {org?.address && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Address
                      </div>
                      <div className="font-medium text-white">
                        {org.address}
                        {org.city && `, ${org.city}`}
                        {org.state && `, ${org.state}`}
                        {org.zipCode && ` ${org.zipCode}`}
                      </div>
                    </div>
                  )}
                  {org?.createdAt && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Created
                      </div>
                      <div className="font-medium text-white">
                        {new Date(org.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Members */}
              {org?.members && org.members.length > 0 && (
                <div className="glass-effect rounded-xl border-2 border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Team Members ({org.members.length})
                  </h3>
                  <div className="space-y-3">
                    {org.members.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {member.user?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-400">{member.user?.email}</div>
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {member.role?.toLowerCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.map((proj: any) => (
                  <Link
                    key={proj.id}
                    href={`/admin/pipeline/projects/${proj.id}`}
                    className="block glass-effect rounded-xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{proj.name}</h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${
                              projectStatusColors[proj.status] || projectStatusColors.LEAD
                            }`}
                          >
                            {proj.status?.replace("_", " ")}
                          </span>
                        </div>
                        {proj.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {proj.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {proj.assignee && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {proj.assignee.name}
                            </div>
                          )}
                          {proj.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(proj.createdAt).toLocaleDateString()}
                            </div>
                          )}
                          {proj.budget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {currencyFormatter.format(Number(proj.budget))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="glass-effect rounded-xl border-2 border-gray-700 p-12 text-center">
                  <Folder className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No projects found for this client</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <div className="space-y-4">
              {invoices.length > 0 ? (
                invoices.map((invoice: any) => (
                  <Link
                    key={invoice.id}
                    href={`/admin/pipeline/invoices/${invoice.id}`}
                    className="block glass-effect rounded-xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">
                            {invoice.title || invoice.number || "Invoice"}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${
                              invoiceStatusColors[invoice.status] || invoiceStatusColors.DRAFT
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          {invoice.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </div>
                          )}
                          {invoice.dueDate && (
                            <div className="flex items-center gap-1">
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {invoice.project && (
                            <div className="flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {invoice.project.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {currencyFormatter.format(Number(invoice.total || 0))}
                        </div>
                        {invoice.paidAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid {new Date(invoice.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="glass-effect rounded-xl border-2 border-gray-700 p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No invoices found for this client</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <div className="space-y-4">
              {/* Organization Members */}
              {org?.members && org.members.length > 0 && (
                <div className="glass-effect rounded-xl border-2 border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
                  <div className="space-y-3">
                    {org.members.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium text-white">
                              {member.user?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-400">{member.user?.email}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {member.role?.toLowerCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead Contacts */}
              {leads.length > 0 && (
                <div className="glass-effect rounded-xl border-2 border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Lead Contacts</h3>
                  <div className="space-y-3">
                    {leads.map((l: any) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-white">{l.name}</div>
                          <div className="text-sm text-gray-400">{l.email}</div>
                          {l.phone && <div className="text-sm text-gray-500">{l.phone}</div>}
                        </div>
                        <Link
                          href={`/admin/pipeline/leads/${l.id}`}
                          className="text-xs text-blue-400 hover:underline"
                        >
                          View Lead →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!org?.members || org.members.length === 0) && leads.length === 0 && (
                <div className="glass-effect rounded-xl border-2 border-gray-700 p-12 text-center">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No contacts found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}

