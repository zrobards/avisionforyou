import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { ProspectStatus, EmailStatus } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/prospects/[id]/send-email
 * Send email via Resend API
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only CEO, CFO, or OUTREACH roles can access
    const allowedRoles = ['CEO', 'CFO', 'OUTREACH'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { subject, emailBody, fromEmail } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and email body are required' },
        { status: 400 }
      );
    }

    // Fetch prospect
    const prospect = await prisma.prospect.findUnique({
      where: { id },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    if (!prospect.email || !prospect.email.trim()) {
      return NextResponse.json(
        { error: 'Prospect does not have an email address' },
        { status: 400 }
      );
    }

    const fromAddress = fromEmail || process.env.RESEND_FROM_EMAIL || 'sean@see-zee.com';

    // Create SentEmail record with QUEUED status
    const sentEmail = await prisma.sentEmail.create({
      data: {
        prospectId: id,
        from: fromAddress,
        to: prospect.email,
        subject,
        body: emailBody,
        status: 'QUEUED',
      },
    });

    try {
      // Send email via Resend
      const emailResponse = await resend.emails.send({
        from: `SeeZee Studio <${fromAddress}>`,
        to: prospect.email,
        subject,
        html: emailBody.replace(/\n/g, '<br>'),
        text: emailBody,
      });

      const resendId = emailResponse.data?.id;

      // Update SentEmail with resendId and status
      await prisma.sentEmail.update({
        where: { id: sentEmail.id },
        data: {
          resendId,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Calculate follow-up date (7 days from now)
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7);

      // Update prospect
      await prisma.$transaction(async (tx) => {
        await tx.prospect.update({
          where: { id },
          data: {
            status: 'CONTACTED' as ProspectStatus,
            emailSentAt: new Date(),
            lastContactedAt: new Date(),
            followUpDate,
            emailDraft: null, // Clear draft after sending
          },
        });

        await tx.prospectActivity.create({
          data: {
            prospectId: id,
            type: 'EMAIL_SENT',
            description: `Email sent to ${prospect.email}`,
            metadata: {
              subject,
              resendId,
              emailId: sentEmail.id,
            },
          },
        });
      });

      return NextResponse.json({
        success: true,
        emailId: sentEmail.id,
        resendId,
      });
    } catch (error: any) {
      console.error('Error sending email via Resend:', error);

      // Update SentEmail status to FAILED
      await prisma.sentEmail.update({
        where: { id: sentEmail.id },
        data: {
          status: 'FAILED',
        },
      });

      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: error.message || 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in send-email route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

