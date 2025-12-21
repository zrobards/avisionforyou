"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User, Bell, CreditCard, Lock, Shield, Save, CheckCircle,
  Key, AlertTriangle, ExternalLink,
  Mail, Phone, Building2, LayoutGrid, Pencil, X, Eye
} from "lucide-react";

// Glass components - shared design system
import { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter } from "@/components/settings/GlassCard";
import { GlassTabs, TabItem } from "@/components/settings/GlassTabs";
import { GlassButton } from "@/components/settings/GlassButton";
import { GlassInput, GlassSelect } from "@/components/settings/GlassInput";
import { ProfileHeader } from "@/components/settings/ProfileHeader";
import { SettingsRow, SettingsDivider } from "@/components/settings/SettingsRow";
import { NotificationToggle } from "@/components/settings/NotificationToggle";
import { SecurityAlertCard } from "@/components/settings/SessionCard";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/stores/useToast";
import { fetchJson } from "@/lib/client-api";

type TabType = "profile" | "notifications" | "billing" | "security" | "privacy";

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

export default function ClientSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile edit mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  // Backup for cancel
  const [profileBackup, setProfileBackup] = useState({ name: "", company: "", phone: "" });

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(true);

  // Billing state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Privacy state
  const [emailVisibility, setEmailVisibility] = useState("private");
  const [profileVisibility, setProfileVisibility] = useState("private");
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      fetchProfile();
      fetchNotifications();
      fetchInvoices();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const data = await fetchJson<any>("/api/client/profile");
      if (data.profile) {
        const profileData = {
          name: session?.user?.name || "",
          company: data.profile.company || "",
          phone: data.profile.phone || "",
        };
        setCompany(profileData.company);
        setPhone(profileData.phone);
        setProfileBackup(profileData);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await fetchJson<any>("/api/client/settings/notifications");
      if (data.emailNotifications !== undefined) {
        setEmailNotifications(data.emailNotifications);
      }
      if (data.projectUpdates !== undefined) {
        setProjectUpdates(data.projectUpdates);
      }
      if (data.invoiceReminders !== undefined) {
        setInvoiceReminders(data.invoiceReminders);
      }
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const data = await fetchJson<any>("/api/client/invoices");
      if (data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const startEditingProfile = () => {
    setProfileBackup({ name, company, phone });
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setName(profileBackup.name);
    setCompany(profileBackup.company);
    setPhone(profileBackup.phone);
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, phone }),
      });

      if (response.ok) {
        setProfileBackup({ name, company, phone });
        setIsEditingProfile(false);
        showToast("Profile saved successfully!", "success");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/client/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications,
          projectUpdates,
          invoiceReminders,
        }),
      });

      if (response.ok) {
        showToast("Notification preferences saved!", "success");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Failed to update notifications:", error);
      showToast("Failed to update notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setLoadingBilling(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      showToast("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      showToast(error.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("To confirm account deletion, please enter your password:");
    if (!password) return;

    const confirmText = prompt('Type "DELETE" (in capital letters) to confirm:');
    if (confirmText !== "DELETE") {
      showToast("Account deletion cancelled", "info");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirmDelete: confirmText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      showToast("Account deleted. Goodbye!", "success");
      window.location.href = "/api/auth/signout";
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      showToast(error.message || "Failed to delete account", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "overdue":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const tabs: TabItem[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  // Calculate profile completion
  const calculateCompletion = () => {
    let completed = 0;
    if (name) completed++;
    if (session?.user?.email) completed++;
    if (company) completed++;
    if (phone) completed++;
    return Math.round((completed / 4) * 100);
  };

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
            Manage your account preferences and billing
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <GlassTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabType)}
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              <ProfileHeader
                profile={{
                  name: name,
                  email: session?.user?.email || "",
                  image: session?.user?.image || undefined,
                  role: "CLIENT",
                }}
                completionPercentage={calculateCompletion()}
              />

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<User className="w-5 h-5" />}
                  title="Profile Information"
                  description={isEditingProfile ? "Edit your personal and business information" : "Your personal and business information"}
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
                <GlassCardContent className="space-y-5">
                  {isEditingProfile ? (
                    // Edit Mode
                    <>
                      <GlassInput
                        label="Full Name"
                        icon={User}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />

                      <GlassInput
                        label="Company"
                        icon={Building2}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Your company name (optional)"
                      />

                      <GlassInput
                        label="Phone Number"
                        icon={Phone}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
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
                          <p className="text-white font-medium">{name || "Not set"}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                          <p className="text-white font-medium">{session?.user?.email}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Building2 className="w-4 h-4" />
                            Company
                          </div>
                          <p className="text-white font-medium">{company || "Not set"}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Phone className="w-4 h-4" />
                            Phone
                          </div>
                          <p className="text-white font-medium">{phone || "Not set"}</p>
                        </div>
                      </div>
                    </>
                  )}
                </GlassCardContent>
                {isEditingProfile && (
                  <GlassCardFooter className="flex gap-3">
                    <GlassButton
                      onClick={() => handleSaveProfile()}
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

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader
                icon={<Bell className="w-5 h-5" />}
                title="Email Notifications"
                description="Choose what notifications you want to receive"
              />
              <GlassCardContent>
                <NotificationToggle
                  label="Email Notifications"
                  description="Receive email updates about your account"
                  icon={Mail}
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                />
                <SettingsDivider />
                <NotificationToggle
                  label="Project Updates"
                  description="Get notified when project milestones are completed"
                  icon={LayoutGrid}
                  checked={projectUpdates}
                  onChange={setProjectUpdates}
                />
                <SettingsDivider />
                <NotificationToggle
                  label="Invoice Reminders"
                  description="Receive reminders about upcoming payments"
                  icon={CreditCard}
                  checked={invoiceReminders}
                  onChange={setInvoiceReminders}
                />
              </GlassCardContent>
              <GlassCardFooter>
                <GlassButton
                  onClick={handleSaveNotifications}
                  loading={loading}
                  icon={saveSuccess ? CheckCircle : Save}
                  variant={saveSuccess ? "success" : "primary"}
                >
                  {saveSuccess ? "Saved!" : "Save Preferences"}
                </GlassButton>
              </GlassCardFooter>
            </GlassCard>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <>
              <GlassCard variant="elevated" padding="lg" glow="accent">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Billing Portal
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 max-w-md">
                      Manage your payment methods, view invoices, and update your billing information through our secure portal.
                    </p>
                    <GlassButton
                      onClick={handleBillingPortal}
                      loading={loadingBilling}
                      icon={ExternalLink}
                      iconPosition="right"
                    >
                      Open Billing Portal
                    </GlassButton>
                  </div>
                  <div className="hidden sm:block p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                    <CreditCard className="w-12 h-12 text-violet-400" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<CreditCard className="w-5 h-5" />}
                  title="Recent Invoices"
                  description="Your recent billing history"
                />
                <GlassCardContent>
                  {invoices.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-slate-400">No invoices yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.slice(0, 5).map((invoice) => (
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
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}
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

          {/* Security Tab */}
          {activeTab === "security" && (
            <>
              <GlassCard variant="elevated" padding="lg" glow="subtle">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <Shield className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Account Security
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Keep your account secure by using a strong, unique password.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Key className="w-5 h-5" />}
                  title="Change Password"
                  description="Update your account password"
                />
                <GlassCardContent className="space-y-4">
                  <GlassInput
                    type="password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <GlassInput
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    description="Must be at least 8 characters"
                  />
                  <GlassInput
                    type="password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    error={
                      confirmPassword && newPassword !== confirmPassword
                        ? "Passwords don't match"
                        : undefined
                    }
                  />
                </GlassCardContent>
                <GlassCardFooter>
                  <GlassButton
                    onClick={handleChangePassword}
                    loading={loading}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                    icon={Key}
                  >
                    Update Password
                  </GlassButton>
                </GlassCardFooter>
              </GlassCard>
            </>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <>
              <GlassCard variant="elevated" padding="lg" glow="subtle">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                  <Shield className="w-6 h-6 text-violet-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Privacy Settings
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Control how your information is shared and who can see your profile.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<Eye className="w-5 h-5" />}
                  title="Profile Visibility"
                  description="Control who can see your information"
                />
                <GlassCardContent className="space-y-4">
                  <GlassSelect
                    label="Email Address"
                    description="Who can see your email address"
                    value={emailVisibility}
                    onChange={(e) => setEmailVisibility(e.target.value)}
                    options={[
                      { value: "private", label: "Private - Only me" },
                      { value: "team", label: "Team Only" },
                      { value: "public", label: "Public" },
                    ]}
                  />
                  <GlassSelect
                    label="Profile Information"
                    description="Control profile visibility"
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    options={[
                      { value: "private", label: "Private - Only me" },
                      { value: "team", label: "Team Only" },
                      { value: "public", label: "Public" },
                    ]}
                  />
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<LayoutGrid className="w-5 h-5" />}
                  title="Data & Analytics"
                  description="Control data sharing preferences"
                />
                <GlassCardContent>
                  <SettingsRow
                    label="Data Sharing"
                    description="Allow sharing of anonymized data for product improvement"
                    icon={Shield}
                  >
                    <Switch
                      checked={dataSharing}
                      onCheckedChange={setDataSharing}
                    />
                  </SettingsRow>
                  <SettingsDivider />
                  <SettingsRow
                    label="Usage Analytics"
                    description="Help us improve by sharing usage analytics"
                    icon={LayoutGrid}
                  >
                    <Switch
                      checked={analytics}
                      onCheckedChange={setAnalytics}
                    />
                  </SettingsRow>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader
                  icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                  title="Danger Zone"
                  description="Irreversible account actions"
                />
                <GlassCardContent>
                  <SecurityAlertCard
                    title="Delete Account"
                    description="Once you delete your account, there is no going back. All your data will be permanently deleted."
                    severity="danger"
                    action={{
                      label: "Delete Account",
                      onClick: handleDeleteAccount,
                    }}
                  />
                </GlassCardContent>
              </GlassCard>

              <GlassButton
                onClick={() => {
                  showToast("Privacy settings saved!", "success");
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 2000);
                }}
                loading={loading}
                icon={saveSuccess ? CheckCircle : Save}
                variant={saveSuccess ? "success" : "primary"}
                fullWidth
              >
                {saveSuccess ? "Saved!" : "Save Privacy Settings"}
              </GlassButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
