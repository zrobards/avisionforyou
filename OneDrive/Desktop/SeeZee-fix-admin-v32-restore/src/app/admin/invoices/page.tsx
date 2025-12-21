"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getInvoices } from "@/server/actions";
import { InvoicesTable } from "@/components/admin/InvoicesTable";
import { EnhancedStatCard } from "@/components/admin/shared/EnhancedStatCard";
import { FiDollarSign, FiFileText, FiCheckCircle, FiAlertCircle, FiPlus } from "react-icons/fi";
import Link from "next/link";

interface InvoiceRow {
  id: string;
  number: string;
  client: string;
  status: string;
  total: number;
  dueDate: string | null;
  project: string;
  title?: string | null;
  description?: string | null;
  amount?: number;
  tax?: number;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function AdminInvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      const invoicesResult = await getInvoices();
      setInvoices(invoicesResult.success ? invoicesResult.invoices : []);
      setLoading(false);
    }
    loadInvoices();
  }, []);

  const rows: InvoiceRow[] = invoices.map((invoice: any) => ({
    id: invoice.id,
    number: invoice.number ?? `INV-${invoice.id.slice(0, 6)}`,
    client: invoice.organization?.name ?? invoice.project?.clientName ?? "Unassigned",
    status: String(invoice.status ?? "").toLowerCase(),
    total: Number(invoice.total ?? 0),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : null,
    project: invoice.project?.name ?? "—",
    title: invoice.title,
    description: invoice.description,
    amount: Number(invoice.amount ?? 0),
    tax: Number(invoice.tax ?? 0),
  }));

  const paidTotal = rows
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const outstanding = rows
    .filter((invoice) => ["sent", "overdue", "draft"].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const overdue = rows.filter((invoice) => invoice.status === "overdue").length;
  const paidCount = rows.filter((invoice) => invoice.status === "paid").length;

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-3 relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
            Revenue Operations
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">Invoices</h1>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading invoices...</div>
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
                Revenue Operations
              </span>
              <h1 className="text-4xl font-heading font-bold gradient-text">Invoices</h1>
            </div>
            <Link
              href="/admin/pipeline/invoices"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-trinity-red/40 bg-trinity-red/10 px-5 py-2.5 text-sm font-medium text-trinity-red transition-all hover:bg-trinity-red hover:text-white hover:shadow-large hover:border-trinity-red"
            >
              <FiPlus className="h-4 w-4" />
              New Invoice
            </Link>
          </div>
          <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
            Keep financial health transparent with a live ledger of every engagement. Track payment stages, spot overdue balances, and surface quick wins.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            label="Outstanding"
            value={currencyFormatter.format(outstanding)}
            icon={FiDollarSign}
            iconColor="text-yellow-400"
            iconBgColor="bg-yellow-500/20"
            subtitle="Unpaid invoices"
          />
          <EnhancedStatCard
            label="Paid"
            value={currencyFormatter.format(paidTotal)}
            icon={FiCheckCircle}
            iconColor="text-green-400"
            iconBgColor="bg-green-500/20"
            subtitle={`${paidCount} invoices`}
          />
          <EnhancedStatCard
            label="Total Invoices"
            value={rows.length}
            icon={FiFileText}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
            subtitle="All time"
          />
          <EnhancedStatCard
            label="Overdue"
            value={overdue}
            icon={FiAlertCircle}
            iconColor="text-red-400"
            iconBgColor="bg-red-500/20"
            subtitle="Needs attention"
          />
        </section>

        <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300">
          <InvoicesTable rows={rows} />
        </div>
      </div>
  );
}

