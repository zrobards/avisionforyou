import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/send';
import { renderReceiptEmail } from '@/lib/email/templates/receipt';

/**
 * POST /api/test-email
 * Test endpoint to verify email sending works
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      );
    }

    // Test with a simple receipt email
    const { html, text } = renderReceiptEmail({
      customerName: 'Test User',
      customerEmail: to,
      receiptType: 'hour-pack',
      amount: 100,
      currency: 'USD',
      transactionId: 'test-' + Date.now(),
      description: 'Test Hour Pack Purchase',
      items: [{
        name: 'Test Pack - 5 hours',
        quantity: 1,
        amount: 100,
      }],
      hours: 5,
      expirationDays: 60,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/client/hours`,
    });

    const result = await sendEmail({
      to,
      subject: 'Test Receipt Email - SeeZee Studio',
      html,
      text,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[TEST EMAIL] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test email',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}



