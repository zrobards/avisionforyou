import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import { buildClientProjectWhere } from "@/lib/client-access";
import InvoicesTableClient from "@/components/client/InvoicesTableClient";
import { FiFileText, FiDollarSign, FiClock, FiCheckCircle } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const session = await requireAuth();

  const identity = { userId: session.user.id, email: session.user.email };
  const accessWhere = await buildClientProjectWhere(identity);

  // Get user's organizations
  const orgMemberships = await db.organizationMember.findMany({
    where: { userId: session.user.id },
    select: { organizationId: true },
  });

  const organizationIds = orgMemberships.map((m) => m.organizationId);

  // Get invoices from accessible projects AND organization-level invoices
  const projects = await db.project.findMany({
    where: accessWhere,
    select: { id: true },
  });

  const projectIds = projects.map((p) => p.id);

  const rawInvoices = organizationIds.length > 0
    ? await db.invoice.findMany({
        where: {
          OR: [
            // Invoices linked to accessible projects
            ...(projectIds.length > 0 ? [{ projectId: { in: projectIds } }] : []),
            // Organization-level invoices (for hour packs, etc.)
            { organizationId: { in: organizationIds } },
          ],
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  // Convert Decimal fields to numbers for client component serialization
  // Explicitly construct the object to avoid serialization issues with Prisma Decimal types
  const invoices = rawInvoices.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    amount: Number(invoice.amount),
    tax: Number(invoice.tax || 0),
    total: Number(invoice.total),
    currency: invoice.currency,
    description: invoice.description,
    title: invoice.title,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    paidAt: invoice.paidAt?.toISOString() || null,
    sentAt: invoice.sentAt?.toISOString() || null,
    organizationId: invoice.organizationId,
    projectId: invoice.projectId,
    project: invoice.project,
    stripeInvoiceId: invoice.stripeInvoiceId,
    invoiceType: invoice.invoiceType,
    isFirstInvoice: invoice.isFirstInvoice,
    leadId: invoice.leadId,
    customerApprovedAt: invoice.customerApprovedAt?.toISOString() || null,
    adminApprovedAt: invoice.adminApprovedAt?.toISOString() || null,
  }));

  // Calculate stats
  const totalPaid = invoices
    .filter((i) => i.status.toUpperCase() === "PAID")
    .reduce((sum, i) => sum + i.total, 0);
  const totalPending = invoices
    .filter((i) => ["SENT", "DRAFT"].includes(i.status.toUpperCase()))
    .reduce((sum, i) => sum + i.total, 0);
  const totalOverdue = invoices
    .filter((i) => i.status.toUpperCase() === "OVERDUE")
    .reduce((sum, i) => sum + i.total, 0);
  const paidCount = invoices.filter((i) => i.status.toUpperCase() === "PAID").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Billing Overview</h1>
        <p className="text-gray-400">View and manage all invoices across your projects</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-green-500/20">
              <FiDollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <FiClock className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            ${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-red-500/20">
              <FiFileText className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            ${totalOverdue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/20">
              <FiCheckCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">Invoices Paid</span>
          </div>
          <p className="text-2xl font-bold text-cyan-400">
            {paidCount} <span className="text-sm text-gray-500">of {invoices.length}</span>
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-800 flex items-center justify-center">
            <FiFileText className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 mb-2">No invoices yet</p>
          <p className="text-sm text-gray-500">Invoices for your projects will appear here</p>
        </div>
      ) : (
        <InvoicesTableClient invoices={invoices} />
      )}
    </div>
  );
}
