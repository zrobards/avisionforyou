'use client';

import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { FiExternalLink } from 'react-icons/fi';

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount: number;
  tax: number;
  total: number;
  createdAt: string;
  dueDate: string;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface InvoicesTableClientProps {
  invoices: Invoice[];
}

export default function InvoicesTableClient({ invoices }: InvoicesTableClientProps) {
  const router = useRouter();

  const getStatusVariant = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'paid';
      case 'SENT':
        return 'pending';
      case 'OVERDUE':
        return 'overdue';
      case 'DRAFT':
        return 'draft';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      key: 'number',
      header: 'Invoice #',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-cyan-400">{value}</span>
      ),
    },
    {
      key: 'project.name',
      header: 'Project',
      sortable: true,
      render: (_: any, row: Invoice) => (
        row.project ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/client/projects/${row.project!.id}?tab=invoices`);
            }}
            className="text-trinity-red hover:text-trinity-maroon transition-colors font-medium"
          >
            {row.project.name}
          </button>
        ) : (
          <span className="text-gray-500">-</span>
        )
      ),
    },
    {
      key: 'total',
      header: 'Amount',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-white">
          ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={getStatusVariant(value)} size="sm" />
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-400">
          {new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (_: any, row: Invoice) => (
        <div className="flex items-center justify-end gap-2">
          {row.project && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/client/projects/${row.project!.id}?tab=invoices`);
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="View in Project"
            >
              <FiExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={invoices}
      columns={columns}
      keyField="id"
      searchable={true}
      searchPlaceholder="Search invoices..."
      searchFields={['number', 'status']}
      paginated={true}
      pageSize={10}
      exportable={true}
      exportFilename="invoices"
      emptyMessage="No invoices found"
      onRowClick={(row) => {
        if (row.project) {
          router.push(`/client/projects/${row.project.id}?tab=invoices`);
        }
      }}
    />
  );
}
