'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiDownload,
  FiFilter,
} from 'react-icons/fi';

// =============================================================================
// TYPES
// =============================================================================

type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  paginated?: boolean;
  pageSize?: number;
  exportable?: boolean;
  exportFilename?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchFields,
  paginated = true,
  pageSize = 10,
  exportable = false,
  exportFilename = 'export',
  emptyMessage = 'No data available',
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle sorting
  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortKey, sortDirection]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const fieldsToSearch = searchFields || columns.map(c => c.key as keyof T);
      
      result = result.filter((row) =>
        fieldsToSearch.some((field) => {
          const value = row[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Sort
    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
        if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, searchQuery, searchFields, columns, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (!paginated) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize, paginated]);

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = columns.map(c => c.header).join(',');
    const rows = processedData.map(row =>
      columns.map(col => {
        const value = row[col.key as keyof T];
        if (value == null) return '';
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value);
        if (strValue.includes(',') || strValue.includes('"')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processedData, columns, exportFilename]);

  // Render sort indicator
  const renderSortIndicator = (key: string, sortable?: boolean) => {
    if (!sortable) return null;
    
    return (
      <span className="ml-2 inline-flex flex-col">
        <FiChevronUp
          className={`w-3 h-3 -mb-1 transition-colors ${
            sortKey === key && sortDirection === 'asc'
              ? 'text-trinity-red'
              : 'text-gray-600'
          }`}
        />
        <FiChevronDown
          className={`w-3 h-3 transition-colors ${
            sortKey === key && sortDirection === 'desc'
              ? 'text-trinity-red'
              : 'text-gray-600'
          }`}
        />
      </span>
    );
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      {(searchable || exportable) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-b border-gray-800">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-trinity-red transition-colors"
              />
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {exportable && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full" style={{ minWidth: 'max-content' }}>
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                  className={`px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                    column.sortable ? 'cursor-pointer hover:text-white select-none' : ''
                  } ${column.headerClassName || ''}`}
                >
                  <span className="flex items-center">
                    {column.header}
                    {renderSortIndicator(String(column.key), column.sortable)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            <AnimatePresence mode="popLayout">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <motion.tr
                    key={String(row[keyField])}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onRowClick?.(row)}
                    className={`hover:bg-gray-800/50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${rowClassName?.(row) || ''}`}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white whitespace-nowrap ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(row[column.key as keyof T], row)
                          : String(row[column.key as keyof T] ?? '-')}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-800">
          <p className="text-sm text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, processedData.length)} of{' '}
            {processedData.length} results
          </p>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </motion.button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-trinity-red text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
