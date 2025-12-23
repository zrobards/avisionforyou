"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  header: ReactNode;
  key: keyof T | string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[] | null | undefined;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, emptyMessage = "No data available" }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-12 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/70 -mx-4 sm:-mx-6 px-4 sm:px-6" style={{ position: 'relative', WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full" style={{ minWidth: 'max-content' }}>
        <thead>
          <tr className="border-b border-gray-800/80">
            {columns.map((column, index) => (
              <th
                key={index}
                className={clsx(
                  "px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {data.map((row, rowIndex) => {
            // Use row id if available, otherwise use index
            const rowKey = (row as any)?.id ?? rowIndex;
            return (
              <tr key={rowKey} className="hover:bg-gray-800/40 transition-colors">
                {columns.map((column, colIndex) => {
                  const cellKey = `${rowKey}-${colIndex}-${String(column.key)}`;
                  return (
                    <td key={cellKey} className={clsx("px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-200 whitespace-nowrap", column.className)}>
                      {column.render
                        ? column.render(row)
                        : (() => {
                            const key = column.key;
                            if (typeof key === "string" && key in (row as Record<string, unknown>)) {
                              return (row as Record<string, unknown>)[key] as ReactNode;
                            }
                            return null;
                          })()}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;







