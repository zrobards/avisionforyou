import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailStatus } from '@prisma/client';

/**
 * POST /api/webhooks/resend
 * Handle Resend webhook events for email tracking
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Resend webhook structure:
    // {
    //   "type": "email.sent" | "email.delivered" | "email.opened" | "email.clicked" | "email.bounced" | "email.replied",
    //   "created_at": "2024-01-01T00:00:00.000Z",
    //   "data": {
    //     "email_id": "abc123",
    //     "from": "sender@example.com",
    //     "to": ["recipient@example.com"],
    //     ...
    //   }
    // }

    const { type, created_at, data } = body;

    if (!type || !data?.email_id) {
      console.error('Invalid webhook payload:', body);
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const resendId = data.email_id;
    const timestamp = created_at ? new Date(created_at) : new Date();

    // Find the SentEmail record by resendId
    const sentEmail = await prisma.sentEmail.findFirst({
      where: { resendId },
      include: {
        prospect: true,
      },
    });

    if (!sentEmail) {
      console.warn(`SentEmail not found for resendId: ${resendId}`);
      // Return 200 to acknowledge webhook even if we can't find the email
      return NextResponse.json({ received: true });
    }

    // Update SentEmail based on event type
    const updateData: any = {};

    switch (type) {
      case 'email.sent':
        updateData.status = 'SENT';
        updateData.sentAt = timestamp;
        break;

      case 'email.delivered':
        updateData.status = 'DELIVERED';
        updateData.deliveredAt = timestamp;
        // If not already sent, mark as sent first
        if (!sentEmail.sentAt) {
          updateData.sentAt = timestamp;
        }
        break;

      case 'email.opened':
        updateData.status = 'OPENED';
        updateData.openedAt = timestamp;
        // Create activity for prospect
        if (sentEmail.prospectId) {
          await prisma.prospectActivity.create({
            data: {
              prospectId: sentEmail.prospectId,
              type: 'EMAIL_OPENED',
              description: `Email opened: ${sentEmail.subject}`,
              metadata: {
                emailId: sentEmail.id,
                openedAt: timestamp.toISOString(),
              },
            },
          });

          // Update prospect emailOpenedAt if not set
          await prisma.prospect.update({
            where: { id: sentEmail.prospectId },
            data: {
              emailOpenedAt: timestamp,
            },
          });
        }
        break;

      case 'email.clicked':
        updateData.status = 'CLICKED';
        updateData.clickedAt = timestamp;
        break;

      case 'email.bounced':
        updateData.status = 'BOUNCED';
        updateData.bouncedAt = timestamp;
        break;

      case 'email.replied':
        updateData.status = 'REPLIED';
        updateData.repliedAt = timestamp;
        // Create activity for prospect
        if (sentEmail.prospectId) {
          await prisma.prospectActivity.create({
            data: {
              prospectId: sentEmail.prospectId,
              type: 'EMAIL_REPLIED',
              description: `Email replied: ${sentEmail.subject}`,
              metadata: {
                emailId: sentEmail.id,
                repliedAt: timestamp.toISOString(),
              },
            },
          });

          // Update prospect status and emailRepliedAt
          await prisma.prospect.update({
            where: { id: sentEmail.prospectId },
            data: {
              status: 'RESPONDED',
              emailRepliedAt: timestamp,
              lastContactedAt: timestamp,
            },
          });
        }
        break;

      default:
        console.warn(`Unknown webhook type: ${type}`);
        return NextResponse.json({ received: true });
    }

    // Update SentEmail record
    await prisma.sentEmail.update({
      where: { id: sentEmail.id },
      data: updateData,
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Resend webhook:', error);
    // Return 200 to prevent Resend from retrying
    return NextResponse.json({ received: true, error: error.message });
  }
}


