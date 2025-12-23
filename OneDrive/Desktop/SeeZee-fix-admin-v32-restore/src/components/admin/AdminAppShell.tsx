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
  FiMail,
  FiMapPin,
  FiMic,
  FiPieChart,
  FiSettings,
  FiTarget,
  FiSend,
  FiGlobe,
  FiMessageSquare,
  FiClock,
} from "react-icons/fi";
import { signOut } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import LogoHeader from "@/components/brand/LogoHeader";
import { CollapsibleNavGroup } from "@/components/admin/CollapsibleNavGroup";
import { isCEO } from "@/lib/role";
import type { CurrentUser } from "@/lib/auth/requireRole";
import GlobalSearch from "@/components/ui/GlobalSearch";
import { AdminNotificationBanner } from "@/components/admin/AdminNotificationBanner";

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
      { href: "/admin/analytics", label: "Analytics", icon: FiPieChart },
    ],
    []
  );

  // Operations group - Core project management
  const operationsItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/pipeline", label: "Pipeline", icon: FiTrendingUp },
      { href: "/admin/projects", label: "Projects", icon: FiFolder },
      { href: "/admin/clients", label: "Clients", icon: FiUsers },
      { href: "/admin/tasks", label: "Tasks", icon: FiCheckSquare },
      { href: "/admin/client-tasks", label: "Client Tasks", icon: FiTarget },
      { href: "/admin/calendar", label: "Calendar", icon: FiCalendar },
    ],
    []
  );

  // Marketing & Outreach group - Lead generation and email
  const marketingItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/leads", label: "Leads & Finder", icon: FiUsers },
      { href: "/admin/marketing", label: "Email Hub", icon: FiMail },
      { href: "/admin/marketing/campaigns", label: "Campaigns", icon: FiSend },
      { href: "/admin/marketing/templates", label: "Templates", icon: FiFileText },
    ],
    []
  );

  // Financial group
  const financialItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/finance", label: "Finance Overview", icon: FiDollarSign, description: "Revenue, metrics, and financial dashboard" },
      { href: "/admin/invoices", label: "Invoices", icon: FiFileText, description: "Manage and track invoices" },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: FiCreditCard, description: "Manage client subscriptions" },
      { href: "/admin/purchases", label: "Purchases", icon: FiCreditCard, description: "Hour packs and subscription payments" },
      { href: "/admin/maintenance", label: "Maintenance", icon: FiServer, description: "Maintenance schedules and change requests" },
    ],
    []
  );

  // Team & Collaboration group
  const teamItems = useMemo<NavItem[]>(
    () => [
      { href: "/admin/team", label: "Team Members", icon: FiTeamUsers },
      { href: "/admin/recordings", label: "Recordings", icon: FiMic },
      { href: "/admin/chat", label: "Team Chat", icon: FiMessageSquare },
      { href: "/admin/learning", label: "Learning Hub", icon: FiBookOpen },
    ],
    []
  );

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
      { href: "/settings", label: "Settings", icon: FiSettings },
      { href: "/admin/links", label: "Links & Resources", icon: FiLink },
      { href: "/admin/database", label: "Database", icon: FiDatabase },
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
    <div className="min-h-screen bg-[#0a1128] text-white">
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 transform border-r border-white/10 bg-[#0f172a]/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isCollapsed ? "w-20 lg:w-20" : "w-64 lg:w-64"
          } ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className={`border-b border-white/10 px-6 py-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && <LogoHeader href="/admin" />}
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
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
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive(href)
                      ? "bg-gradient-to-r from-[#ef4444]/20 to-[#ef4444]/10 text-white shadow-lg border border-[#ef4444]/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{label}</span>}
                  {isActive(href) && !isCollapsed && (
                    <motion.span
                      layoutId={`admin-nav-active-${href}`}
                      className="absolute inset-0 rounded-xl border border-[#ef4444]/40"
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

              {/* Marketing & Outreach Group */}
              <CollapsibleNavGroup
                title="Marketing & Outreach"
                icon={FiMail}
                items={marketingItems}
                isActive={isActive}
                onNavigate={handleNavigate}
                defaultOpen={pathname.startsWith("/admin/marketing") || pathname.startsWith("/admin/leads")}
                collapsed={isCollapsed}
              />

              {/* Financial Group */}
              <CollapsibleNavGroup
                title="Financial"
                icon={FiDollarSign}
                items={financialItems}
                isActive={isActive}
                onNavigate={handleNavigate}
                defaultOpen={pathname.startsWith("/admin/invoices") || pathname.startsWith("/admin/finances") || pathname.startsWith("/admin/purchases") || pathname.startsWith("/admin/maintenance")}
                collapsed={isCollapsed}
              />

              {/* Team & Collaboration Group */}
              <CollapsibleNavGroup
                title="Team & Collaboration"
                icon={FiTeamUsers}
                items={teamItems}
                isActive={isActive}
                onNavigate={handleNavigate}
                defaultOpen={pathname.startsWith("/admin/team") || pathname.startsWith("/admin/recordings") || pathname.startsWith("/admin/chat") || pathname.startsWith("/admin/learning")}
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
                icon={FiSettings}
                items={toolsItems}
                isActive={isActive}
                onNavigate={handleNavigate}
                defaultOpen={pathname.startsWith("/admin/links") || pathname.startsWith("/admin/database") || pathname.startsWith("/settings")}
                collapsed={isCollapsed}
              />
            </nav>
            <div className="border-t border-white/10 px-4 py-4">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                    <Avatar
                      src={user.image ?? undefined}
                      alt={user.name ?? "Admin"}
                      size={40}
                      fallbackText={user.name ?? undefined}
                      className="h-10 w-10 flex-shrink-0 ring-2 ring-white/10"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user.name ?? "Admin"}</p>
                      <p className="truncate text-xs text-slate-400">{user.email ?? ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handleNavigate("/")}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                      Back to Site
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
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
                      className="h-10 w-10 flex-shrink-0 ring-2 ring-white/10"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => handleNavigate("/")}
                      className="flex items-center justify-center rounded-xl p-2 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
                      title="Back to Site"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center rounded-xl p-2 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
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
            className="fixed inset-0 z-30 bg-[#0a1128]/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="rounded-xl p-2 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white lg:hidden"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
              <div className="flex flex-1 items-center justify-end gap-3">
                <GlobalSearch 
                  variant="admin" 
                  placeholder="Search projects, clients, leads, tasks..." 
                />
              </div>
            </div>
          </header>

          {/* Notification Banner */}
          <AdminNotificationBanner />

          <main className="flex-1 overflow-y-auto bg-[#0a1128] px-4 py-8 lg:px-10 lg:py-12">
            {/* Subtle dot pattern background */}
            <div 
              className="fixed inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            />
            <div className="relative mx-auto w-full max-w-[1200px] space-y-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminAppShell;

