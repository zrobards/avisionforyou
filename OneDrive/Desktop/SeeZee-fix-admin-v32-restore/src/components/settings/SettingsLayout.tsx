"use client";

import { ReactNode, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  User, Bell, Lock, Sliders, Plug, CreditCard, Shield,
  LucideIcon
} from "lucide-react";
import { GlassTabs, TabItem } from "./GlassTabs";

interface SettingsLayoutProps {
  children: (activeTab: string, setActiveTab: (tab: string) => void) => ReactNode;
  title?: string;
  description?: string;
}

// Animated mesh background component
function AnimatedMeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Animated gradient orbs */}
      <div 
        className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          animation: "float 20s ease-in-out infinite",
        }}
      />
      <div 
        className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)",
          animation: "float 25s ease-in-out infinite reverse",
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)",
          animation: "pulse 15s ease-in-out infinite",
        }}
      />

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function SettingsLayoutContent({
  children,
  title = "Settings",
  description = "Manage your account settings and preferences",
}: SettingsLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "profile");

  const userRole = session?.user?.role as string | undefined;
  const isClient = userRole === "CLIENT";
  const isAdmin = ["CEO", "ADMIN"].includes(userRole || "");

  // Build tabs based on role
  const baseTabs: TabItem[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Sliders },
  ];

  const additionalTabs: TabItem[] = [];

  if (isAdmin) {
    additionalTabs.push({ id: "integrations", label: "Integrations", icon: Plug });
  }

  if (isClient) {
    additionalTabs.push({ id: "billing", label: "Billing", icon: CreditCard });
  }

  const tabs = [...baseTabs, ...additionalTabs];

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without full navigation
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedMeshBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            {title}
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">{description}</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <GlassTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Content Area */}
        <div className="relative">
          {children(activeTab, setActiveTab)}
        </div>
      </div>
    </div>
  );
}

export function SettingsLayout(props: SettingsLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="animate-pulse text-slate-400">Loading settings...</div>
        </div>
      }
    >
      <SettingsLayoutContent {...props} />
    </Suspense>
  );
}

// Export tabs configuration for external use
export function getSettingsTabs(userRole?: string): TabItem[] {
  const isClient = userRole === "CLIENT";
  const isAdmin = ["CEO", "ADMIN"].includes(userRole || "");

  const baseTabs: TabItem[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Sliders },
  ];

  if (isAdmin) {
    baseTabs.push({ id: "integrations", label: "Integrations", icon: Plug });
  }

  if (isClient) {
    baseTabs.push({ id: "billing", label: "Billing", icon: CreditCard });
  }

  return baseTabs;
}








