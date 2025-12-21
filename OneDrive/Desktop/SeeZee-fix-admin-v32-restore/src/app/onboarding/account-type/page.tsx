"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, Briefcase, CheckCircle2, Loader2, Lock } from "lucide-react";

export default function AccountTypePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<"CLIENT" | "WORKER" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Skip this page if user already has a role set
  useEffect(() => {
    if (status === "loading") {
      setIsChecking(true);
      return;
    }

    // If user has a role that's not CLIENT (the default), they've already selected
    if (session?.user?.role && session.user.role !== "CLIENT") {
      // User already has a staff role, redirect to next onboarding step
      router.push("/onboarding/tos");
    } else {
      setIsChecking(false);
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (isChecking || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSelectClient = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType: "CLIENT" }),
      });

      if (response.ok) {
        await update({ accountType: "CLIENT", role: "CLIENT" });
        window.location.href = "/onboarding/tos";
      } else {
        const data = await response.json();
        setError(data.error || "Failed to set account type");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error setting account type:", error);
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  const handleSelectWorker = () => {
    setSelectedType("WORKER");
    setShowCodeInput(true);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6);
      const newCode = [...code];
      for (let i = 0; i < pastedCode.length && index + i < 6; i++) {
        newCode[index + i] = pastedCode[i];
      }
      setCode(newCode);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedCode.length, 5);
      document.getElementById(`code-${nextIndex}`)?.focus();
    } else {
      // Single character
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-advance to next input
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
    setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join("");
    
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect to sign out and back in for fresh JWT
        window.location.href = "/api/auth/signout?callbackUrl=/login?invited=success";
      } else {
        setError(data.message || data.error || "Invalid code");
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        setCode(["", "", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Code verification error:", error);
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  if (showCodeInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Enter Your Code</h1>
              <p className="text-slate-400">
                Enter the 6-digit code from your invitation email
              </p>
            </div>

            {/* Code Input */}
            <div className="flex justify-center gap-2 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
                {error}
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <div className="mt-1 text-xs text-red-400">
                    {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining
                  </div>
                )}
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || code.some((d) => !d)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>

            {/* Back Button */}
            <button
              onClick={() => {
                setShowCodeInput(false);
                setSelectedType(null);
                setCode(["", "", "", "", "", ""]);
                setError(null);
              }}
              disabled={isLoading}
              className="mt-4 w-full text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              ← Back to account selection
            </button>

            {/* Help Text */}
            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Didn't receive a code?</p>
              <p className="mt-1">Contact your team administrator</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">SeeZee</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Choose your account type to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* CLIENT Card */}
          <button
            onClick={handleSelectClient}
            disabled={isLoading}
            className="group relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Client</h3>
              <p className="text-slate-400 mb-4">
                I need web development services for my business
              </p>

              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Request project quotes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Track project progress
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Manage invoices & payments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Direct communication with team
                </li>
              </ul>

              {isLoading && selectedType !== "WORKER" && (
                <div className="mt-4 flex items-center gap-2 text-blue-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Setting up your account...</span>
                </div>
              )}
            </div>
          </button>

          {/* WORKER Card */}
          <button
            onClick={handleSelectWorker}
            disabled={isLoading}
            className="group relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 rounded-2xl transition-all duration-300" />
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                Worker
                <span className="text-xs font-normal px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                  6-Digit Code Required
                </span>
              </h3>
              <p className="text-slate-400 mb-4">
                I have a 6-digit code to join the team
              </p>

              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Access admin dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Manage client projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Collaborate with team
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Assigned role & permissions
                </li>
              </ul>

              <div className="mt-4 text-xs text-slate-500">
                Check your email for the invitation code from your team administrator
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>You can always contact support if you have questions</p>
        </div>
      </div>
    </div>
  );
}
