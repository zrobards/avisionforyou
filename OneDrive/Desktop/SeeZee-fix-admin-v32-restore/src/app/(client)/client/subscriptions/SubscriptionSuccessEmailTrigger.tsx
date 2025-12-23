'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/stores/useToast';
import { useSession } from 'next-auth/react';

interface SubscriptionSuccessEmailTriggerProps {
  sessionId?: string;
}

export function SubscriptionSuccessEmailTrigger({ sessionId }: SubscriptionSuccessEmailTriggerProps) {
  const emailSentRef = useRef(false);
  const { showToast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    // Only send email once when component mounts
    if (emailSentRef.current || !sessionId) {
      return;
    }

    emailSentRef.current = true;

    console.log('[SUBSCRIPTION EMAIL TRIGGER] Component mounted, triggering email send for session:', sessionId);

    // Call API route to send email (this works reliably from client component)
    fetch('/api/subscriptions/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log(`[SUBSCRIPTION SUCCESS] ✅ Receipt email sent successfully for session ${sessionId}`);
            // Show success toast notification
            const customerEmail = session?.user?.email;
            showToast(
              customerEmail ? `Receipt email sent to ${customerEmail}` : 'Receipt email sent successfully',
              'success'
            );
          } else {
            console.error(`[SUBSCRIPTION SUCCESS] ❌ Failed to send receipt email:`, result.error);
            showToast('Failed to send receipt email. Please contact support.', 'error');
          }
        } else {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error(`[SUBSCRIPTION SUCCESS] ❌ API route returned error:`, error);
          showToast('Failed to send receipt email. Please contact support.', 'error');
        }
      })
      .catch((err) => {
        console.error('[SUBSCRIPTION SUCCESS] ❌ Exception sending receipt email:', err);
        showToast('Failed to send receipt email. Please contact support.', 'error');
      });
  }, [sessionId, showToast, session?.user?.email]);

  // This component doesn't render anything
  return null;
}

