"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, ArrowRight, Shield, Zap, Users } from "lucide-react";
import { EmailPasswordSignUpForm } from "@/components/auth/EmailPasswordSignUpForm";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    // Redirect to onboarding/tos - middleware will handle if already complete
    await signIn("google", { callbackUrl: "/onboarding/tos" });
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Get your project delivered quickly with our streamlined process",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Team",
      description: "Work with experienced developers and designers",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Join thousands of satisfied clients
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Start Building Your
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Dream Website</span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                Get professional web development services delivered fast. Trusted by businesses worldwide.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`p-6 bg-white/5 backdrop-blur-lg rounded-xl border transition-all duration-300 ${
                    hoveredFeature === index
                      ? "border-cyan-500/50 bg-white/10 scale-105"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 transition-transform ${
                      hoveredFeature === index ? "scale-110" : ""
                    }`}>
                      <div className="text-cyan-400">{feature.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-slate-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white/20"
                  />
                ))}
              </div>
              <div>
                <p className="text-white font-semibold">500+ Active Projects</p>
                <p className="text-slate-400 text-sm">Trusted by businesses worldwide</p>
              </div>
            </div>
          </div>

          {/* Right side - Sign up form */}
          <div className="w-full">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              {/* Mobile header */}
              <div className="lg:hidden text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Create Your Account</h1>
                <p className="text-slate-300">Join SeeZee and start building today</p>
              </div>

              {/* Desktop header */}
              <div className="hidden lg:block text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Get Started Free</h2>
                <p className="text-slate-400">Create your account in seconds</p>
              </div>

              {/* Toggle buttons */}
              <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-lg">
                <button
                  onClick={() => setShowEmailForm(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    !showEmailForm
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Quick Sign Up
                </button>
                <button
                  onClick={() => setShowEmailForm(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    showEmailForm
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Email & Password
                </button>
              </div>

              {!showEmailForm ? (
                <>
                  {/* Google Sign Up Button */}
                  <button
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-gray-50 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-900">Creating account...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span className="text-gray-900">Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/5 text-slate-400">Or choose account type</span>
                    </div>
                  </div>

                  {/* Account type selection */}
                  <div className="space-y-3">
                    <Link
                      href="/register/client"
                      className="block p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-500/40 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                            <Users className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Sign up as Client</p>
                            <p className="text-slate-400 text-sm">Get web development services</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </>
              ) : (
                <EmailPasswordSignUpForm />
              )}

              {/* Benefits list */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Free consultation included</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* Login link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-slate-500 mt-6">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-slate-400 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-slate-400 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}