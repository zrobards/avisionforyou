import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/email/send';
import { renderReceiptEmail } from '@/lib/email/templates/receipt';

/**
 * POST /api/invoices/[id]/send-receipt
 * Send receipt email for invoice payment (fallback if webhook didn't send it)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/invoices/[id]/send-receipt/route.ts:12',message:'API route entry',data:{},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    const session = await auth();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/invoices/[id]/send-receipt/route.ts:20',message:'Session check',data:{hasSession:!!session,hasUserId:!!session?.user?.id,hasEmail:!!session?.user?.email},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: invoiceId } = await params;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/invoices/[id]/send-receipt/route.ts:26',message:'Invoice ID extracted',data:{invoiceId},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // Get invoice with all related data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        organization: {
          include: {
            members: {
              where: { role: 'OWNER' },
              include: { user: true },
              take: 1,
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Verify user has access to this invoice
    const hasAccess = invoice.organization.members.some(
      (member) => member.user.email === session.user.email
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only send receipt if invoice is paid
    if (invoice.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Invoice is not paid yet' },
        { status: 400 }
      );
    }

    const owner = invoice.organization.members[0]?.user;
    const customerEmail = session.user.email || owner?.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No customer email found' },
        { status: 400 }
      );
    }

    // Get Stripe invoice if available for additional details
    let stripeInvoice = null;
    if (invoice.stripeInvoiceId) {
      try {
        stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);
      } catch (err) {
        console.warn('[INVOICE RECEIPT] Failed to retrieve Stripe invoice:', err);
      }
    }

    // Determine receipt type - check if it's a subscription invoice
    let receiptType: 'invoice' | 'subscription' = 'invoice';
    let subscriptionTier: string | undefined;
    let nextBillingDate: Date | undefined;

    if (stripeInvoice?.subscription) {
      receiptType = 'subscription';
      try {
        const subscription = await stripe.subscriptions.retrieve(
          stripeInvoice.subscription as string
        );
        const maintenancePlan = await prisma.maintenancePlan.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (maintenancePlan) {
          subscriptionTier = maintenancePlan.tier;
          nextBillingDate = new Date(subscription.current_period_end * 1000);
        }
      } catch (err) {
        console.warn('[INVOICE RECEIPT] Failed to get subscription details:', err);
      }
    }

    // Render and send receipt email
    const { html, text } = renderReceiptEmail({
      customerName: session.user.name || owner?.name || customerEmail.split('@')[0],
      customerEmail: customerEmail,
      receiptType: receiptType,
      amount: Number(invoice.total),
      currency: 'USD',
      transactionId: invoice.stripeInvoiceId || invoice.id,
      invoiceNumber: invoice.number,
      description: invoice.description || invoice.title,
      items: invoice.items.map(item => ({
        name: item.description,
        quantity: item.quantity,
        amount: Number(item.amount),
      })),
      subscriptionTier,
      nextBillingDate,
      invoiceUrl: invoice.stripeInvoiceId
        ? `https://invoice.stripe.com/i/${invoice.stripeInvoiceId}`
        : `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com'}/client/invoices/${invoice.id}`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com'}/client/invoices`,
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/invoices/[id]/send-receipt/route.ts:134',message:'About to call sendEmail',data:{invoiceId,to:customerEmail,hasHtml:!!html,hasText:!!text,hasResendKey:!!process.env.RESEND_API_KEY},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const result = await sendEmail({
      to: customerEmail,
      subject: `Payment Receipt - Invoice ${invoice.number}`,
      html,
      text,
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/invoices/[id]/send-receipt/route.ts:143',message:'sendEmail result',data:{invoiceId,success:result.success,error:result.error},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (result.success) {
      console.log(`[INVOICE RECEIPT] Receipt email sent successfully to ${customerEmail} for invoice ${invoice.number}`);
      return NextResponse.json({ success: true, message: 'Receipt email sent' });
    } else {
      console.error(`[INVOICE RECEIPT] Failed to send receipt email:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[INVOICE RECEIPT] Error sending receipt email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send receipt email' },
      { status: 500 }
    );
  }
}

