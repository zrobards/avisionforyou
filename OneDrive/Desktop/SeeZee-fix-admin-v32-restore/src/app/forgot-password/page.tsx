"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import LogoHeader from "@/components/brand/LogoHeader";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bus-navy relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-bus-navy via-bus-navy-light to-bus-navy"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-bus-red rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-bus-red rounded-full blur-3xl"></div>
      </div>

      {/* Back to Home button */}
      <div className="absolute top-8 left-8 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium px-2 py-1 rounded-md hover:bg-gray-800/50"
        >
          <FiArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {!success ? (
            <>
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <LogoHeader href="" />
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-white mb-2">
                  Reset Your Password
                </h1>
                <p className="text-gray-400">
                  Enter your email and we'll send you a reset code
                </p>
              </div>

              {/* Back to Login Link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alan.turing@example.com"
                    required
                    className="w-full px-4 py-3 bg-bus-navy-light border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bus-red focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 bg-white text-bus-navy font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </button>
              </form>

              {/* Help Text */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Need help?{" "}
                <a href="mailto:support@see-zee.com" className="text-bus-red hover:text-bus-red-light transition-colors">
                  Contact support
                </a>
              </p>
            </>
          ) : (
            <>
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <LogoHeader href="" />
              </div>

              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-400 mb-6">
                  We've sent a 6-digit reset code to <strong className="text-white">{email}</strong>
                </p>
                <div className="p-4 bg-bus-red/10 border border-bus-red/30 rounded-lg text-gray-300 text-sm mb-6">
                  Redirecting you to enter the code...
                </div>
                <Link
                  href={`/reset-password?email=${encodeURIComponent(email)}`}
                  className="text-bus-red hover:text-bus-red-light text-sm transition-colors"
                >
                  Click here if not redirected
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}




