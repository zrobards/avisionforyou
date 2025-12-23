"use client";

export const dynamic = 'force-dynamic';

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";
import LogoHeader from "@/components/brand/LogoHeader";

function LoginContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const { executeRecaptcha } = useGoogleReCaptcha();
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
    
    // Handle success message from email verification
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setError(""); // Clear any errors
      // Show success message (you might want to use a toast here instead)
      console.log("✅ Email verified successfully!");
    }
  }, [errorParam, searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Get reCAPTCHA token
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA not ready");
      }
      const recaptchaToken = await executeRecaptcha("login");

      const result = await signIn("credentials", {
        email,
        password,
        recaptchaToken,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setError("Please verify your email before logging in. Check your inbox for the verification link.");
          // Optionally redirect to verification page
          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          }, 2000);
        } else if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(result.error);
        }
        setIsLoading(false);
      } else {
        // Success - track session creation
        try {
          await fetch('/api/settings/sessions/track', {
            method: 'POST',
          });
        } catch (trackError) {
          // Silently fail session tracking - not critical
          console.error("Failed to track session:", trackError);
        }

        // CRITICAL: Force session refresh to ensure token has latest DB data
        // This prevents redirect loops when user has completed onboarding but token is stale
        try {
          // Wait a moment for NextAuth to finish creating the session
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Fetch fresh user data from database (bypasses token cache)
          const userResponse = await fetch('/api/user/me', {
            cache: 'no-store',
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Determine redirect based on onboarding status from DB
            let redirectUrl = callbackUrl;
            
            if (callbackUrl === '/') {
              // Check if onboarding is complete (using DB data, not token)
              if (userData.tosAcceptedAt && userData.profileDoneAt) {
                // Onboarding complete - go to dashboard
                redirectUrl = userData.role === 'CEO' || userData.role === 'ADMIN' ? '/admin' : '/client';
              } else if (!userData.tosAcceptedAt) {
                // Need to accept ToS
                redirectUrl = '/onboarding/tos';
              } else {
                // Need to complete profile
                redirectUrl = '/onboarding/profile';
              }
            }
            
            // Use window.location.href for full page reload to ensure fresh session
            window.location.href = redirectUrl;
          } else {
            // Fallback if user data fetch fails
            window.location.href = callbackUrl === '/' ? '/onboarding/tos' : callbackUrl;
          }
        } catch (fetchError) {
          console.error("Error fetching user data:", fetchError);
          // Fallback redirect
          window.location.href = callbackUrl === '/' ? '/onboarding/tos' : callbackUrl;
        }
      }
    } catch (err: any) {
      console.error("Sign in exception:", err);
      setError(err.message || "Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      // For OAuth, redirect to onboarding/tos as default
      // Middleware will handle redirects if already completed
      const oauthCallback = callbackUrl === '/' ? '/onboarding/tos' : callbackUrl;
      await signIn("google", { callbackUrl: oauthCallback });
    } catch (err: any) {
      console.error("Sign in exception:", err);
      setError("Failed to initiate login. Please try again.");
      setIsLoading(false);
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

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-white mb-2">
              Log in to SeeZee
            </h1>
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-bus-red hover:text-bus-red-light font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <FcGoogle className="w-5 h-5" />
              Login with Google
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

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bus-navy-light border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bus-red focus:border-transparent transition-all"
                placeholder="alan.turing@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-bus-navy-light border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bus-red focus:border-transparent transition-all pr-12"
                  placeholder="••••••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-white text-bus-navy rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Terms and Privacy */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
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

function LoginPageWithProvider() {
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

export default function LoginPage() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  if (!recaptchaSiteKey) {
    console.warn("⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured");
    return <LoginPageWithProvider />;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <LoginPageWithProvider />
    </GoogleReCaptchaProvider>
  );
}
