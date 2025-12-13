"use client";

export const dynamic = 'force-dynamic';

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import LogoHeader from "@/components/brand/LogoHeader";

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  // Support both returnUrl (from middleware) and callbackUrl (from NextAuth)
  const callbackUrl = searchParams.get("returnUrl") || searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  // Set error from URL parameter
  useEffect(() => {
    if (errorParam) {
      console.log("🔴 Login error detected:", errorParam);
      setError(
        errorParam === "OAuthAccountNotLinked"
          ? "Unable to link your Google account. If you have an existing account with this email, please try signing in again or contact support."
          : errorParam === "Configuration"
          ? "Authentication configuration error. Please check /auth-check for details."
          : errorParam === "AccessDenied"
          ? "Access denied. Please try again or contact support."
          : errorParam === "unexpected"
          ? "An unexpected error occurred. Please try again."
          : `Error: ${errorParam}. Please try again or contact support.`
      );
    }
  }, [errorParam]);

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err: any) {
      console.error("Sign in exception:", err);
      setError("Failed to initiate login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <LogoHeader href="" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">Sign in to access your dashboard</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-large">
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ color: '#111827' }}
            >
              <FcGoogle className="w-6 h-6" />
              <span style={{ color: '#111827' }}>
                {isLoading ? "Signing in..." : "Continue with Google"}
              </span>
              {!isLoading && <FiArrowRight className="w-5 h-5" style={{ color: '#111827' }} />}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              Sign in with your Google account to access your dashboard
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
