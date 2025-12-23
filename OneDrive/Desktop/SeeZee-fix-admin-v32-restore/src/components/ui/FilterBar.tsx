"use client";

import { useState } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  showDateRange?: boolean;
  onDateRangeChange?: (start: Date | null, end: Date | null) => void;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
  showDateRange = false,
  onDateRangeChange,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange(value);
  };

  const clearSearch = () => {
    setSearchValue("");
    onSearchChange("");
  };

  const hasActiveFilters = filters.some((f) => f.value !== "all" && f.value !== "");

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-white/10 rounded-xl text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-seezee-red/50 transition-all"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
              hasActiveFilters
                ? "bg-seezee-red/20 border-seezee-red/50 text-seezee-red"
                : "bg-seezee-card-bg border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-seezee-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filters.filter((f) => f.value !== "all" && f.value !== "").length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && filters.length > 0 && (
        <div className="p-4 bg-seezee-card-bg border border-white/10 rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="w-full px-3 py-2 bg-seezee-navy-medium border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-seezee-red/50"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-seezee-navy-deep">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {showDateRange && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </div>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    onChange={(e) =>
                      onDateRangeChange?.(e.target.value ? new Date(e.target.value) : null, null)
                    }
                    className="flex-1 px-3 py-2 bg-seezee-navy-medium border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-seezee-red/50"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    onChange={(e) =>
                      onDateRangeChange?.(null, e.target.value ? new Date(e.target.value) : null)
                    }
                    className="flex-1 px-3 py-2 bg-seezee-navy-medium border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-seezee-red/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => filters.forEach((f) => f.onChange("all"))}
              className="text-sm text-seezee-red hover:text-seezee-red/80 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
