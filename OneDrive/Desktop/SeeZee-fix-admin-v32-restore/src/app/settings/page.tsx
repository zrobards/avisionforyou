"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User, Bell, Lock, Sliders, Plug, CreditCard, Shield,
  Save, CheckCircle, AlertTriangle, Trash2,
  Mail, MapPin, Globe, LogOut, Key, Smartphone, Monitor,
  Languages, Clock, LayoutGrid, Pencil, X
} from "lucide-react";

// Glass components
import { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter } from "@/components/settings/GlassCard";
import { GlassTabs, TabItem } from "@/components/settings/GlassTabs";
import { GlassButton } from "@/components/settings/GlassButton";
import { GlassInput, GlassTextarea, GlassSelect } from "@/components/settings/GlassInput";
import { ProfileHeader } from "@/components/settings/ProfileHeader";
import { SettingsRow, SettingsDivider } from "@/components/settings/SettingsRow";
import { SessionCard, SecurityAlertCard } from "@/components/settings/SessionCard";
import { NotificationToggle } from "@/components/settings/NotificationToggle";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { Switch } from "@/components/ui/Switch";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { OAuthConnectionCard } from "@/components/profile/OAuthConnectionCard";
import { useToast } from "@/stores/useToast";
import { useDialogContext } from "@/lib/dialog";

type TabType = "profile" | "account" | "security" | "notifications" | "preferences" | "integrations" | "billing";

// Animated mesh background
function AnimatedMeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
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

