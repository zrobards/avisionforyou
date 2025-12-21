"use client";

import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { FiDollarSign, FiFolder, FiMail, FiUsers, FiTrendingUp, FiFileText, FiPlus } from "react-icons/fi";
import { EnhancedStatCard } from "@/components/admin/shared/EnhancedStatCard";
import { ActionMenu, createDefaultActions } from "@/components/admin/shared/ActionMenu";
import { ClientModal } from "@/components/admin/ClientModal";
import { SearchFilter } from "@/components/admin/shared/SearchFilter";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClientRow {
  id: string;
  name: string;
  email: string;
  company: string;
  projects: number;
  invoices: number;
  revenue: number;
  statuses: string[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface ClientsPageClientProps {
  user: any;
  initialData: {
    rows: ClientRow[];
    totalRevenue: number;
    activeClients: number;
  };
}

export function ClientsPageClient({ user, initialData }: ClientsPageClientProps) {
  const router = useRouter();
  const [rows, setRows] = useState(initialData.rows);
  const [filteredRows, setFilteredRows] = useState(initialData.rows);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredRows(
        rows.filter(
          (client) =>
            client.name.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query) ||
            client.company.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredRows(rows);
    }
  }, [searchQuery, rows]);

  const handleCreateClient = () => {
    setSelectedClient(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditClient = (client: ClientRow) => {
    setSelectedClient(client);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleViewClient = (client: ClientRow) => {
    router.push(`/admin/clients/${client.id}`);
  };

  const columns: DataTableColumn<ClientRow>[] = [
    {
      header: "Client",
      key: "name",
      render: (client) => (
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold text-white">{client.name}</p>
          <p className="text-xs text-gray-400">{client.company}</p>
        </div>
      ),
    },
    {
      header: "Contact",
      key: "email",
      render: (client) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiMail className="h-3.5 w-3.5 text-gray-500" />
          <span className="truncate">{client.email}</span>
        </div>
      ),
    },
    {
      header: "Projects",
      key: "projects",
      render: (client) => (
        <div className="flex items-center gap-2 text-sm text-gray-200">
          <FiFolder className="h-4 w-4 text-gray-500" />
          {client.projects}
        </div>
      ),
    },
    {
      header: "Invoices",
      key: "invoices",
      render: (client) => (
        <div className="flex items-center gap-2 text-sm text-gray-200">
          <FiDollarSign className="h-4 w-4 text-gray-500" />
          {client.invoices}
        </div>
      ),
    },
    {
      header: "Revenue",
      key: "revenue",
      render: (client) => (
        <span className="text-sm font-semibold text-white">
          {currencyFormatter.format(client.revenue)}
        </span>
      ),
    },
    {
      header: "Status",
      key: "statuses",
      render: (client) => (
        <div className="flex flex-wrap gap-1">
          {client.statuses.length > 0 ? (
            client.statuses.slice(0, 3).map((status, index) => (
              <StatusBadge key={`${client.id}-${status}-${index}`} status={status} size="sm" />
            ))
          ) : (
            <span className="text-xs text-gray-500">—</span>
          )}
        </div>
      ),
    },
    {
      header: "",
      key: "actions",
      render: (client) => (
        <ActionMenu
          actions={createDefaultActions(
            () => handleEditClient(client),
            () => {},
            () => handleViewClient(client)
          )}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
              Client Intelligence
            </span>
            <h1 className="text-4xl font-heading font-bold gradient-text">Clients</h1>
          </div>
          <button
            onClick={handleCreateClient}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-trinity-red/40 bg-trinity-red/10 px-5 py-2.5 text-sm font-medium text-trinity-red transition-all hover:bg-trinity-red hover:text-white hover:shadow-large hover:border-trinity-red"
          >
            <FiPlus className="h-4 w-4" />
            New Client
          </button>
        </div>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Unified view of every client engagement, including project load, billing cadence, and payment velocity.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatCard
          label="Total Clients"
          value={rows.length}
          icon={FiUsers}
          iconColor="text-trinity-red"
          iconBgColor="bg-trinity-red/20"
          subtitle="Organizations"
        />
        <EnhancedStatCard
          label="Active Clients"
          value={initialData.activeClients}
          icon={FiTrendingUp}
          iconColor="text-green-400"
          iconBgColor="bg-green-500/20"
          subtitle="With active projects"
        />
        <EnhancedStatCard
          label="Total Revenue"
          value={currencyFormatter.format(initialData.totalRevenue)}
          icon={FiDollarSign}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/20"
          subtitle="Paid invoices"
        />
        <EnhancedStatCard
          label="Avg Revenue"
          value={currencyFormatter.format(rows.length > 0 ? initialData.totalRevenue / rows.length : 0)}
          icon={FiFileText}
          iconColor="text-purple-400"
          iconBgColor="bg-purple-500/20"
          subtitle="Per client"
        />
      </section>

      <SearchFilter
        searchPlaceholder="Search clients..."
        onSearchChange={setSearchQuery}
      />

      <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300">
        <DataTable columns={columns} data={filteredRows} emptyMessage="No clients found" />
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        mode={modalMode}
      />
    </div>
  );
}
















