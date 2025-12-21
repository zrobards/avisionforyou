"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { useToast } from "@/components/ui/Toast";
import LogoHeader from "@/components/brand/LogoHeader";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Get email from session storage or URL
    const storedEmail = sessionStorage.getItem("pendingVerificationEmail");
    const emailParam = searchParams.get("email");
    setEmail(storedEmail || emailParam || "");
  }, [searchParams]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      showToast("No email address found", "error");
      return;
    }

    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend email");
      }

      showToast("Verification email sent!", "success");
      setCooldown(60); // 60 second cooldown
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to resend email";
      showToast(message, "error");
    } finally {
      setResending(false);
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
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <LogoHeader href="" />
          </div>

          {/* Title and Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-bus-red/20 rounded-full flex items-center justify-center mb-4 border border-bus-red/30">
              <FiMail className="w-10 h-10 text-bus-red" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-400">
              We've sent a verification link to
            </p>
            {email && (
              <p className="text-bus-red font-semibold mt-2 break-all">
                {email}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Click the link in the email to verify your account and continue.
            </p>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300 text-center">
                💡 Can't find it? Check your spam or junk folder
              </p>
            </div>

            {/* Resend button */}
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="w-full px-6 py-3 bg-white text-bus-navy font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending
                ? "Sending..."
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Verification Email"}
            </button>

            {/* Change email link */}
            <Link
              href="/register"
              className="block text-sm text-gray-400 hover:text-white transition-colors text-center"
            >
              Wrong email? Create a new account
            </Link>

            {/* Back to login */}
            <div className="pt-4 text-center">
              <Link
                href="/login"
                className="text-sm text-bus-red hover:text-bus-red-light font-semibold transition-colors inline-flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="min-h-screen bg-bus-navy flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bus-red"></div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
