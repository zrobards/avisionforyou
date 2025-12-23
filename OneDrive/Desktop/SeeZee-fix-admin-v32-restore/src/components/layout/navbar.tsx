"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Rocket, Clock } from "lucide-react";
import { NavLink } from "@/components/navbar/NavLink";
import { Notifications } from "@/components/navbar/Notifications";
import { ContextPill } from "@/components/navbar/ContextPill";
import { ProfileMenu } from "@/components/navbar/ProfileMenu";
import { MobileMenu } from "@/components/navbar/MobileMenu";
import { LogoMinimal } from "@/components/Logo";
import { fetchJson } from "@/lib/client-api";
import { getActiveProjectRequest } from "@/lib/dashboard-state";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeProjectRequest, setActiveProjectRequest] = useState<any | null>(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch active project request for client users
  useEffect(() => {
    if (session?.user && (session.user.role === "CLIENT" || !session.user.role)) {
      fetchJson<{ requests: any[] }>("/api/client/requests")
        .then((data) => {
          const activeRequest = getActiveProjectRequest(data.requests || []);
          setActiveProjectRequest(activeRequest);
        })
        .catch(() => {
          // Silently fail - user might not have access yet
        });
    } else {
      setActiveProjectRequest(null);
    }
  }, [session, pathname]); // Refetch when pathname changes (e.g., after submission redirect)

  // Determine user context and role
  const isCEO = session?.user?.role === "CEO";
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";
  const isClient = session?.user?.role === "CLIENT" || !session?.user?.role;
  
  // Determine current context based on pathname
  const currentContext = pathname?.startsWith("/ceo") 
    ? "CEO" 
    : pathname?.startsWith("/admin") 
    ? "Admin" 
    : "Client";

  return (
    <>
      <header 
        role="banner" 
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/10' 
            : 'bg-white/90 backdrop-blur-xl'
        } border-b border-[#e2e8f0]`}
      >
        <div className="max-w-7xl mx-auto h-[var(--nav-h)] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden rounded-lg p-2 text-[#475569] hover:bg-[#f9fafb] hover:text-[#0f172a] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity">
            <LogoMinimal size={40} className="sm:w-[45px] sm:h-[45px]" />
          </Link>

          {/* Primary Nav - Desktop */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1 ml-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/about">About</NavLink>
          </nav>

          <div className="flex-1" />

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            {/* Context Pill - Show only if authenticated */}
            {session && (
              <ContextPill
                currentContext={currentContext === "CEO" ? "Admin" : currentContext}
                hasAdminAccess={isAdmin || isCEO}
                hasClientAccess={true}
              />
            )}

            {/* Notifications */}
            {session && <Notifications />}

            {/* Start a Project CTA or Project Status - Desktop */}
            {activeProjectRequest ? (
              <Link
                href="/client"
                className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-600 transition-all min-h-[36px] sm:min-h-[44px]"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden lg:inline">
                  {activeProjectRequest.title || 'Project Request'} - {activeProjectRequest.status.replace(/_/g, ' ')}
                </span>
                <span className="lg:hidden">Project Status</span>
              </Link>
            ) : (
              <Link
                href="/start"
                className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#dc2626] px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#b91c1c] transition-all min-h-[36px] sm:min-h-[44px]"
              >
                <Rocket className="h-4 w-4" />
                <span className="hidden lg:inline">Start a Project</span>
              </Link>
            )}

            {/* Profile Menu */}
            <ProfileMenu user={session?.user} />
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}