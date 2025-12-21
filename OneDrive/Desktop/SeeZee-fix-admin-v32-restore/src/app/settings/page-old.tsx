"use client";

import { useState, useEffect, Suspense } from "react";
import { Save, CheckCircle, CreditCard, ExternalLink, User, Bell, Lock, Eye, EyeOff, Shield, Key, Trash2, AlertTriangle, Mail, Phone } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

type TabType = "profile" | "notifications" | "billing" | "security" | "privacy";

function SettingsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "profile");
  
  // Check if user is authenticated
  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, router]);

  const userRole = session?.user?.role as string | undefined;
  const isClient = userRole === "CLIENT";
  const isAdmin = userRole === "CEO" || userRole === "CFO" || 
                  ["FRONTEND", "BACKEND", "OUTREACH", "ADMIN"].includes(userRole || "");
  
  // Profile state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(isClient);
  const [systemAlerts, setSystemAlerts] = useState(isAdmin);
  
  // Billing state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  
  // Security state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  
  // Privacy state
  const [emailVisibility, setEmailVisibility] = useState("private");
  const [profileVisibility, setProfileVisibility] = useState("private");
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    // Set active tab from URL parameter
    if (tabParam && ["profile", "notifications", "billing", "security", "privacy"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      // Fetch additional user data
      fetch("/api/client/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setCompany(data.profile.company || "");
            setPhone(data.profile.phone || "");
          }
        })
        .catch((err) => console.error("Failed to fetch profile:", err));
      
      // Fetch notification preferences
      fetch("/api/client/settings/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.emailNotifications !== undefined) {
            setEmailNotifications(data.emailNotifications);
          }
          if (data.projectUpdates !== undefined) {
            setProjectUpdates(data.projectUpdates);
          }
          if (data.invoiceReminders !== undefined) {
            setInvoiceReminders(data.invoiceReminders);
          }
          if (data.systemAlerts !== undefined) {
            setSystemAlerts(data.systemAlerts);
          }
        })
        .catch((err) => console.error("Failed to fetch notification settings:", err));
      
      // Fetch invoices (clients only)
      if (isClient) {
        fetch("/api/client/invoices")
          .then((res) => res.json())
          .then((data) => {
            if (data.invoices) {
              setInvoices(data.invoices);
            }
          })
          .catch((err) => console.error("Failed to fetch invoices:", err));
      }
    }
  }, [session, isClient]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company: isClient ? company : undefined, phone }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setLoadingBilling(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setLoadingBilling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "overdue":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <div className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">Settings</h1>
            <p className="text-gray-400 max-w-2xl">
              Manage your account preferences, notifications, and security settings.
            </p>
          </header>

          {/* Tabs */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="border-b border-white/10">
              <div className="flex gap-6 overflow-x-auto">
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    router.push("/settings?tab=profile");
                  }}
                  className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "profile"
                      ? "border-trinity-red text-trinity-red"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setActiveTab("notifications");
                    router.push("/settings?tab=notifications");
                  }}
                  className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "notifications"
                      ? "border-trinity-red text-trinity-red"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
                {isClient && (
                  <button
                    onClick={() => {
                      setActiveTab("billing");
                      router.push("/settings?tab=billing");
                    }}
                    className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === "billing"
                        ? "border-trinity-red text-trinity-red"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Billing
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveTab("security");
                    router.push("/settings?tab=security");
                  }}
                  className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "security"
                      ? "border-trinity-red text-trinity-red"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Security
                </button>
                <button
                  onClick={() => {
                    setActiveTab("privacy");
                    router.push("/settings?tab=privacy");
                  }}
                  className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "privacy"
                      ? "border-trinity-red text-trinity-red"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Privacy
                </button>
              </div>
            </div>

            <div className="mt-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="bg-gradient-to-r from-trinity-red/10 to-red-600/10 rounded-xl border border-trinity-red/20 p-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-trinity-red to-red-600 flex items-center justify-center text-2xl font-bold text-white">
                        {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{session?.user?.name || "User"}</h3>
                        <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4" />
                          {session?.user?.email}
                        </p>
                        {userRole && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-trinity-red/20 text-trinity-red border border-trinity-red/30 mt-2">
                            {userRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-trinity-red transition-colors"
                      required
                    />
                  </div>

                  {isClient && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-trinity-red transition-colors"
                        placeholder="Your company name (optional)"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-trinity-red transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all font-medium flex items-center gap-2 shadow-lg shadow-trinity-red/20 disabled:opacity-50"
                  >
                    {success ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors group">
                    <div>
                      <p className="text-white font-medium group-hover:text-trinity-red transition-colors">
                        Email Notifications
                      </p>
                      <p className="text-sm text-slate-400">
                        Receive email updates about your account
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-700 bg-gray-800 checked:bg-trinity-red"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors group">
                    <div>
                      <p className="text-white font-medium group-hover:text-trinity-red transition-colors">
                        Project Updates
                      </p>
                      <p className="text-sm text-slate-400">
                        Get notified when project milestones are completed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={projectUpdates}
                      onChange={(e) => setProjectUpdates(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-700 bg-gray-800 checked:bg-trinity-red"
                    />
                  </div>

                  {isClient && (
                    <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors group">
                      <div>
                        <p className="text-white font-medium group-hover:text-trinity-red transition-colors">
                          Invoice Reminders
                        </p>
                        <p className="text-sm text-slate-400">
                          Receive reminders about upcoming payments
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={invoiceReminders}
                        onChange={(e) => setInvoiceReminders(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 checked:bg-trinity-red"
                      />
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors group">
                      <div>
                        <p className="text-white font-medium group-hover:text-trinity-red transition-colors">
                          System Alerts
                        </p>
                        <p className="text-sm text-slate-400">
                          Receive alerts about system issues and updates
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemAlerts}
                        onChange={(e) => setSystemAlerts(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 checked:bg-trinity-red"
                      />
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const body: any = {
                          emailNotifications,
                          projectUpdates,
                        };
                        if (isClient) {
                          body.invoiceReminders = invoiceReminders;
                        }
                        if (isAdmin) {
                          body.systemAlerts = systemAlerts;
                        }
                        const response = await fetch("/api/client/settings/notifications", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(body),
                        });

                        if (response.ok) {
                          setSuccess(true);
                          setTimeout(() => setSuccess(false), 3000);
                        }
                      } catch (error) {
                        console.error("Failed to update notifications:", error);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-2 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-trinity-red/20 disabled:opacity-50"
                  >
                    {success ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Notification Preferences"}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Billing Tab - Clients Only */}
              {activeTab === "billing" && isClient && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between p-6 bg-gradient-to-r from-trinity-red/10 to-red-600/10 rounded-xl border border-trinity-red/20">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        Billing Portal
                      </h3>
                      <p className="text-slate-300 text-sm mb-4">
                        Manage your payment methods, view invoices, and update billing information
                      </p>
                      <button
                        onClick={handleBillingPortal}
                        disabled={loadingBilling}
                        className="px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all font-medium flex items-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        {loadingBilling ? "Opening..." : "Open Billing Portal"}
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <CreditCard className="w-12 h-12 text-trinity-red" />
                  </div>

                  {/* Recent Invoices */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Recent Invoices</h3>
                    {invoices.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">No invoices yet</p>
                    ) : (
                      <div className="space-y-3">
                        {invoices.slice(0, 5).map((invoice) => (
                          <div
                            key={invoice.id}
                            className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors"
                          >
                            <div>
                              <p className="text-white font-medium">{invoice.description}</p>
                              <p className="text-sm text-slate-400">
                                {new Date(invoice.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-white">
                                ${(Number(invoice.total) / 100).toFixed(2)}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  invoice.status
                                )}`}
                              >
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 p-6">
                    <div className="flex items-start gap-4">
                      <Shield className="w-6 h-6 text-amber-400 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Account Security</h3>
                        <p className="text-slate-300 text-sm">
                          Keep your account secure by using a strong password and enabling two-factor authentication.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-trinity-red/50 transition-colors"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-trinity-red/50 transition-colors"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-trinity-red transition-colors"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if (newPassword !== confirmPassword) {
                            alert("Passwords do not match");
                            return;
                          }
                          if (newPassword.length < 8) {
                            alert("Password must be at least 8 characters");
                            return;
                          }
                          setLoading(true);
                          try {
                            // Implement password change API call
                            alert("Password change functionality coming soon");
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                          } catch (error) {
                            console.error("Failed to change password:", error);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                        className="w-full px-6 py-2 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-trinity-red/20 disabled:opacity-50"
                      >
                        <Key className="w-4 h-4" />
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Two-Factor Authentication</h3>
                        <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${twoFactorEnabled ? "text-emerald-400" : "text-slate-400"}`}>
                          {twoFactorEnabled ? "Enabled" : "Disabled"}
                        </span>
                        <button
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            twoFactorEnabled ? "bg-trinity-red" : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              twoFactorEnabled ? "translate-x-6" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    {twoFactorEnabled && (
                      <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-sm text-emerald-300">
                          Two-factor authentication setup coming soon. This will require a mobile authenticator app.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Current Session</p>
                            <p className="text-sm text-slate-400">This device • {new Date().toLocaleDateString()}</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
                            Active
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">
                        Session management coming soon. You'll be able to see and manage all active sessions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6">
                    <div className="flex items-start gap-4">
                      <Shield className="w-6 h-6 text-purple-400 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Privacy Settings</h3>
                        <p className="text-slate-300 text-sm">
                          Control how your information is shared and who can see your profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Visibility */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Profile Visibility</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors cursor-pointer group">
                        <div>
                          <p className="text-white font-medium group-hover:text-trinity-red transition-colors">Email Address</p>
                          <p className="text-sm text-slate-400">Who can see your email address</p>
                        </div>
                        <select
                          value={emailVisibility}
                          onChange={(e) => setEmailVisibility(e.target.value)}
                          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-trinity-red"
                        >
                          <option value="private">Private</option>
                          <option value="team">Team Only</option>
                          <option value="public">Public</option>
                        </select>
                      </label>

                      <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors cursor-pointer group">
                        <div>
                          <p className="text-white font-medium group-hover:text-trinity-red transition-colors">Profile Information</p>
                          <p className="text-sm text-slate-400">Control profile visibility</p>
                        </div>
                        <select
                          value={profileVisibility}
                          onChange={(e) => setProfileVisibility(e.target.value)}
                          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-trinity-red"
                        >
                          <option value="private">Private</option>
                          <option value="team">Team Only</option>
                          <option value="public">Public</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Data & Analytics */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Data & Analytics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors group">
                        <div>
                          <p className="text-white font-medium group-hover:text-trinity-red transition-colors">Data Sharing</p>
                          <p className="text-sm text-slate-400">Allow sharing of anonymized data for product improvement</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={dataSharing}
                          onChange={(e) => setDataSharing(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-700 bg-gray-800 checked:bg-trinity-red"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5 hover:border-trinity-red/30 transition-colors group">
                        <div>
                          <p className="text-white font-medium group-hover:text-trinity-red transition-colors">Analytics</p>
                          <p className="text-sm text-slate-400">Help us improve by sharing usage analytics</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={analytics}
                          onChange={(e) => setAnalytics(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-700 bg-gray-800 checked:bg-trinity-red"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2">Delete Account</h3>
                          <p className="text-slate-300 text-sm mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                alert("Account deletion functionality coming soon");
                              }
                            }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // Implement privacy settings save API call
                        setSuccess(true);
                        setTimeout(() => setSuccess(false), 3000);
                      } catch (error) {
                        console.error("Failed to save privacy settings:", error);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-2 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-trinity-red/20 disabled:opacity-50"
                  >
                    {success ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Privacy Settings"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
      <SettingsContent />
    </Suspense>
  );
}
