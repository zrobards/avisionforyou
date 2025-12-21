"use client";

/**
 * CEO Sidebar with Royal Purple/Blue Accent
 * Master control center navigation
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Users,
  BarChart3,
  DollarSign,
  GraduationCap,
  Wrench,
  BookOpen,
  Trello,
  Database,
  Settings,
  FileText,
  Zap,
  ChevronDown,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  label?: string;
  items: NavItem[];
  collapsible?: boolean;
}

interface CEOSidebarProps {
  userRole: string;
}

export function CEOSidebar({ userRole }: CEOSidebarProps) {
  const pathname = usePathname();
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    team: true,
    analytics: true,
    systems: true,
  });

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment) =>
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
  const pageTitle = breadcrumbs.slice(-1)[0] || "CEO Dashboard";

  const sections: NavSection[] = [
    {
      items: [
        {
          label: "Dashboard",
          href: "/admin/ceo",
          icon: <Crown className="w-5 h-5" />,
        },
      ],
    },
    {
      label: "Team & Organization",
      items: [
        {
          label: "Team Management",
          href: "/admin/ceo/team",
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: "Training",
          href: "/admin/ceo/training",
          icon: <GraduationCap className="w-4 h-4" />,
        },
        {
          label: "Resources",
          href: "/admin/ceo/resources",
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          label: "Tools",
          href: "/admin/ceo/tools",
          icon: <Wrench className="w-4 h-4" />,
        },
      ],
      collapsible: true,
    },
    {
      label: "Analytics & Insights",
      items: [
        {
          label: "Analytics",
          href: "/admin/ceo/analytics",
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          label: "Finances",
          href: "/admin/ceo/finances",
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          label: "Kanban",
          href: "/admin/ceo/kanban",
          icon: <Trello className="w-4 h-4" />,
        },
      ],
      collapsible: true,
    },
    {
      label: "Systems & Control",
      items: [
        {
          label: "Database",
          href: "/admin/ceo/database",
          icon: <Database className="w-4 h-4" />,
        },
        {
          label: "Systems",
          href: "/admin/ceo/systems",
          icon: <Settings className="w-4 h-4" />,
        },
        {
          label: "Logs",
          href: "/admin/ceo/systems/logs",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: "Automations",
          href: "/admin/ceo/systems/automations",
          icon: <Zap className="w-4 h-4" />,
        },
      ],
      collapsible: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin/ceo") return pathname === href;
    return pathname.startsWith(href);
  };

  const toggleSection = (label: string) => {
    setSectionsOpen((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      className="
        w-full h-full border-r border-white/5
        bg-slate-950/80 backdrop-blur-xl
        ring-1 ring-purple-500/20
        flex flex-col
      "
    >
      {/* Page Title Breadcrumb */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-purple-500/20 bg-slate-950/90">
        <div className="flex items-center gap-1.5 text-xs text-purple-400/70 mb-1">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span>/</span>}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-400" />
          {pageTitle}
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
        {sections.map((section, idx) => {
          const sectionKey = section.label?.toLowerCase().replace(/\s+/g, "-") || idx.toString();
          const sectionOpen = sectionsOpen[sectionKey] ?? true;

          return (
            <div key={idx}>
              {section.label && (
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="
                    w-full flex items-center justify-between
                    px-3 py-2 mb-2
                    text-xs font-semibold text-purple-400 uppercase tracking-wider
                    hover:text-purple-300 cursor-pointer
                  "
                >
                  <span>{section.label}</span>
                  {section.collapsible && (
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        sectionOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              )}

              <AnimatePresence>
                {sectionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            relative flex items-center gap-3 px-3 py-2 rounded-lg
                            text-sm font-medium
                            transition-[color,background-color] duration-150 ease-in-out
                            ${
                              active
                                ? "bg-purple-500/20 text-white shadow-lg shadow-purple-500/10"
                                : "text-slate-400 hover:text-white hover:bg-purple-500/10"
                            }
                          `}
                        >
                          {active && (
                            <motion.div
                              layoutId="ceo-sidebar-active"
                              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg"
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <span className="relative z-10">{item.icon}</span>
                          <span className="relative z-10 flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="relative z-10 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
