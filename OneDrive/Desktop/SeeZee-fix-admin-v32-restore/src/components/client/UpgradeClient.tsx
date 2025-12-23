"use client";

import { useState } from "react";
import { useDialogContext } from "@/lib/dialog";
import { motion } from "framer-motion";
import {
  Check,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  CreditCard,
} from "lucide-react";
import { SubscriptionPlan } from "@/lib/subscriptionPlans";
import Link from "next/link";

interface CurrentSubscription {
  id: string;
  projectId: string;
  projectName: string;
  planName: string;
  priceId: string | null;
}

interface UpgradeClientProps {
  plans: SubscriptionPlan[];
  currentSubscriptions: CurrentSubscription[];
}

export function UpgradeClient({ plans, currentSubscriptions }: UpgradeClientProps) {
  const dialog = useDialogContext();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  // Filter plans by billing cycle
  const filteredPlans = plans.filter((plan) => plan.billingCycle === billingCycle);

  // Get projects that could have subscriptions
  const projects = Array.from(
    new Set(currentSubscriptions.map((sub) => sub.projectName))
  );

  const handleUpgrade = async () => {
    if (!selectedPlan || !selectedProject) return;

    // Check if there's an existing subscription for this project
    const existingSubscription = currentSubscriptions.find(
      (sub) => sub.projectId === selectedProject
    );

    // If there's an existing subscription, ask if they want to switch
    if (existingSubscription) {
      const confirmMessage = `You currently have an active subscription (${existingSubscription.planName}) for this project. Switching to ${selectedPlan.displayName} will cancel your current subscription and start a new one. You'll be charged the prorated amount for the new plan. Continue?`;

      const confirmed = await dialog.confirm(confirmMessage, {
        title: "Switch Subscription",
        variant: "warning",
        confirmText: "Yes, Switch",
        cancelText: "Cancel",
      });

      if (!confirmed) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/client/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          projectId: selectedProject,
          priceId: selectedPlan.stripePriceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      await dialog.alert(error instanceof Error ? error.message : "Failed to start upgrade process", {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return currentSubscriptions.some(
      (sub) => sub.planName === plan.name
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Upgrade Your Plan</h1>
              <p className="text-gray-400">
                Choose a subscription plan that fits your needs
              </p>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-4 mt-6">
            <span className="text-sm text-gray-400">Billing Cycle:</span>
            <div className="flex items-center gap-2 bg-gray-900/50 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-cyan-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "annual"
                    ? "bg-cyan-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                  Save 15%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredPlans.map((plan) => {
            const isCurrent = isCurrentPlan(plan);
            const isSelected = selectedPlan?.id === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 transition-all cursor-pointer ${
                  isSelected
                    ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                    : "border-white/10 hover:border-white/20"
                } ${plan.popular ? "ring-2 ring-cyan-500/30" : ""}`}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.displayName}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${(plan.price / 100).toFixed(0)}
                    </span>
                    <span className="text-gray-400">
                      /{plan.billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {plan.billingCycle === "annual" && (
                    <p className="text-xs text-gray-500 mt-1">
                      ${((plan.price / 100) / 12).toFixed(2)}/month billed annually
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                  >
                    <p className="text-xs text-cyan-400 text-center">
                      Selected for upgrade
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Project Selection & Upgrade Button */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Select Project for Upgrade
            </h3>

            {projects.length > 0 ? (
              <div className="space-y-3 mb-6">
                {projects.map((projectName) => {
                  const projectSub = currentSubscriptions.find(
                    (sub) => sub.projectName === projectName
                  );
                  return (
                    <button
                      key={projectName}
                      onClick={() =>
                        setSelectedProject(projectSub?.projectId || null)
                      }
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedProject === projectSub?.projectId
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{projectName}</p>
                          {projectSub && (
                            <p className="text-xs text-gray-400 mt-1">
                              Current: {projectSub.planName}
                            </p>
                          )}
                        </div>
                        {selectedProject === projectSub?.projectId && (
                          <Check className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  No projects found. You need to have a project to upgrade a subscription.
                </p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={handleUpgrade}
                disabled={!selectedProject || isLoading || isCurrentPlan(selectedPlan)}
                className={`flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Upgrade to {selectedPlan.displayName}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <Link
                href="/client/subscriptions"
                className="py-3 px-6 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </Link>
            </div>

            {isCurrentPlan(selectedPlan) && (
              <p className="text-xs text-yellow-400 mt-3 text-center">
                This is already your current plan. Please select a different plan to upgrade.
              </p>
            )}
          </motion.div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-white font-semibold mb-2">About Upgrades</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>
                  • Upgrades take effect immediately and are prorated for the current billing period
                </li>
                <li>
                  • You can upgrade or downgrade your plan at any time
                </li>
                <li>
                  • Annual plans save you 15% compared to monthly billing
                </li>
                <li>
                  • All plans include managed hosting, SSL certificates, and security updates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