function SettingsContent() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const dialog = useDialogContext();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "profile");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile edit mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const userRole = session?.user?.role as string | undefined;
  const isClient = userRole === "CLIENT";
  const isAdmin = ["CEO", "ADMIN"].includes(userRole || "");

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    timezone: "UTC",
    profileImage: "",
    publicProfile: false,
  });

  // Backup for cancel
  const [profileBackup, setProfileBackup] = useState(profileData);

  // Account state
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Security state
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    projectUpdatesEmail: true,
    billingEmail: true,
    marketingEmail: false,
    securityEmail: true,
    projectUpdatesApp: true,
    billingApp: true,
    securityApp: true,
    browserPushEnabled: false,
    quietHoursStart: "",
    quietHoursEnd: "",
    digestFrequency: "none",
  });

  // User preferences state
  const [preferences, setPreferences] = useState({
    theme: "dark" as "light" | "dark" | "auto",
    accentColor: "#8B5CF6",
    fontSize: "medium",
    reduceAnimations: false,
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    defaultView: "kanban",
    sidebarCollapsed: false,
    compactMode: false,
  });

  // Billing state
  const [billingInvoices, setBillingInvoices] = useState<any[]>([]);
  const [billingSubscriptions, setBillingSubscriptions] = useState<any[]>([]);
  const [billingMaintenancePlans, setBillingMaintenancePlans] = useState<any[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [billingStats, setBillingStats] = useState({
    activeSubscriptions: 0,
    totalMonthlyAmount: 0,
  });

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completed = 0;
    const total = 5;
    if (profileData.name) completed++;
    if (profileData.email) completed++;
    if (profileData.bio) completed++;
    if (profileData.location) completed++;
    if (profileData.profileImage) completed++;
    return Math.round((completed / total) * 100);
  };

  // Fetch user data
  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    fetchProfile();
    fetchNotificationPreferences();
    fetchUserPreferences();
    fetchConnectedAccounts();
    fetchActiveSessions();
    if (isClient) {
      fetchBillingData();
    }
  }, [session, isClient]);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabType);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.user) {
        const newProfileData = {
          name: data.user.name || "",
          email: data.user.email || "",
          bio: data.user.bio || "",
          location: data.user.location || "",
          timezone: data.user.timezone || "UTC",
          profileImage: data.user.image || "",
          publicProfile: data.profile?.publicProfile || false,
        };
        setProfileData(newProfileData);
        setProfileBackup(newProfileData);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const res = await fetch("/api/settings/notifications");
      const data = await res.json();
      if (data) {
        setNotifications(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const res = await fetch("/api/settings/preferences");
      const data = await res.json();
      if (data) {
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    }
  };

  const fetchConnectedAccounts = async () => {
    try {
      const res = await fetch("/api/auth/oauth/accounts");
      if (res.ok) {
        const data = await res.json();
        setConnectedAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Failed to fetch connected accounts:", error);
    }
  };

  const fetchActiveSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/settings/sessions");
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
      
      // Track current session (create/update it)
      try {
        await fetch("/api/settings/sessions/track", {
          method: "POST",
        });
      } catch (error) {
        // Silently fail session tracking
        console.error("Failed to track session:", error);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchBillingData = async () => {
    try {
      // Fetch invoices
      const invoicesRes = await fetch("/api/client/invoices");
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        if (invoicesData.invoices) {
          setBillingInvoices(invoicesData.invoices);
        }
      }

      // Fetch subscriptions
      const subsRes = await fetch("/api/client/subscriptions");
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        if (subsData.subscriptions) {
          setBillingSubscriptions(subsData.subscriptions);
        }
        if (subsData.maintenancePlans) {
          setBillingMaintenancePlans(subsData.maintenancePlans);
        }
        if (subsData.stats) {
          setBillingStats(subsData.stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
    }
  };

  const handleBillingPortal = async () => {
    setLoadingBilling(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to open billing portal", "error");
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      showToast("Failed to open billing portal", "error");
    } finally {
      setLoadingBilling(false);
    }
  };

  const startEditingProfile = () => {
    setProfileBackup(profileData);
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setProfileData(profileBackup);
    setIsEditingProfile(false);
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      await update({ name: profileData.name });
      setProfileBackup(profileData);
      setIsEditingProfile(false);
      showToast("Profile updated successfully!", "success");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error: any) {
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationPreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      if (!res.ok) throw new Error("Failed to update preferences");

      showToast("Notification preferences updated!", "success");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error: any) {
      showToast(error.message || "Failed to update preferences", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) throw new Error("Failed to update preferences");

      showToast("Preferences updated!", "success");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error: any) {
      showToast(error.message || "Failed to update preferences", "error");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showToast("Passwords don't match", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (!res.ok) throw new Error("Failed to change password");

      showToast("Password changed successfully!", "success");
      setPasswords({ current: "", new: "", confirm: "" });
      setShowPasswordChange(false);
    } catch (error: any) {
      showToast(error.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/settings/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to revoke session");

      setSessions(sessions.filter((s) => s.id !== sessionId));
      showToast("Session revoked", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to revoke session", "error");
    }
  };

  const revokeAllSessions = async () => {
    const confirmed = await dialog.confirm("This will log you out of all other devices. Continue?", {
      title: "Revoke All Sessions",
      variant: "warning",
    });
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch("/api/settings/sessions/revoke-all", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to revoke sessions");

      fetchActiveSessions();
      showToast("All other sessions revoked", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to revoke sessions", "error");
    }
  };

  const deleteAccount = async () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== "DELETE") {
      showToast("Account deletion cancelled", "info");
      return;
    }

    const passwordInput = prompt("Enter your password to confirm:");
    if (passwordInput === null) {
      showToast("Account deletion cancelled", "info");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput, confirmation: "DELETE" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      showToast("Account deleted. Goodbye!", "success");
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push("/api/auth/signout");
    } catch (error: any) {
      showToast(error.message || "Failed to delete account", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs: TabItem[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "security", label: "Security", icon: Lock, badge: sessions.length > 0 ? sessions.length : undefined },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Sliders },
    ...(isAdmin ? [{ id: "integrations" as const, label: "Integrations", icon: Plug }] : []),
    ...(isClient ? [{ id: "billing" as const, label: "Billing", icon: CreditCard }] : []),
  ];

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedMeshBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <GlassTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              {/* Profile Header Card */}
              <ProfileHeader
                profile={{
                  name: profileData.name,
                  email: profileData.email,
                  image: profileData.profileImage,
                  bio: profileData.bio,
                  location: profileData.location,
                  role: userRole,
                }}
                completionPercentage={calculateProfileCompletion()}
                onImageClick={isEditingProfile ? () => document.getElementById('profile-image-upload')?.click() : undefined}
              />

              {/* Profile Form */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<User className="w-5 h-5" />}
                  title="Profile Information"
                  description={isEditingProfile ? "Edit your personal information" : "Your personal information"}
                  action={
                    !isEditingProfile ? (
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        icon={Pencil}
                        onClick={startEditingProfile}
                      >
                        Edit Profile
                      </GlassButton>
                    ) : null
                  }
                />
                <GlassCardContent className="space-y-6">
                  {isEditingProfile ? (
                    // Edit Mode
                    <>
                      <div id="profile-image-upload">
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          Profile Picture
                        </label>
                        <ImageUpload
                          currentImage={profileData.profileImage}
                          onImageChange={(url) =>
                            setProfileData({ ...profileData, profileImage: url })
                          }
                        />
                      </div>

                      <GlassInput
                        label="Full Name"
                        icon={User}
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                        placeholder="Enter your name"
                      />

                      <GlassTextarea
                        label="Bio"
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({ ...profileData, bio: e.target.value })
                        }
                        rows={3}
                        maxLength={200}
                        characterCount
                        placeholder="Tell us about yourself..."
                      />

                      <GlassInput
                        label="Location"
                        icon={MapPin}
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({ ...profileData, location: e.target.value })
                        }
                        placeholder="San Francisco, CA"
                      />

                      <SettingsRow
                        label="Public Profile"
                        description="Make your profile visible to other users"
                        icon={Globe}
                      >
                        <Switch
                          checked={profileData.publicProfile}
                          onCheckedChange={(checked) =>
                            setProfileData({ ...profileData, publicProfile: checked })
                          }
                        />
                      </SettingsRow>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <User className="w-4 h-4" />
                            Full Name
                          </div>
                          <p className="text-white font-medium">{profileData.name || "Not set"}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                          <p className="text-white font-medium">{profileData.email}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <MapPin className="w-4 h-4" />
                            Location
                          </div>
                          <p className="text-white font-medium">{profileData.location || "Not set"}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Globe className="w-4 h-4" />
                            Profile Visibility
                          </div>
                          <p className="text-white font-medium">{profileData.publicProfile ? "Public" : "Private"}</p>
                        </div>
                      </div>

                      {profileData.bio && (
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="text-slate-400 text-sm mb-1">Bio</div>
                          <p className="text-white">{profileData.bio}</p>
                        </div>
                      )}

                      {!profileData.bio && (
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] border-dashed">
                          <p className="text-slate-500 text-sm text-center">
                            No bio set. Click "Edit Profile" to add one.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </GlassCardContent>
                {isEditingProfile && (
                  <GlassCardFooter className="flex gap-3">
                    <GlassButton
                      onClick={saveProfile}
                      loading={loading}
                      icon={saveSuccess ? CheckCircle : Save}
                      variant={saveSuccess ? "success" : "primary"}
                    >
                      {saveSuccess ? "Saved!" : "Save Changes"}
                    </GlassButton>
                    <GlassButton
                      onClick={cancelEditingProfile}
                      variant="ghost"
                      icon={X}
                    >
                      Cancel
                    </GlassButton>
                  </GlassCardFooter>
                )}
              </GlassCard>
            </>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <>
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Mail className="w-5 h-5" />}
                  title="Email Address"
                  description="Your verified email address"
                />
                <GlassCardContent>
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-white">{profileData.email}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Plug className="w-5 h-5" />}
                  title="Connected Accounts"
                  description="Manage your OAuth connections"
                />
                <GlassCardContent>
                  <OAuthConnectionCard
                    provider="google"
                    connected={connectedAccounts.some(a => a.provider === "google")}
                    email={connectedAccounts.find(a => a.provider === "google")?.email}
                    onConnectionChange={fetchConnectedAccounts}
                  />
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Key className="w-5 h-5" />}
                  title="Password"
                  description="Change your account password"
                />
                <GlassCardContent>
                  {!showPasswordChange ? (
                    <GlassButton
                      variant="secondary"
                      onClick={() => setShowPasswordChange(true)}
                      icon={Key}
                    >
                      Change Password
                    </GlassButton>
                  ) : (
                    <div className="space-y-4">
                      <GlassInput
                        type="password"
                        label="Current Password"
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords({ ...passwords, current: e.target.value })
                        }
                      />
                      <GlassInput
                        type="password"
                        label="New Password"
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords({ ...passwords, new: e.target.value })
                        }
                        description="At least 8 characters"
                      />
                      <GlassInput
                        type="password"
                        label="Confirm New Password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords({ ...passwords, confirm: e.target.value })
                        }
                        error={
                          passwords.confirm && passwords.new !== passwords.confirm
                            ? "Passwords don't match"
                            : undefined
                        }
                      />
                      <div className="flex gap-3 pt-2">
                        <GlassButton
                          onClick={changePassword}
                          loading={loading}
                          variant="primary"
                        >
                          Update Password
                        </GlassButton>
                        <GlassButton
                          onClick={() => setShowPasswordChange(false)}
                          variant="ghost"
                        >
                          Cancel
                        </GlassButton>
                      </div>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                  title="Danger Zone"
                  description="Permanently delete your account"
                />
                <GlassCardContent>
                  <SecurityAlertCard
                    title="Delete Account"
                    description="Once you delete your account, there is no going back. All your data will be permanently deleted."
                    severity="danger"
                    action={{
                      label: "Delete Account",
                      onClick: deleteAccount,
                    }}
                  />
                </GlassCardContent>
              </GlassCard>
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <>
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Monitor className="w-5 h-5" />}
                  title="Active Sessions"
                  description={`${sessions.length} active session${sessions.length !== 1 ? 's' : ''} across your devices`}
                  action={
                    sessions.length > 1 && (
                      <GlassButton
                        variant="danger"
                        size="sm"
                        onClick={revokeAllSessions}
                        icon={LogOut}
                      >
                        Revoke All Others
                      </GlassButton>
                    )
                  }
                />
                <GlassCardContent className="space-y-3">
                  {sessionsLoading ? (
                    // Loading skeleton
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] animate-pulse">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.05]" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-48 bg-white/[0.05] rounded" />
                              <div className="h-3 w-32 bg-white/[0.05] rounded" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <Monitor className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No Sessions Found</h3>
                      <p className="text-slate-400 max-w-sm mx-auto">
                        Session tracking may not be enabled for your account.
                      </p>
                    </div>
                  ) : (
                    <>
                      {sessions.map((sess) => (
                        <SessionCard
                          key={sess.id}
                          session={sess}
                          isCurrent={sess.isCurrent === true}
                          onRevoke={revokeSession}
                        />
                      ))}
                    </>
                  )}
                </GlassCardContent>
              </GlassCard>

              {/* Security Tips */}
              <GlassCard variant="subtle" padding="lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Security Tips</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Use a strong, unique password for your account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Review your active sessions regularly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Revoke sessions from devices you don't recognize</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <>
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Mail className="w-5 h-5" />}
                  title="Email Notifications"
                  description="Choose what emails you want to receive"
                />
                <GlassCardContent>
                  <NotificationToggle
                    label="Project Updates"
                    description="Receive emails about project progress and milestones"
                    icon={LayoutGrid}
                    checked={notifications.projectUpdatesEmail}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, projectUpdatesEmail: checked })
                    }
                  />
                  <SettingsDivider />
                  <NotificationToggle
                    label="Billing & Invoices"
                    description="Invoices, payment confirmations, and billing alerts"
                    icon={CreditCard}
                    checked={notifications.billingEmail}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, billingEmail: checked })
                    }
                  />
                  <SettingsDivider />
                  <NotificationToggle
                    label="Marketing & Updates"
                    description="Tips, offers, and product announcements"
                    icon={Bell}
                    checked={notifications.marketingEmail}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, marketingEmail: checked })
                    }
                  />
                  <SettingsDivider />
                  <NotificationToggle
                    label="Security Alerts"
                    description="Important security notifications and login alerts"
                    icon={Shield}
                    checked={notifications.securityEmail}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, securityEmail: checked })
                    }
                  />
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Smartphone className="w-5 h-5" />}
                  title="In-App Notifications"
                  description="Choose what notifications you see in the app"
                />
                <GlassCardContent>
                  <NotificationToggle
                    label="Project Updates"
                    icon={LayoutGrid}
                    checked={notifications.projectUpdatesApp}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, projectUpdatesApp: checked })
                    }
                  />
                  <SettingsDivider />
                  <NotificationToggle
                    label="Billing Alerts"
                    icon={CreditCard}
                    checked={notifications.billingApp}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, billingApp: checked })
                    }
                  />
                  <SettingsDivider />
                  <NotificationToggle
                    label="Security Notifications"
                    icon={Shield}
                    checked={notifications.securityApp}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, securityApp: checked })
                    }
                  />
                </GlassCardContent>
                <GlassCardFooter>
                  <GlassButton
                    onClick={saveNotificationPreferences}
                    loading={loading}
                    icon={saveSuccess ? CheckCircle : Save}
                    variant={saveSuccess ? "success" : "primary"}
                  >
                    {saveSuccess ? "Saved!" : "Save Preferences"}
                  </GlassButton>
                </GlassCardFooter>
              </GlassCard>
            </>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <>
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Sliders className="w-5 h-5" />}
                  title="Appearance"
                  description="Customize how the app looks and feels"
                />
                <GlassCardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">
                      Theme
                    </label>
                    <ThemeSelector />
                  </div>

                  <SettingsRow
                    label="Reduce Animations"
                    description="Minimize motion for accessibility"
                    icon={Sliders}
                  >
                    <Switch
                      checked={preferences.reduceAnimations}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, reduceAnimations: checked })
                      }
                    />
                  </SettingsRow>

                  <SettingsRow
                    label="Compact Mode"
                    description="Use smaller spacing and text sizes"
                    icon={LayoutGrid}
                  >
                    <Switch
                      checked={preferences.compactMode}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, compactMode: checked })
                      }
                    />
                  </SettingsRow>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Languages className="w-5 h-5" />}
                  title="Language & Region"
                  description="Set your language and regional preferences"
                />
                <GlassCardContent className="space-y-4">
                  <GlassSelect
                    label="Date Format"
                    value={preferences.dateFormat}
                    onChange={(e) =>
                      setPreferences({ ...preferences, dateFormat: e.target.value })
                    }
                    options={[
                      { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                      { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                      { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                    ]}
                  />

                  <GlassSelect
                    label="Time Format"
                    value={preferences.timeFormat}
                    onChange={(e) =>
                      setPreferences({ ...preferences, timeFormat: e.target.value })
                    }
                    options={[
                      { value: "12h", label: "12-hour (1:00 PM)" },
                      { value: "24h", label: "24-hour (13:00)" },
                    ]}
                  />
                </GlassCardContent>
                <GlassCardFooter>
                  <GlassButton
                    onClick={saveUserPreferences}
                    loading={loading}
                    icon={saveSuccess ? CheckCircle : Save}
                    variant={saveSuccess ? "success" : "primary"}
                  >
                    {saveSuccess ? "Saved!" : "Save Preferences"}
                  </GlassButton>
                </GlassCardFooter>
              </GlassCard>
            </>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrations" && (
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader
                icon={<Plug className="w-5 h-5" />}
                title="Connected Services"
                description="Manage third-party integrations"
              />
              <GlassCardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <Plug className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No integrations yet
                  </h3>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Stay tuned! We're working on integrations with popular tools and services.
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && isClient && (
            <>
              {/* Billing Stats Overview */}
              {billingStats.activeSubscriptions > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <GlassCard variant="elevated" padding="md">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <CreditCard className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Active Subscriptions</p>
                        <p className="text-2xl font-bold text-white">{billingStats.activeSubscriptions}</p>
                      </div>
                    </div>
                  </GlassCard>
                  <GlassCard variant="elevated" padding="md">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <CreditCard className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Monthly Total</p>
                        <p className="text-2xl font-bold text-white">
                          ${(billingStats.totalMonthlyAmount / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Billing Portal Card */}
              <GlassCard variant="elevated" padding="lg" glow="accent">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Stripe Billing Portal</h3>
                    <p className="text-slate-400 text-sm mb-4 max-w-md">
                      Manage your payment methods, view invoices, and update your billing information through our secure Stripe portal.
                    </p>
                    <button
                      onClick={handleBillingPortal}
                      disabled={loadingBilling}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {loadingBilling ? (
                        <>Loading...</>
                      ) : (
                        <>
                          Open Billing Portal
                          <CreditCard className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <div className="hidden sm:block p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                    <CreditCard className="w-12 h-12 text-violet-400" />
                  </div>
                </div>
              </GlassCard>

              {/* Active Subscriptions */}
              {billingMaintenancePlans.filter(p => p.status === "ACTIVE").length > 0 && (
                <GlassCard variant="elevated" padding="lg">
                  <GlassCardHeader
                    icon={<CreditCard className="w-5 h-5" />}
                    title="Active Subscriptions"
                    description="Your current maintenance and support plans"
                  />
                  <GlassCardContent>
                    <div className="space-y-4">
                      {billingMaintenancePlans.filter(p => p.status === "ACTIVE").map((plan: any) => (
                        <div
                          key={plan.id}
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-violet-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{plan.tier} Maintenance</p>
                                <p className="text-sm text-slate-400">{plan.projectName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">
                                ${(Number(plan.monthlyPrice) / 100).toFixed(0)}/mo
                              </p>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                Active
                              </span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <div>
                              <p className="text-slate-400">Support Hours</p>
                              <p className="text-white">{plan.supportHoursUsed || 0}/{plan.supportHoursIncluded === -1 ? 'Unlimited' : plan.supportHoursIncluded} used</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCardContent>
                </GlassCard>
              )}

              {/* Recent Invoices */}
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<CreditCard className="w-5 h-5" />}
                  title="Recent Invoices"
                  description="Your billing history"
                />
                <GlassCardContent>
                  {billingInvoices.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-slate-400">No invoices yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {billingInvoices.slice(0, 5).map((invoice: any) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {invoice.description || invoice.title}
                            </p>
                            <p className="text-sm text-slate-400">
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-white">
                              ${(Number(invoice.total || invoice.amount) / 100).toFixed(2)}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                invoice.status === 'PAID'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : invoice.status === 'OVERDUE'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="animate-pulse text-slate-400">Loading settings...</div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
