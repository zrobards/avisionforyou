"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  FiHome,
  FiFolder,
  FiFileText,
  FiMessageSquare,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiLogOut,
  FiCheckSquare,
  FiCreditCard,
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSettings,
  FiVideo,
  FiClock,
  FiUser,
  FiShield,
  FiActivity,
  FiZap,
  FiPlusCircle,
  FiCalendar,
} from "react-icons/fi";
import Avatar from "@/components/ui/Avatar";
import LogoHeader from "@/components/brand/LogoHeader";
import GlobalSearch from "@/components/ui/GlobalSearch";
import { Notifications } from "@/components/navbar/Notifications";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

// Collapsible navigation group component
function CollapsibleNavGroup({
  group,
  isCollapsed,
  isActive,
  onNavigate,
}: {
  group: NavGroup;
  isCollapsed: boolean;
  isActive: (href: string) => boolean;
  onNavigate: (href: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? false);
  const hasActiveChild = group.items.some((item) => isActive(item.href));
  
  // Auto-expand if a child is active
  useState(() => {
    if (hasActiveChild) setIsOpen(true);
  });

  if (isCollapsed) {
    // In collapsed mode, show first item's icon with tooltip
    return (
      <div className="relative group">
        <button
          onClick={() => onNavigate(group.items[0]?.href || "#")}
          className={`flex w-full items-center justify-center rounded-lg p-3 transition-all duration-200 ${
            hasActiveChild
              ? "bg-trinity-red text-white shadow-lg"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}
          title={group.label}
        >
          <group.icon className="h-5 w-5" />
        </button>
        {/* Tooltip with all items */}
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-2 min-w-[180px]">
            <p className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-800 mb-2">
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.href}
                onClick={() => onNavigate(item.href)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-trinity-red/20 text-trinity-red"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-trinity-red text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 ${
          hasActiveChild && !isOpen
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <group.icon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm">{group.label}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 space-y-1 border-l border-gray-800 pl-4">
              {group.items.map((item) => (
                <motion.button
                  key={item.href}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(item.href)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-trinity-red text-white shadow-md"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-trinity-red/20 text-trinity-red text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Get session data - SessionProvider should be available from root layout
  const { data: session, status } = useSession();
  
  // Initialize state - must be called in same order every render
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/client") {
        return pathname === "/client" || pathname === "/client/overview";
      }
      if (href === "/start") {
        return pathname === "/start";
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

  // Grouped navigation structure
  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: FiHome,
        defaultOpen: true,
        items: [
          { href: "/client", label: "Overview", icon: FiHome },
          { href: "/client/activity", label: "Activity", icon: FiActivity },
        ],
      },
      {
        id: "projects",
        label: "Projects",
        icon: FiFolder,
        defaultOpen: true,
        items: [
          { href: "/client/projects", label: "All Projects", icon: FiFolder },
          { href: "/client/requests", label: "Change Requests", icon: FiZap },
          { href: "/client/files", label: "Files", icon: FiFileText },
        ],
      },
      {
        id: "billing",
        label: "Billing",
        icon: FiCreditCard,
        items: [
          { href: "/client/billing", label: "Overview", icon: FiCreditCard },
          { href: "/client/invoices", label: "Invoices", icon: FiFileText },
          { href: "/client/hours", label: "Hour Packs", icon: FiClock },
          { href: "/client/subscriptions", label: "Subscriptions", icon: FiCheckSquare },
        ],
      },
      {
        id: "communication",
        label: "Communication",
        icon: FiMessageSquare,
        items: [
          { href: "/client/messages", label: "Messages", icon: FiMessageSquare },
          { href: "/client/meetings", label: "Meetings", icon: FiVideo },
          { href: "/client/calendar", label: "Calendar", icon: FiCalendar },
          { href: "/client/recordings", label: "Recordings", icon: FiVideo },
        ],
      },
      {
        id: "account",
        label: "Account",
        icon: FiUser,
        items: [
          { href: "/client/profile", label: "Profile", icon: FiUser },
          { href: "/settings", label: "Settings", icon: FiSettings },
          { href: "/client/support", label: "Support", icon: FiHelpCircle },
        ],
      },
    ],
    []
  );

  const user = session?.user;

  // Handle case where session is loading - after all hooks are called
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 transform border-r border-gray-800 bg-gray-900 transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isCollapsed ? "w-20 lg:w-20" : "w-64 lg:w-64"
          } ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className={`border-b border-gray-800 px-6 py-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && <LogoHeader href="/client" />}
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
              {/* Quick Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate("/client/requests/new")}
                className={`flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-trinity-red to-trinity-maroon px-4 py-3 text-white shadow-lg shadow-trinity-red/20 transition-all hover:shadow-trinity-red/30 mb-4 ${
                  isCollapsed ? "justify-center" : ""
                }`}
                title={isCollapsed ? "New Request" : undefined}
              >
                <FiPlusCircle className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-semibold">New Request</span>}
              </motion.button>

              {/* Collapsible Navigation Groups */}
              {navGroups.map((group) => (
                <CollapsibleNavGroup
                  key={group.id}
                  group={group}
                  isCollapsed={isCollapsed}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                />
              ))}
            </nav>
            <div className="border-t border-gray-800 px-4 py-4">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                    <Avatar
                      src={user?.image ?? undefined}
                      alt={user?.name ?? "User"}
                      size={40}
                      fallbackText={user?.name ?? undefined}
                      className="h-10 w-10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user?.name ?? "User"}</p>
                      <p className="truncate text-xs text-gray-400">{user?.email ?? ""}</p>
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
                  <div title={`${user?.name ?? "User"} - ${user?.email ?? ""}`}>
                    <Avatar
                      src={user?.image ?? undefined}
                      alt={user?.name ?? "User"}
                      size={40}
                      fallbackText={user?.name ?? undefined}
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
          <header className="relative border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm px-4 py-4 lg:px-8 z-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white lg:hidden"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
              <div className="flex flex-1 items-center justify-end gap-3">
                <GlobalSearch 
                  variant="client" 
                  placeholder="Search projects, invoices, pages..." 
                />
                {/* Notification Bell */}
                <Notifications />
                {/* Quick New Request Button (Desktop) */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate("/client/requests/new")}
                  className="hidden md:flex items-center gap-2 rounded-lg bg-trinity-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-trinity-maroon"
                >
                  <FiPlusCircle className="h-4 w-4" />
                  New Request
                </motion.button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#0a1128] px-4 py-6 lg:px-10 lg:py-10">
            {/* Subtle dot pattern background */}
            <div 
              className="fixed inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            />
            <div className="relative mx-auto w-full max-w-[1200px] space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
