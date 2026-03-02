import Script from 'next/script';

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  if (!gaId) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });

            // Track UTM parameters for attribution
            (function() {
              var params = new URLSearchParams(window.location.search);
              var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
              var utmData = {};
              var hasUtm = false;
              utmKeys.forEach(function(key) {
                var val = params.get(key);
                if (val) { utmData[key] = val; hasUtm = true; }
              });
              if (hasUtm) {
                try { sessionStorage.setItem('avfy_utm', JSON.stringify(utmData)); } catch(e) {}
                gtag('event', 'campaign_attribution', utmData);
              }
            })();

            // Scroll depth tracking (25%, 50%, 75%, 100%)
            (function() {
              var milestones = [25, 50, 75, 100];
              var fired = {};
              function getScrollPercent() {
                var h = document.documentElement;
                var b = document.body;
                var st = h.scrollTop || b.scrollTop;
                var sh = (h.scrollHeight || b.scrollHeight) - h.clientHeight;
                return sh > 0 ? Math.round((st / sh) * 100) : 0;
              }
              window.addEventListener('scroll', function() {
                var pct = getScrollPercent();
                milestones.forEach(function(m) {
                  if (pct >= m && !fired[m]) {
                    fired[m] = true;
                    gtag('event', 'scroll_depth', { percent: m, page: window.location.pathname });
                  }
                });
              }, { passive: true });
            })();
          `,
        }}
      />
    </>
  );
}

// ---- Core event tracking ----

export function trackEvent(eventName: string, eventParams?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.gtag) {
    // Attach stored UTM data to all events for attribution
    let utmData: Record<string, string> = {};
    try {
      const stored = sessionStorage.getItem('avfy_utm');
      if (stored) utmData = JSON.parse(stored);
    } catch {
      // ignore
    }
    window.gtag('event', eventName, { ...utmData, ...eventParams });
  }
}

// ---- Conversion events ----

export function trackDonation(amount: number, donationId?: string, frequency?: string) {
  trackEvent('donation', {
    value: amount,
    currency: 'USD',
    transaction_id: donationId || '',
    frequency: frequency || 'ONE_TIME',
  });
  // Also fire GA4 purchase event for revenue attribution
  trackEvent('purchase', {
    value: amount,
    currency: 'USD',
    transaction_id: donationId || '',
    item_name: frequency === 'MONTHLY' ? 'Monthly Donation' : 'One-Time Donation',
  });
}

export function trackSignup(method: string) {
  trackEvent('sign_up', { method });
}

export function trackAssessmentComplete(programId: string) {
  trackEvent('assessment_complete', { program_id: programId });
}

export function trackRSVP(meetingId: string, action: 'create' | 'cancel') {
  trackEvent('rsvp', { meeting_id: meetingId, action });
}

export function trackProgramView(programId: string, programName: string) {
  trackEvent('view_program', { program_id: programId, program_name: programName });
}

// ---- Funnel events ----

export function trackFunnelStep(step: string, details?: Record<string, string | number>) {
  trackEvent('funnel_step', { step, ...details });
}

export function trackAssessmentStart() {
  trackFunnelStep('assessment_start');
}

export function trackAdmissionInquiry(program: string) {
  trackFunnelStep('admission_inquiry', { program });
}

export function trackNewsletterSignup() {
  trackEvent('newsletter_signup');
}

export function trackContactSubmit(department: string) {
  trackEvent('contact_form_submit', { department });
}

// ---- Engagement events ----

export function trackCTAClick(ctaName: string, location: string) {
  trackEvent('cta_click', { cta_name: ctaName, location });
}

export function trackSocialShare(platform: string, contentType: string, contentId?: string) {
  trackEvent('social_share', { platform, content_type: contentType, content_id: contentId || '' });
}

export function trackVideoPlay(videoName: string) {
  trackEvent('video_play', { video_name: videoName });
}

export function trackImpactReportDownload() {
  trackEvent('impact_report_download');
}

// Global types for window.gtag
declare global {
  interface Window {
    gtag: (...args: [string, ...unknown[]]) => void;
    dataLayer: Record<string, unknown>[];
  }
}
