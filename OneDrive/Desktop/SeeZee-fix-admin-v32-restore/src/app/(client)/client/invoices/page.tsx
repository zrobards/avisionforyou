import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import { buildClientProjectWhere } from "@/lib/client-access";
import { InvoiceTable } from "@/app/(client)/client/components/InvoiceTable";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const session = await requireAuth();

  const identity = { userId: session.user.id, email: session.user.email };
  const accessWhere = await buildClientProjectWhere(identity);

  // Get invoices from accessible projects
  const projects = await db.project.findMany({
    where: accessWhere,
    select: { id: true },
  });

  const projectIds = projects.map((p) => p.id);

  const invoices = projectIds.length > 0
    ? await db.invoice.findMany({
        where: {
          projectId: { in: projectIds },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing Overview</h1>
        <p className="text-white/60">View all invoices across your projects</p>
      </div>
      {invoices.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No invoices yet</p>
          <p className="text-sm text-gray-500">Invoices for your projects will appear here</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Invoice #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {invoices.map((invoice) => {
                const getStatusColor = (status: string) => {
                  switch (status.toUpperCase()) {
                    case "PAID":
                      return "bg-green-500/20 text-green-300 border-green-500/30";
                    case "SENT":
                      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
                    case "OVERDUE":
                      return "bg-red-500/20 text-red-300 border-red-500/30";
                    default:
                      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
                  }
                };
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-mono">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {invoice.project ? (
                        <a
                          href={`/client/projects/${invoice.project.id}?tab=invoices`}
                          className="text-trinity-red hover:text-trinity-maroon transition-colors"
                        >
                          {invoice.project.name}
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-semibold">
                      ${Number(invoice.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.project && (
                        <a
                          href={`/client/projects/${invoice.project.id}?tab=invoices`}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                        >
                          View in Project
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
