"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import LogoHeader from "@/components/brand/LogoHeader";

export default function SetPasswordPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set password");
      }

      setSuccess(true);
      
      // Update session to clear needsPassword flag
      await updateSession({ needsPassword: false });
      
      // Redirect after session update
      // For new users setting password, redirect to /start to create their first project
      // The /client page will also redirect to /start if no projects exist (safety net)
      setTimeout(() => {
        const role = session?.user?.role;
        if (role === "CEO" || role === "ADMIN" || role === "STAFF") {
          window.location.href = "/admin";
        } else {
          // For client users, redirect to /start to create first project
          // If they already have projects, /start will detect and redirect to /client
          window.location.href = "/start";
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bus-navy">
        <Loader2 className="h-8 w-8 animate-spin text-bus-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bus-navy relative overflow-hidden px-4 py-8">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-bus-navy via-bus-navy-light to-bus-navy"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-bus-red rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-bus-red rounded-full blur-3xl"></div>
      </div>

      {/* Back to Home button */}
      <div className="absolute top-8 left-8 z-10">
        <Link 
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          <FiArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <LogoHeader href="" />
          </div>

          {/* Main Card */}
          <div className="bg-bus-navy-light/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 shadow-2xl">
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-bus-red/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-bus-red/30">
                  <Shield className="h-8 w-8 text-bus-red" />
                </div>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">
                  Set Your Password
                </h1>
                <p className="text-gray-400">
                  For security, please set a password for your account
                </p>
              </div>

              {/* Info Notice */}
              <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Why do I need this?</strong><br />
                  You signed in with Google OAuth. Setting a password allows you to sign in with email/password
                  and provides an additional security layer for your account.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 bg-bus-navy-light border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bus-red focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Minimum 8 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 bg-bus-navy-light border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bus-red focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full py-3 bg-bus-red hover:bg-bus-red-light text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Set Password
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-700/50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Password Set Successfully!
                </h2>
                <p className="text-gray-400 mb-6">
                  Your account now has password protection. You can sign in with either Google or your email and password.
                </p>
                <div className="p-4 bg-emerald-900/30 border border-emerald-700/50 rounded-lg text-emerald-300 text-sm mb-6">
                  Redirecting you to your dashboard...
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        {!success && (
          <p className="text-center text-sm text-gray-400 mt-6">
            Need help?{" "}
            <a href="mailto:support@see-zee.com" className="text-bus-red hover:text-bus-red-light transition-colors">
              Contact support
            </a>
          </p>
        )}
        </div>
      </div>
    </div>
  );
}

