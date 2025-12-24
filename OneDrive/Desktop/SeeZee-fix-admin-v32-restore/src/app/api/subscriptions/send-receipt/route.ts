import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/email/send';
import { renderReceiptEmail } from '@/lib/email/templates/receipt';

/**
 * POST /api/subscriptions/send-receipt
 * Send receipt email for subscription payment (fallback if webhook didn't send it)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check if this is a maintenance plan subscription
    if (checkoutSession.metadata?.type !== 'maintenance-plan-subscription') {
      return NextResponse.json(
        { error: 'This is not a maintenance plan subscription' },
        { status: 400 }
      );
    }

    const maintenancePlanId = checkoutSession.metadata?.maintenancePlanId;
    if (!maintenancePlanId) {
      return NextResponse.json(
        { error: 'Maintenance plan ID not found' },
        { status: 400 }
      );
    }

    // Get maintenance plan details
    const maintenancePlan = await prisma.maintenancePlan.findUnique({
      where: { id: maintenancePlanId },
      include: {
        project: {
          include: {
            organization: {
              include: {
                members: {
                  where: { role: 'OWNER' },
                  include: { user: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!maintenancePlan) {
      return NextResponse.json({ error: 'Maintenance plan not found' }, { status: 404 });
    }

    // Verify user has access
    const hasAccess = maintenancePlan.project.organization.members.some(
      (member) => member.user.email === session.user.email
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const owner = maintenancePlan.project.organization.members[0]?.user;
    const customerEmail = session.user.email || owner?.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No customer email found' },
        { status: 400 }
      );
    }

    // Get subscription details for next billing date
    let nextBillingDate: Date | undefined;
    if (checkoutSession.subscription) {
      try {
        const subscriptionId = typeof checkoutSession.subscription === 'string' 
          ? checkoutSession.subscription 
          : (checkoutSession.subscription as any).id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        nextBillingDate = new Date(subscription.current_period_end * 1000);
      } catch (err) {
        console.warn('[SUBSCRIPTION RECEIPT] Failed to get subscription details:', err);
      }
    }

    const { html, text } = renderReceiptEmail({
      customerName: session.user.name || owner?.name || customerEmail.split('@')[0],
      customerEmail: customerEmail,
      receiptType: 'maintenance-plan',
      amount: Number(maintenancePlan.monthlyPrice) / 100,
      currency: 'USD',
      transactionId: sessionId,
      description: `Monthly subscription for ${maintenancePlan.tier} tier maintenance plan`,
      items: [{
        name: `${maintenancePlan.tier} Maintenance Plan - Monthly Subscription`,
        quantity: 1,
        amount: Number(maintenancePlan.monthlyPrice) / 100,
      }],
      subscriptionTier: maintenancePlan.tier,
      nextBillingDate,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com'}/client/subscriptions`,
    });

    const result = await sendEmail({
      to: customerEmail,
      subject: `Payment Receipt - Maintenance Plan Subscription`,
      html,
      text,
    });

    if (result.success) {
      console.log(`[SUBSCRIPTION RECEIPT] Receipt email sent successfully to ${customerEmail} for session ${sessionId}`);
      return NextResponse.json({ success: true, message: 'Receipt email sent' });
    } else {
      console.error(`[SUBSCRIPTION RECEIPT] Failed to send receipt email:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[SUBSCRIPTION RECEIPT] Error sending receipt email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send receipt email' },
      { status: 500 }
    );
  }
}




