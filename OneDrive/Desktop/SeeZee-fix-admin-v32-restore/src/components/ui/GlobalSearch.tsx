"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiFolder, FiFileText, FiUsers, FiMessageSquare, FiLoader, FiCheckSquare, FiCalendar, FiMail, FiSettings, FiDollarSign, FiTrendingUp, FiClock } from "react-icons/fi";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "project" | "invoice" | "request" | "lead" | "client" | "task" | "message" | "page";
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface GlobalSearchProps {
  variant?: "client" | "admin";
  placeholder?: string;
  className?: string;
}

// Define searchable pages for each variant
const clientPages: SearchResult[] = [
  { id: "page-dashboard", title: "Dashboard", subtitle: "Overview of your projects", type: "page", href: "/client", icon: FiFolder },
  { id: "page-projects", title: "Projects", subtitle: "View all your projects", type: "page", href: "/client/projects", icon: FiFolder },
  { id: "page-invoices", title: "Invoices", subtitle: "View billing & payments", type: "page", href: "/client/invoices", icon: FiFileText },
  { id: "page-requests", title: "Requests", subtitle: "Submit change requests", type: "page", href: "/client/requests", icon: FiMessageSquare },
  { id: "page-support", title: "Support", subtitle: "Get help with your projects", type: "page", href: "/client/support", icon: FiMessageSquare },
  { id: "page-messages", title: "Messages", subtitle: "View conversations", type: "page", href: "/client/messages", icon: FiMail },
  { id: "page-meetings", title: "Meetings", subtitle: "Schedule & view meetings", type: "page", href: "/client/meetings", icon: FiCalendar },
  { id: "page-settings", title: "Settings", subtitle: "Account settings", type: "page", href: "/settings", icon: FiSettings },
  { id: "page-progress", title: "Progress", subtitle: "Track project progress", type: "page", href: "/client/progress", icon: FiCheckSquare },
];

const adminPages: SearchResult[] = [
  { id: "page-dashboard", title: "Dashboard", subtitle: "Admin overview", type: "page", href: "/admin", icon: FiFolder },
  { id: "page-pipeline", title: "Pipeline", subtitle: "Lead management", type: "page", href: "/admin/pipeline", icon: FiTrendingUp },
  { id: "page-projects", title: "Projects", subtitle: "Manage projects", type: "page", href: "/admin/projects", icon: FiFolder },
  { id: "page-clients", title: "Clients", subtitle: "Client management", type: "page", href: "/admin/clients", icon: FiUsers },
  { id: "page-tasks", title: "Tasks", subtitle: "Task management", type: "page", href: "/admin/tasks", icon: FiCheckSquare },
  { id: "page-invoices", title: "Invoices", subtitle: "Billing & payments", type: "page", href: "/admin/invoices", icon: FiFileText },
  { id: "page-finances", title: "Finances", subtitle: "Financial overview", type: "page", href: "/admin/finances", icon: FiDollarSign },
  { id: "page-team", title: "Team", subtitle: "Team management", type: "page", href: "/admin/team", icon: FiUsers },
  { id: "page-leads", title: "Leads & Finder", subtitle: "View leads and find new prospects", type: "page", href: "/admin/leads", icon: FiUsers },
  { id: "page-marketing", title: "Email Marketing", subtitle: "Campaigns & templates", type: "page", href: "/admin/marketing", icon: FiMail },
  { id: "page-calendar", title: "Calendar", subtitle: "Schedule & meetings", type: "page", href: "/admin/calendar", icon: FiCalendar },
  { id: "page-analytics", title: "Analytics", subtitle: "Business analytics", type: "page", href: "/admin/analytics", icon: FiTrendingUp },
  { id: "page-maintenance", title: "Maintenance", subtitle: "Maintenance plans", type: "page", href: "/admin/maintenance", icon: FiClock },
  { id: "page-settings", title: "Settings", subtitle: "System settings", type: "page", href: "/settings", icon: FiSettings },
];

const getIconForType = (type: SearchResult["type"]) => {
  switch (type) {
    case "project":
      return FiFolder;
    case "invoice":
      return FiFileText;
    case "request":
      return FiMessageSquare;
    case "lead":
    case "client":
      return FiUsers;
    case "task":
      return FiCheckSquare;
    case "message":
      return FiMail;
    case "page":
    default:
      return FiFolder;
  }
};

export function GlobalSearch({ variant = "client", placeholder = "Search...", className = "" }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get static pages based on variant
  const staticPages = variant === "admin" ? adminPages : clientPages;

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const lowerQuery = searchQuery.toLowerCase();

    // First, filter static pages
    const pageResults = staticPages.filter(
      (page) =>
        page.title.toLowerCase().includes(lowerQuery) ||
        (page.subtitle && page.subtitle.toLowerCase().includes(lowerQuery))
    );

    // Then fetch dynamic results from API
    try {
      const endpoint = variant === "admin" ? "/api/admin/search" : "/api/client/search";
      const res = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          // Combine page results with API results
          setResults([...pageResults, ...data.results]);
        } else {
          setResults(pageResults);
        }
      } else {
        setResults(pageResults);
      }
    } catch (error) {
      // If API fails, just use page results
      setResults(pageResults);
    } finally {
      setIsLoading(false);
    }
  }, [variant, staticPages]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            router.push(results[selectedIndex].href);
            setIsOpen(false);
            setQuery("");
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, results, selectedIndex, router]
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setIsOpen(false);
    setQuery("");
  };

  const accentColor = variant === "admin" ? "trinity-red" : "trinity-red";
  const bgColor = variant === "admin" ? "bg-white/5" : "bg-gray-800/50";
  const borderColor = variant === "admin" ? "border-white/10" : "border-gray-700";
  const hoverBg = variant === "admin" ? "hover:bg-white/10" : "hover:bg-gray-700";

  return (
    <div ref={containerRef} className={`relative w-full max-w-md z-[100] ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isLoading ? (
            <FiLoader className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <FiSearch className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 ${bgColor} backdrop-blur-sm border ${borderColor} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-${accentColor}/50 focus:border-${accentColor} transition-all duration-200`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-2 ${bgColor} border ${borderColor} rounded-xl shadow-xl backdrop-blur-xl z-[100] overflow-hidden max-h-80 overflow-y-auto`}
          >
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = result.icon || getIconForType(result.type);
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                      isSelected ? (variant === "admin" ? "bg-white/10" : "bg-gray-700") : ""
                    } ${hoverBg}`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? `bg-${accentColor}/20 text-${accentColor}` : "bg-white/5 text-gray-400"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{result.type}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {isOpen && query && results.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-2 ${bgColor} border ${borderColor} rounded-xl shadow-xl backdrop-blur-xl z-[100] p-4 text-center`}
          >
            <p className="text-gray-400 text-sm">No results found for "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GlobalSearch;
