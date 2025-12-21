"use client";

export const dynamic = 'force-dynamic';

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { EmailPasswordSignUpForm } from "@/components/auth/EmailPasswordSignUpForm";
import LogoHeader from "@/components/brand/LogoHeader";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showStaffCode, setShowStaffCode] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const handleGoogleSignUp = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      // Note: reCAPTCHA integration can be added when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is configured
      await signIn("google", { callbackUrl: "/onboarding/account-type" });
    } catch (err: any) {
      console.error("Sign up exception:", err);
      setError("Failed to initiate sign up. Please try again.");
      setIsLoading(false);
    }
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
    setError("");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  // Client signup form view
  if (showClientForm) {
    return (
      <div className="min-h-screen bg-bus-navy relative overflow-hidden">
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

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold text-white mb-2">
                Create Client Account
              </h1>
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-bus-red hover:text-bus-red-light font-semibold transition-colors">
                  Log in
                </Link>
              </p>
            </div>

            {/* Back button */}
            <button
              onClick={() => setShowClientForm(false)}
              className="mb-6 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to account selection
            </button>

            {/* Social Login Button */}
            <div className="mb-6">
              <button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
              >
                <FcGoogle className="w-5 h-5" />
                Sign up with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-bus-navy text-gray-500">or</span>
              </div>
            </div>

            {/* Email/Password Signup Form */}
            <EmailPasswordSignUpForm />

            {/* Terms and Privacy */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing up, you agree to our{" "}
                <Link href="/legal/terms-of-service" className="underline hover:text-gray-400">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy-policy" className="underline hover:text-gray-400">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Staff code entry view
  if (showStaffCode) {
    return (
      <div className="min-h-screen bg-bus-navy relative overflow-hidden">
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

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold text-white mb-2">
                Staff Invitation Code
              </h1>
              <p className="text-gray-400">
                Enter the 6-digit code from your invitation email
              </p>
            </div>

            {/* Back button */}
            <button
              onClick={() => {
                setShowStaffCode(false);
                setCode(["", "", "", "", "", ""]);
                setError("");
              }}
              disabled={isLoading}
              className="mb-6 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to account selection
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="mb-6">
              <div className="flex justify-center gap-2">
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
                    className="w-12 h-14 text-center text-2xl font-bold bg-bus-navy-light border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bus-red focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                The code was sent to your email by your team administrator
              </p>
            </div>

            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading || code.some((d) => !d)}
              className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <FcGoogle className="w-5 h-5" />
              {isLoading ? "Signing up..." : "Continue with Google"}
            </button>

            {/* Terms and Privacy */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing up, you agree to our{" "}
                <Link href="/legal/terms-of-service" className="underline hover:text-gray-400">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy-policy" className="underline hover:text-gray-400">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
          className="w-full max-w-2xl"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <LogoHeader href="" />
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold text-white mb-3">
              Create Your Account
            </h1>
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-bus-red hover:text-bus-red-light font-semibold transition-colors">
                Log in
              </Link>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Registration */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowClientForm(true)}
              disabled={isLoading}
              className="group bg-bus-navy-light/50 rounded-xl p-8 border border-gray-800 hover:border-bus-red/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Client</h2>
                <p className="text-gray-400 text-sm">
                  I need web development services
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Request quotes for projects</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track project progress</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access client portal</span>
                </li>
              </ul>

              <div className="text-blue-400 group-hover:text-blue-300 font-semibold flex items-center gap-2">
                Sign up as client
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Staff Registration */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStaffCode(true)}
              disabled={isLoading}
              className="group bg-bus-navy-light/50 rounded-xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/20">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Staff</h2>
                <p className="text-gray-400 text-sm">
                  I'm joining the SeeZee team
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access admin dashboard</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Manage projects and clients</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Collaborate with team</span>
                </li>
              </ul>

              <div className="text-purple-400 group-hover:text-purple-300 font-semibold flex items-center gap-2">
                Enter invitation code
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing up, you agree to our{" "}
              <Link href="/legal/terms-of-service" className="underline hover:text-gray-400">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy-policy" className="underline hover:text-gray-400">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
