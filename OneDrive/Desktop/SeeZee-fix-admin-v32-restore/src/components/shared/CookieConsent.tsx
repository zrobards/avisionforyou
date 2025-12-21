"use client";

import { useState, useEffect } from "react";
import { Cookie, X, Settings, Shield, BarChart3, Megaphone, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consentedAt: string | null;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: true,
  marketing: false,
  preferences: true,
  consentedAt: null,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if consent already given
    const consent = localStorage.getItem("seezee_cookie_consent");
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setPreferences(parsed);
        applyConsent(parsed);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const applyConsent = (prefs: CookiePreferences) => {
    // Apply tracking based on consent
    if (typeof window !== "undefined") {
      // Google Analytics consent
      if ((window as any).gtag) {
        (window as any).gtag("consent", "update", {
          analytics_storage: prefs.analytics ? "granted" : "denied",
          ad_storage: prefs.marketing ? "granted" : "denied",
          functionality_storage: prefs.preferences ? "granted" : "denied",
          personalization_storage: prefs.preferences ? "granted" : "denied",
        });
      }
    }
  };

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      consentedAt: new Date().toISOString(),
    };
    localStorage.setItem("seezee_cookie_consent", JSON.stringify(consentData));
    applyConsent(prefs);
    setPreferences(consentData);
    setShowBanner(false);
    setShowCustomize(false);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
      consentedAt: new Date().toISOString(),
    });
  };

  const rejectNonEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
      consentedAt: new Date().toISOString(),
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && !showCustomize && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon & Text */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <Cookie className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        🍪 Cookie Preferences
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        We use cookies to enhance your experience. Essential cookies are required for 
                        site functionality. You can customize your preferences or accept all cookies.
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 md:flex-shrink-0">
                    <button
                      onClick={() => setShowCustomize(true)}
                      className="px-4 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </button>
                    <button
                      onClick={rejectNonEssential}
                      className="px-4 py-2.5 border border-white/20 text-slate-300 rounded-xl hover:bg-white/5 transition-all text-sm font-medium"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={acceptAll}
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all text-sm font-semibold shadow-lg shadow-cyan-500/25"
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customize Modal */}
      <AnimatePresence>
        {showCustomize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCustomize(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Cookie className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Cookie Preferences</h2>
                </div>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-180px)]">
                {/* Essential */}
                <CookieCategory
                  icon={<Shield className="w-5 h-5" />}
                  title="Essential Cookies"
                  description="Required for the website to function properly. Includes login sessions, security features, and form submissions."
                  enabled={true}
                  locked={true}
                  onChange={() => {}}
                />

                {/* Analytics */}
                <CookieCategory
                  icon={<BarChart3 className="w-5 h-5" />}
                  title="Analytics Cookies"
                  description="Help us understand how visitors use our site. Google Analytics, page views, and user journeys."
                  enabled={preferences.analytics}
                  locked={false}
                  onChange={(val) => setPreferences({ ...preferences, analytics: val })}
                />

                {/* Marketing */}
                <CookieCategory
                  icon={<Megaphone className="w-5 h-5" />}
                  title="Marketing Cookies"
                  description="Used for targeted advertising and retargeting. Facebook Pixel, Google Ads, and similar services."
                  enabled={preferences.marketing}
                  locked={false}
                  onChange={(val) => setPreferences({ ...preferences, marketing: val })}
                />

                {/* Preferences */}
                <CookieCategory
                  icon={<Palette className="w-5 h-5" />}
                  title="Preference Cookies"
                  description="Remember your settings and preferences. Theme selection, language, and personalization."
                  enabled={preferences.preferences}
                  locked={false}
                  onChange={(val) => setPreferences({ ...preferences, preferences: val })}
                />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 bg-slate-950/50">
                <button
                  onClick={rejectNonEssential}
                  className="flex-1 px-4 py-2.5 border border-white/20 text-slate-300 rounded-xl hover:bg-white/5 transition-all text-sm font-medium"
                >
                  Reject All
                </button>
                <button
                  onClick={savePreferences}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all text-sm font-semibold shadow-lg shadow-cyan-500/25"
                >
                  Save Preferences
                </button>
              </div>

              {/* Privacy Link */}
              <div className="px-6 pb-6 text-center">
                <a
                  href="/legal/privacy"
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  🔒 Read our Privacy Policy
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Cookie Category Component
interface CookieCategoryProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  locked: boolean;
  onChange: (value: boolean) => void;
}

function CookieCategory({
  icon,
  title,
  description,
  enabled,
  locked,
  onChange,
}: CookieCategoryProps) {
  return (
    <div className="p-4 bg-slate-800/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          enabled 
            ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30" 
            : "bg-slate-700/50 text-slate-500 border border-white/10"
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-1">
            <h3 className="text-white font-medium">{title}</h3>
            {locked ? (
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                Always On
              </span>
            ) : (
              <button
                onClick={() => onChange(!enabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  enabled ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                    enabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
            )}
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Export a button component for opening preferences from settings page
export function CookiePreferencesButton() {
  const openPreferences = () => {
    // Dispatch a custom event to open the cookie preferences
    window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
  };

  return (
    <button
      onClick={openPreferences}
      className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2"
    >
      <Cookie className="w-4 h-4" />
      Manage Cookie Preferences
    </button>
  );
}

