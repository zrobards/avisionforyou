'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/stores/useToast';

interface InvoiceSuccessEmailTriggerProps {
  invoiceId: string;
  customerEmail?: string;
}

export function InvoiceSuccessEmailTrigger({ invoiceId, customerEmail }: InvoiceSuccessEmailTriggerProps) {
  const emailSentRef = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Only send email once when component mounts
    if (emailSentRef.current) {
      console.log('[INVOICE EMAIL TRIGGER] Email already sent, skipping');
      return;
    }

    emailSentRef.current = true;

    console.log('[INVOICE EMAIL TRIGGER] Component mounted, triggering email send for invoice:', invoiceId);

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices/[id]/success/InvoiceSuccessEmailTrigger.tsx:17',message:'Client component mounted - triggering email send',data:{invoiceId},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // Call API route to send email (this works reliably from client component)
    console.log('[INVOICE EMAIL TRIGGER] Calling API route:', `/api/invoices/${invoiceId}/send-receipt`);
    fetch(`/api/invoices/${invoiceId}/send-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (response) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices/[id]/success/InvoiceSuccessEmailTrigger.tsx:26',message:'API route response received',data:{invoiceId,ok:response.ok,status:response.status},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (response.ok) {
          const result = await response.json();
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices/[id]/success/InvoiceSuccessEmailTrigger.tsx:31',message:'Email send result',data:{invoiceId,success:result.success,error:result.error},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
          // #endregion

          if (result.success) {
            console.log(`[INVOICE SUCCESS] ✅ Receipt email sent successfully for invoice ${invoiceId}`);
            // Show success toast notification
            if (customerEmail) {
              showToast(`Receipt email sent to ${customerEmail}`, 'success');
            } else {
              showToast('Receipt email sent successfully', 'success');
            }
          } else {
            console.error(`[INVOICE SUCCESS] ❌ Failed to send receipt email:`, result.error);
            showToast('Failed to send receipt email. Please contact support.', 'error');
          }
        } else {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices/[id]/success/InvoiceSuccessEmailTrigger.tsx:41',message:'API route error response',data:{invoiceId,status:response.status,error:error.error},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          console.error(`[INVOICE SUCCESS] ❌ API route returned error:`, error);
          showToast('Failed to send receipt email. Please contact support.', 'error');
        }
      })
      .catch((err) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'invoices/[id]/success/InvoiceSuccessEmailTrigger.tsx:47',message:'Exception calling API route',data:{invoiceId,error:err instanceof Error?err.message:String(err)},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        console.error('[INVOICE SUCCESS] ❌ Exception sending receipt email:', err);
        showToast('Failed to send receipt email. Please contact support.', 'error');
      });
  }, [invoiceId, customerEmail, showToast]);

  // This component doesn't render anything
  return null;
}

