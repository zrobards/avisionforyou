"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiHome,
  FiTrendingUp,
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiFileText,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiBook,
  FiLink,
  FiLayers,
  FiLogOut,
  FiActivity,
  FiDollarSign,
  FiCalendar,
  FiStar,
  FiTool,
  FiDatabase,
  FiBarChart2,
  FiCreditCard,
  FiServer,
  FiUsers as FiTeamUsers,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { signOut } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import LogoHeader from "@/components/brand/LogoHeader";
import { CollapsibleNavGroup } from "@/components/admin/CollapsibleNavGroup";
import { isCEO } from "@/lib/role";
import type { CurrentUser } from "@/lib/auth/requireRole";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface AdminAppShellProps {
  user: CurrentUser;
  children: React.ReactNode;
}

export function AdminAppShell({ user, children }: AdminAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isUserCEO = isCEO(user.role);

  // Top-level items (always visible)
  const topLevelItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin", label: "Dashboard", icon: FiHome },
      { href: "/admin/feed", label: "Activity Feed", icon: FiActivity },
    ],
    []
  );

  // Operations group
  const operationsItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/pipeline", label: "Pipeline", icon: FiTrendingUp },
      { href: "/admin/projects", label: "Projects", icon: FiFolder },
      { href: "/admin/clients", label: "Clients", icon: FiUsers },
      { href: "/admin/tasks", label: "Tasks", icon: FiCheckSquare },
      { href: "/admin/client-tasks", label: "Client Tasks", icon: FiCheckSquare },
      { href: "/admin/calendar", label: "Calendar", icon: FiCalendar },
    ],
    []
  );

  // Financial group
  const financialItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/invoices", label: "Invoices", icon: FiFileText },
      { href: "/admin/finances", label: "Finances", icon: FiDollarSign },
    ],
    []
  );

  // Team & Learning group
  const teamLearningItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/team", label: "Team", icon: FiTeamUsers },
      { href: "/admin/learning", label: "Learning Hub", icon: FiBookOpen },
    ],
    []
  );

  // Tasks & Todos group (consolidated into Operations)
  // This group is now empty and can be removed

  // CEO Command Center group (CEO only)
  const ceoItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/ceo", label: "CEO Dashboard", icon: FiStar },
      { href: "/admin/ceo/analytics", label: "Analytics", icon: FiBarChart2 },
      { href: "/admin/ceo/finances", label: "Finances", icon: FiCreditCard },
      { href: "/admin/ceo/systems", label: "Systems", icon: FiServer },
      { href: "/admin/ceo/systems/logs", label: "System Logs", icon: FiActivity },
      { href: "/admin/ceo/systems/automations", label: "Automations", icon: FiTool },
      { href: "/admin/ceo/tasks", label: "CEO Tasks", icon: FiCheckSquare },
    ],
    []
  );

  // Tools & Settings group
  const toolsItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/links", label: "Links & Resources", icon: FiLink },
      { href: "/admin/database", label: "Database", icon: FiDatabase },
      { href: "/admin/maintenance", label: "Maintenance", icon: FiTool },
      { href: "/admin/test/create-project", label: "Test Tools", icon: FiTool },
    ],
    []
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === "/admin") {
        return pathname === "/admin";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const handleNavigate = useCallback(
    (href: string) => {
      setIsSidebarOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 transform border-r border-gray-800 bg-gray-950/95 backdrop-blur transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isCollapsed ? "w-20 lg:w-20" : "w-64 lg:w-64"
          } ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className={`border-b border-gray-800 px-6 py-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && <LogoHeader href="/admin" />}
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-[color,background-color] duration-150 ease-in-out"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <FiChevronRight className="w-5 h-5" />
                ) : (
                  <FiChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {/* Top-level items */}
              {topLevelItems.map(({ href, label, icon: Icon }) => (
                <motion.button
                  key={href}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavigate(href)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive(href)
                      ? "bg-trinity-red/20 text-white shadow-lg"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{label}</span>}
                  {isActive(href) && !isCollapsed && (
                    <motion.span
                      layoutId={`admin-nav-active-${href}`}
                      className="absolute inset-0 rounded-lg border border-trinity-red/30"
                      transition={{ type: "spring", stiffness: 250, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}

              {/* Operations Group */}
              <CollapsibleNavGroup
                title="Operations"
                icon={FiTrendingUp}
                items={operationsItems}
                isActive={isActive}
                onNavigate={handleNavigate}
                defaultOpen={pathname.startsWith("/admin/pipeline") || pathname.startsWith("/admin/projects") || pathname.startsWith("/admin/clients") || pathname.startsWith("/admin/tasks") || pathname.startsWith("/admin/calendar")}
                collapsed={isCollapsed}
              />

              {/* Financial Group */}
              <CollapsibleNavGroup
                title="Financial"
                icon={FiDollarSign}
                items={financialItems}
                isActive={isActive}
                onNavigate={handleNavigate}
                defaultOpen={pathname.startsWith("/admin/invoices") || pathname.startsWith("/admin/finances")}
                collapsed={isCollapsed}
              />

              {/* Team & Learning Group */}
              <CollapsibleNavGroup
                title="Team & Learning"
                icon={FiTeamUsers}
                items={teamLearningItems}
                isActive={isActive}
                onNavigate={handleNavigate}
                defaultOpen={pathname.startsWith("/admin/team") || pathname.startsWith("/admin/learning")}
                collapsed={isCollapsed}
              />

              {/* CEO Command Center (CEO only) */}
              {isUserCEO && (
                <CollapsibleNavGroup
                  title="CEO Command Center"
                  icon={FiStar}
                  items={ceoItems}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                  defaultOpen={pathname.startsWith("/admin/ceo")}
                  badge="CEO"
                  collapsed={isCollapsed}
                />
              )}

              {/* Tools & Settings Group */}
              <CollapsibleNavGroup
                title="Tools & Settings"
                icon={FiTool}
                items={toolsItems}
                isActive={isActive}
                onNavigate={handleNavigate}
                defaultOpen={pathname.startsWith("/admin/links") || pathname.startsWith("/admin/database")}
                collapsed={isCollapsed}
              />
            </nav>
            <div className="border-t border-gray-800 px-4 py-4">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                    <Avatar
                      src={user.image ?? undefined}
                      alt={user.name ?? "Admin"}
                      size={40}
                      fallbackText={user.name ?? undefined}
                      className="h-10 w-10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user.name ?? "Admin"}</p>
                      <p className="truncate text-xs text-gray-400">{user.email ?? ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handleNavigate("/")}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                      Back to Site
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                      <FiLogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div title={`${user.name ?? "Admin"} - ${user.email ?? ""}`}>
                    <Avatar
                      src={user.image ?? undefined}
                      alt={user.name ?? "Admin"}
                      size={40}
                      fallbackText={user.name ?? undefined}
                      className="h-10 w-10 flex-shrink-0"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => handleNavigate("/")}
                      className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                      title="Back to Site"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                      title="Logout"
                    >
                      <FiLogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="border-b border-gray-800 bg-gray-950/80 px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white lg:hidden"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-black via-slate-950 to-black px-4 py-6 lg:px-10 lg:py-10">
            <div className="mx-auto w-full max-w-[1200px] space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminAppShell;

