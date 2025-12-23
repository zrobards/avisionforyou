'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface RecordingFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  status: string;
  projectId: string;
  dateFrom: string;
  dateTo: string;
}

export function RecordingFilters({ onFilterChange }: RecordingFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    projectId: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: 'ALL',
      projectId: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.status !== 'ALL' || filters.projectId || filters.dateFrom || filters.dateTo;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg border font-medium flex items-center gap-2 transition-colors ${
          hasActiveFilters
            ? 'bg-pink-500/20 border-pink-500/50 text-pink-400'
            : 'bg-slate-900/50 border-white/10 text-white hover:bg-slate-800/50'
        }`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {[filters.status !== 'ALL', filters.projectId, filters.dateFrom, filters.dateTo].filter(Boolean).length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-50 p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Filter Recordings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="TRANSCRIBED">Transcribed</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white"
                placeholder="To"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
