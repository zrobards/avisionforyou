"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiCheck, FiX, FiLoader, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import LogoHeader from "@/components/brand/LogoHeader";

export default function VerifyEmailTokenPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("/login");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = params.token as string;
        
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setRedirectUrl(data.redirectUrl || "/login");
          
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push(data.redirectUrl || "/login");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    if (params.token) {
      verifyEmail();
    }
  }, [params.token, router]);

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

          {/* Status Display */}
          <div className="text-center">
            {status === "verifying" && (
              <>
                <div className="mx-auto w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                  <FiLoader className="w-10 h-10 text-blue-400 animate-spin" />
                </div>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">
                  Verifying Your Email
                </h1>
                <p className="text-gray-400">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                  <FiCheck className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">
                  Email Verified!
                </h1>
                <p className="text-gray-400 mb-6">
                  {message}
                </p>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm mb-6">
                  Redirecting you to log in...
                </div>
                <Link
                  href={redirectUrl}
                  className="inline-block px-6 py-3 bg-white text-bus-navy font-semibold rounded-lg hover:bg-gray-100 transition-all"
                >
                  Continue to Login
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                  <FiX className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">
                  Verification Failed
                </h1>
                <p className="text-red-400 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Link
                    href="/verify-email"
                    className="block w-full px-6 py-3 bg-white text-bus-navy font-semibold rounded-lg hover:bg-gray-100 transition-all"
                  >
                    Request New Verification Email
                  </Link>
                  <Link
                    href="/login"
                    className="block text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

