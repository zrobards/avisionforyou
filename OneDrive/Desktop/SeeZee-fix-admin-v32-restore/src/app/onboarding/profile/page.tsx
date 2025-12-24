"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { SkillsSelector } from "@/components/profile/SkillsSelector";
import { OAuthConnectionCard } from "@/components/profile/OAuthConnectionCard";
import { formatPhoneNumber } from "@/lib/phone-format";

export default function OnboardingProfilePage() {
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns!
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [oauthRefresh, setOauthRefresh] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    company: "",
    bio: "",
    location: "",
    website: "",
    skills: [] as string[],
    jobTitle: "",
    portfolioUrl: "",
  });

  // Check if user hasn't accepted TOS yet - send them back
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'onboarding/profile/page.tsx:55',message:'TOS check useEffect',data:{status:status,hasTosAccepted:!!session?.user?.tosAcceptedAt},sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    
    // Don't redirect while session is still loading
    if (status === "loading") {
      return;
    }
    
    if (status === "authenticated" && !session?.user?.tosAcceptedAt) {
      router.push("/onboarding/tos");
    }
  }, [status, session, router]);

  // Check if profile is already complete - redirect to dashboard
  // Also check DB directly if token seems stale to prevent crashes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'onboarding/profile/page.tsx:73',message:'Profile done check useEffect',data:{status:status,hasProfileDone:!!session?.user?.profileDoneAt},sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    
    // Don't redirect while session is still loading
    if (status === "loading") {
      return;
    }
    
    if (status === "authenticated" && session?.user?.id) {
      // Check token first
      if (session?.user?.profileDoneAt) {
        const dashboardUrl = session.user.role === 'CEO' || session.user.role === 'ADMIN' ? '/admin' : '/client';
        // Only redirect if we're not already on the target page
        if (typeof window !== "undefined" && !window.location.pathname.startsWith(dashboardUrl)) {
          router.push(dashboardUrl);
        }
      } else {
        // Token doesn't show profile done, but check DB to be sure (handles stale token case)
        // This prevents crashes when user completed onboarding but token is stale
        fetch('/api/user/me', { cache: 'no-store' })
          .then(res => res.json())
          .then(userData => {
            if (userData.profileDoneAt) {
              // DB says profile is done but token doesn't - token is stale, force refresh
              update().then(() => {
                // After update, redirect to dashboard
                const dashboardUrl = userData.role === 'CEO' || userData.role === 'ADMIN' ? '/admin' : '/client';
                if (!window.location.pathname.startsWith(dashboardUrl)) {
                  router.push(dashboardUrl);
                }
              }).catch(err => {
                console.error("Failed to update session:", err);
                // Fallback: redirect anyway based on DB data
                const dashboardUrl = userData.role === 'CEO' || userData.role === 'ADMIN' ? '/admin' : '/client';
                window.location.href = dashboardUrl;
              });
            }
          })
          .catch(err => {
            console.error("Failed to check user data:", err);
            // If check fails, continue with normal flow
          });
      }
    }
  }, [status, session, router, update]);

  // Now we can do conditional rendering AFTER all hooks
  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (status === "unauthenticated" || !session?.user?.id) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'onboarding/profile/page.tsx:46',message:'Not authenticated in profile',data:{status:status,session:session},sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    if (typeof window !== "undefined") {
      window.location.href = "/login?returnUrl=/onboarding/profile";
    }
    return null;
  }

  if (status === "authenticated" && !session?.user?.tosAcceptedAt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirecting to terms...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.profileDoneAt) {
    const dashboardUrl = session.user.role === 'CEO' || session.user.role === 'ADMIN' ? '/admin' : '/client';
    // Only show loading if we're not already on the target page
    if (typeof window !== "undefined" && !window.location.pathname.startsWith(dashboardUrl)) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Redirecting to dashboard...</p>
          </div>
        </div>
      );
    }
  }

  const isClient = (session?.user as any)?.role === "CLIENT";
  const isDesignerOrAdmin = ["DESIGNER", "ADMIN"].includes((session?.user as any)?.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileData = {
        ...formData,
        profileImageUrl: profileImage || undefined,
      };

      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'onboarding/profile/page.tsx:168',message:'Profile completed - updating session',data:{userId:session?.user?.id,email:session?.user?.email,isClient},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Update session with new data - this triggers JWT callback refresh
        await update({
          profileDoneAt: new Date().toISOString(),
          name: formData.name,
        });
        
        // CRITICAL FIX: Wait for JWT callback to complete and verify token refresh
        // The JWT callback fetches fresh data from DB, but needs time to complete
        // Verify the session has updated before redirecting to prevent redirect loops
        let retries = 0;
        const maxRetries = 5;
        let tokenRefreshed = false;
        
        while (retries < maxRetries && !tokenRefreshed) {
          // Wait a bit for JWT callback to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Fetch fresh session to verify token was updated
          const sessionResponse = await fetch('/api/auth/session', { 
            cache: 'no-store',
            credentials: 'include' 
          });
          
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            // Check if token shows profile done (either as "1" or truthy value)
            if (sessionData?.user?.profileDoneAt || sessionData?.user?.profileDone) {
              tokenRefreshed = true;
              break;
            }
          }
          
          retries++;
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'onboarding/profile/page.tsx:178',message:'Profile completed - session updated, redirecting',data:{targetUrl:isClient ? "/client" : "/admin",tokenRefreshed,retries},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // CRITICAL: Use hard redirect to force full page reload and fresh token
        // This ensures middleware sees the updated token with profileDone=true
        // Client-side navigation (router.push) can cause stale token issues
        const targetUrl = isClient ? "/client" : "/admin";
        window.location.href = targetUrl;
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Format phone number as user types
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-purple-500/20 backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Step 2 of 2
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Complete your profile
          </h1>
          <p className="text-slate-400 text-lg">Tell us a bit more about yourself</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-200 mb-3">
                Profile Picture
              </label>
              <ImageUpload
                currentImage={profileImage}
                onImageChange={setProfileImage}
              />
            </div>
            <div className="group">
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2 group-hover:text-white transition-colors">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/10 group-hover:border-white/20"
                placeholder="John Doe"
              />
            </div>

            <div className="group">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2 group-hover:text-white transition-colors">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone number
                <span className="text-xs text-slate-500">(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:bg-white/10 group-hover:border-white/20"
                placeholder="(555) 000-0000"
              />
            </div>

            {/* Bio */}
            <div className="group">
              <label htmlFor="bio" className="block text-sm font-medium text-slate-200 mb-2">
                Bio
                <span className="text-xs text-slate-500 ml-2">(optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                maxLength={200}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/10 group-hover:border-white/20"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-slate-500 mt-1">{formData.bio.length}/200 characters</p>
            </div>

            {/* Location */}
            <div className="group">
              <label htmlFor="location" className="block text-sm font-medium text-slate-200 mb-2">
                Location
                <span className="text-xs text-slate-500 ml-2">(optional)</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/10 group-hover:border-white/20"
                placeholder="San Francisco, CA"
              />
            </div>

            {/* Role-specific fields */}
            {isClient && (
              <>
                <div className="group">
                  <label htmlFor="company" className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2 group-hover:text-white transition-colors">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-white/10 group-hover:border-white/20"
                    placeholder="Acme Inc."
                  />
                </div>

                <div className="group">
                  <label htmlFor="website" className="block text-sm font-medium text-slate-200 mb-2">
                    Website
                    <span className="text-xs text-slate-500 ml-2">(optional)</span>
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-white/10 group-hover:border-white/20"
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}

            {isDesignerOrAdmin && (
              <>
                <div className="group">
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-200 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all hover:bg-white/10 group-hover:border-white/20"
                    placeholder="Senior Designer"
                  />
                </div>

                <SkillsSelector
                  value={formData.skills}
                  onChange={(skills) => setFormData({ ...formData, skills })}
                />

                <div className="group">
                  <label htmlFor="portfolioUrl" className="block text-sm font-medium text-slate-200 mb-2">
                    Portfolio URL
                    <span className="text-xs text-slate-500 ml-2">(optional)</span>
                  </label>
                  <input
                    type="url"
                    id="portfolioUrl"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all hover:bg-white/10 group-hover:border-white/20"
                    placeholder="https://portfolio.com"
                  />
                </div>
              </>
            )}

            {/* OAuth Connections */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Connect Accounts</h3>
              <p className="text-sm text-slate-400 mb-4">
                Link your Google account for easier login (optional)
              </p>
              <div className="space-y-3">
                <OAuthConnectionCard
                  provider="google"
                  connected={false}
                  onConnectionChange={() => setOauthRefresh(prev => prev + 1)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.name}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Almost there! Just one more step.
        </p>
      </div>
    </div>
  );
}
