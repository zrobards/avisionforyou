import Script from 'next/script';

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

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
          `,
        }}
      />
    </>
  );
}

// Track custom events
export function trackEvent(eventName: string, eventParams?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams || {});
  }
}

// Track donation
export function trackDonation(amount: number, donationId?: string) {
  trackEvent('donation', {
    value: amount,
    currency: 'USD',
    transaction_id: donationId || '',
  });
}

// Track signup/conversion
export function trackSignup(method: string) {
  trackEvent('sign_up', {
    method: method,
  });
}

// Track assessment completion
export function trackAssessmentComplete(programId: string) {
  trackEvent('assessment_complete', {
    program_id: programId,
  });
}

// Track RSVP
export function trackRSVP(meetingId: string, action: 'create' | 'cancel') {
  trackEvent('rsvp', {
    meeting_id: meetingId,
    action: action,
  });
}

// Track program view
export function trackProgramView(programId: string, programName: string) {
  trackEvent('view_program', {
    program_id: programId,
    program_name: programName,
  });
}

// Global types for window.gtag
declare global {
  interface Window {
    gtag: (...args: [string, ...unknown[]]) => void;
    dataLayer: Record<string, unknown>[];
  }
}
