"use client";

/**
 * Data Table with filters and actions - Navy Theme
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronDown } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string | React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  searchable = true,
  searchPlaceholder = "Search...",
  filters,
  actions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Simple search filter
  const filteredData = searchQuery
    ? data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  // Sort
  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aVal = String((a as any)[sortKey]);
        const bVal = String((b as any)[sortKey]);
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filteredData;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      {(searchable || filters || actions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {searchable && (
            <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 rounded-xl
                  bg-[#0f172a]/60 border border-white/10
                  text-sm text-white placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]/50
                  transition-all duration-200
                "
              />
            </div>
          )}

          {filters && (
            <button
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-[#0f172a]/60 border border-white/10
                text-sm text-slate-300
                hover:bg-white/5 hover:border-white/20
                transition-all duration-200
              "
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          )}

          {actions && <div className="ml-auto">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1e293b]/40 backdrop-blur-xl max-w-full -mx-4 sm:-mx-6 px-4 sm:px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full" style={{ minWidth: 'max-content' }}>
          <thead className="bg-[#0f172a]/60 border-b border-white/5">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`
                    px-2 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap
                    ${col.sortable ? "cursor-pointer hover:text-white select-none transition-colors" : ""}
                  `}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedData.map((item, idx) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.2 }}
                onClick={() => onRowClick?.(item)}
                className={`
                  bg-transparent hover:bg-white/5
                  transition-all duration-200
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-2 sm:px-4 lg:px-5 py-3 sm:py-4 text-xs sm:text-sm text-slate-300 whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as any)[col.key] || "-")}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-[#0f172a]/40">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm">No data to display</p>
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div className="text-sm text-slate-400 px-1">
        Showing <span className="text-white font-medium">{sortedData.length}</span> of{" "}
        <span className="text-white font-medium">{data.length}</span> items
      </div>
    </div>
  );
}
