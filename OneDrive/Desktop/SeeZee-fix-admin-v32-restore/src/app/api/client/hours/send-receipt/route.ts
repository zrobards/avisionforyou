import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/email/send';
import { renderReceiptEmail } from '@/lib/email/templates/receipt';

/**
 * POST /api/client/hours/send-receipt
 * Send receipt email for hour pack purchase (fallback if webhook didn't send it)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, packId, packName, hours, price } = body;

    if (!sessionId || !packId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Retrieve the Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify payment was successful
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get pack expiration info
    const packExpirationDays: Record<string, number | null> = {
      SMALL: 60,
      MEDIUM: 90,
      LARGE: 120,
      PREMIUM: null, // Never expires
    };

    const expirationDays = packExpirationDays[packId as keyof typeof packExpirationDays] ?? 60;

    // Render and send receipt email
    const { html, text } = renderReceiptEmail({
      customerName: session.user.name || session.user.email.split('@')[0],
      customerEmail: session.user.email,
      receiptType: 'hour-pack',
      amount: price || (stripeSession.amount_total || 0) / 100,
      currency: 'USD',
      transactionId: sessionId,
      description: `${packName || packId} - ${hours || 0} support hours${expirationDays ? ` (valid for ${expirationDays} days)` : ' (never expires)'}`,
      items: [{
        name: `${packName || packId} - ${hours || 0} hours`,
        quantity: 1,
        amount: price || (stripeSession.amount_total || 0) / 100,
      }],
      hours: hours || 0,
      expirationDays: expirationDays,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com'}/client/hours`,
    });

    const result = await sendEmail({
      to: session.user.email,
      subject: `Payment Receipt - Hour Pack Purchase`,
      html,
      text,
    });

    if (result.success) {
      console.log(`[RECEIPT EMAIL] Receipt email sent successfully to ${session.user.email} for session ${sessionId}`);
      return NextResponse.json({ success: true, message: 'Receipt email sent' });
    } else {
      console.error(`[RECEIPT EMAIL] Failed to send receipt email:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[RECEIPT EMAIL] Error sending receipt email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send receipt email' },
      { status: 500 }
    );
  }
}




