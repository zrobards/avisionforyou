import { Resend } from 'resend'
import { db } from './db'
import { escapeHtml } from '@/lib/sanitize'
import { logger } from '@/lib/logger'

// Initialize Resend only if API key is provided
const resend = process.env.RESEND_API_KEY?.trim() ? new Resend(process.env.RESEND_API_KEY.trim()) : null

const getResendClient = () => {
  if (!resend) {
    logger.warn('RESEND_API_KEY not configured - email not sent')
    return null
  }
  return resend
}

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || 'A Vision For You <noreply@avisionforyou.org>',
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    if (!resend) {
      logger.warn({ to, subject }, 'RESEND_API_KEY not configured - email not sent')
      return { error: 'Email service not configured' }
    }

    return await resend.emails.send({
      from,
      to,
      subject,
      html,
    })
  } catch (error) {
    logger.error({ err: error }, 'Failed to send email')
    throw error
  }
}

interface ReminderType {
  type: '24h' | '1h'
  field: 'reminder24hSent' | 'reminder1hSent'
}

export async function sendMeetingReminder(
  rsvpId: string,
  reminderType: ReminderType = { type: '24h', field: 'reminder24hSent' }
) {
  try {
    const resendClient = getResendClient()
    if (!resendClient) return false

    const rsvp = await db.rSVP.findUnique({
      where: { id: rsvpId },
      include: {
        user: true,
        session: true,
      },
    })

    if (!rsvp || !rsvp.user.email) {
      logger.error({ rsvpId }, 'RSVP or user email not found')
      return false
    }

    const meetingDate = new Date(rsvp.session.startDate)
    const formattedDate = meetingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const formattedTime = meetingDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const reminderText = reminderType.type === '24h'
      ? 'tomorrow'
      : 'in 1 hour'

    const result = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'A Vision For You <noreply@avisionforyou.org>',
      to: rsvp.user.email,
      subject: `Reminder: ${escapeHtml(rsvp.session.title)} Meeting ${reminderType.type === '24h' ? 'Tomorrow' : 'Starting Soon'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #1f2937; margin: 0;">Meeting Reminder</h1>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${escapeHtml(rsvp.user.name) || 'there'},
          </p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that you have an upcoming meeting ${reminderText}:
          </p>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin: 0 0 8px 0;">${escapeHtml(rsvp.session.title)}</h2>
            <p style="color: #1e3a8a; margin: 4px 0;">
              <strong>Date:</strong> ${formattedDate}
            </p>
            <p style="color: #1e3a8a; margin: 4px 0;">
              <strong>Time:</strong> ${formattedTime}
            </p>
            ${rsvp.session.location ? `
            <p style="color: #1e3a8a; margin: 4px 0;">
              <strong>Location:</strong> ${escapeHtml(rsvp.session.location)}
            </p>
            ` : ''}
            ${rsvp.session.link ? `
            <p style="color: #1e3a8a; margin: 4px 0;">
              <strong>Meeting Link:</strong> <a href="${escapeHtml(rsvp.session.link)}" style="color: #3b82f6;">${escapeHtml(rsvp.session.link)}</a>
            </p>
            ` : ''}
          </div>

          ${rsvp.session.description ? `
          <div style="color: #374151; font-size: 14px; line-height: 1.6;">
            <p><strong>Description:</strong></p>
            <p>${escapeHtml(rsvp.session.description)}</p>
          </div>
          ` : ''}

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We look forward to seeing you there! If you have any questions, please don't hesitate to reach out.
          </p>

          <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 4px; margin: 20px 0; text-align: center;">
            <a href="https://avisionforyou.org/notifications" style="color: #16a34a; text-decoration: none; font-weight: bold;">
              Manage Your RSVPs →
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">
              A Vision For You<br/>
              <a href="https://avisionforyou.org" style="color: #3b82f6; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      logger.error({ err: result.error, rsvpId }, 'Meeting reminder email error')
      return false
    }

    // Mark reminder as sent
    await db.rSVP.update({
      where: { id: rsvpId },
      data: { [reminderType.field]: true },
    })

    return true
  } catch (error) {
    logger.error({ err: error, rsvpId }, 'Error sending meeting reminder')
    return false
  }
}

export async function sendAdmissionConfirmation(
  name: string,
  email: string,
  program: string
) {
  try {
    const resendClient = getResendClient()
    if (!resendClient) return false

    const result = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'A Vision For You <noreply@avisionforyou.org>',
      to: email,
      subject: 'Thank You for Your Interest in A Vision For You',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">A Vision For You</h1>
          </div>

          <div style="background-color: #f9fafb; padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${escapeHtml(name)},
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in our recovery programs. We have received your inquiry for the <strong>${escapeHtml(program)}</strong> program.
            </p>

            <div style="background-color: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">What Happens Next?</h2>
              <ol style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Our admissions team will review your inquiry within 24 hours</li>
                <li>You'll receive a call or email to schedule an initial consultation</li>
                <li>We'll discuss your recovery goals and program options</li>
                <li>If you're a good fit, we'll guide you through the enrollment process</li>
              </ol>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Recovery is possible, and we're here to support you every step of the way.
            </p>

            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 25px;">
              <p style="color: #1e40af; font-weight: bold; margin: 0 0 10px 0;">Need Immediate Assistance?</p>
              <p style="color: #1e3a8a; margin: 0;">
                📞 Call us: <a href="tel:5027496344" style="color: #3b82f6; text-decoration: none;">(502) 749-6344</a><br>
                📧 Email: <a href="mailto:info@avisionforyourecovery.org" style="color: #3b82f6; text-decoration: none;">info@avisionforyourecovery.org</a>
              </p>
            </div>
          </div>

          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              A Vision For You<br>
              1675 Story Ave, Louisville, KY 40206<br>
              <a href="https://avisionforyou.org" style="color: #3b82f6; text-decoration: none;">avisionforyou.org</a>
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      logger.error({ err: result.error, email }, 'Admission confirmation email error')
      return false
    }

    return true
  } catch (error) {
    logger.error({ err: error, email }, 'Error sending admission confirmation')
    return false
  }
}

export async function sendAdmissionNotificationToAdmin(
  name: string,
  email: string,
  phone: string,
  program: string,
  message: string
) {
  try {
    const resendClient = getResendClient()
    if (!resendClient) return false

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@avisionforyou.org'
    const adminPanelUrl = process.env.NEXTAUTH_URL || 'https://avisionforyou.org'

    const result = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'A Vision For You <noreply@avisionforyou.org>',
      to: adminEmail,
      subject: `New Admission Inquiry - ${escapeHtml(program)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">New Admission Inquiry</h1>
          </div>

          <div style="background-color: #f9fafb; padding: 30px;">
            <p style="color: #374151; font-size: 16px;">A new admission inquiry has been received for the <strong>${escapeHtml(program)}</strong> program.</p>
            <p style="color: #374151; font-size: 16px;">Please view the full details in the <a href="${adminPanelUrl}/admin/admissions" style="color: #3b82f6;">admin panel</a>.</p>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-weight: bold;">Action Required</p>
              <p style="color: #92400e; margin: 5px 0 0 0;">Please follow up within 24 hours to maintain engagement.</p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 12px; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-size: 12px;">This email intentionally omits personal information for HIPAA compliance.</p>
            </div>
          </div>

          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is an automated notification from A Vision For You admissions system.
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      logger.error({ err: result.error }, 'Admin notification email error')
      return false
    }

    return true
  } catch (error) {
    logger.error({ err: error }, 'Error sending admin notification')
    return false
  }
}

export async function sendDonationThankYou(
  name: string,
  email: string,
  amount: number,
  frequency: string
) {
  try {
    const resendClient = getResendClient()
    if (!resendClient) return false

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

    const isRecurring = frequency !== 'ONE_TIME'

    const result = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'A Vision For You <noreply@avisionforyou.org>',
      to: email,
      subject: `Thank You for Your ${isRecurring ? 'Recurring ' : ''}Donation!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #059669; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">💚 Thank You for Your Generosity!</h1>
          </div>

          <div style="background-color: #f9fafb; padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear ${escapeHtml(name)},
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your ${isRecurring ? 'recurring ' : ''}donation of <strong>${formattedAmount}</strong> ${isRecurring ? 'per ' + frequency.toLowerCase() : ''}
              has been received. Your support makes a real difference in the lives of the people we serve.
            </p>

            <div style="background-color: white; border: 2px solid #10b981; padding: 25px; margin: 25px 0; border-radius: 8px; text-align: center;">
              <p style="color: #059669; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">${formattedAmount}</p>
              <p style="color: #6b7280; margin: 0;">${isRecurring ? 'Recurring ' + frequency : 'One-Time'} Donation</p>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h2 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">Your Impact</h2>
              <p style="color: #374151; line-height: 1.6; margin: 0;">
                Your contribution helps us provide:<br><br>
                ✅ Free meetings and support groups<br>
                ✅ Compassionate community support<br>
                ✅ Peer mentorship and guidance<br>
                ✅ Resources for individuals and families
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${isRecurring ?
                'Your recurring donation will process automatically. You can manage your subscription anytime from your donor dashboard.' :
                'If you\'d like to make your support recurring, visit our donations page to set up monthly giving.'
              }
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://avisionforyou.org/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Your Impact Dashboard
              </a>
            </div>
          </div>

          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              Tax-deductible receipt will be sent separately
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              A Vision For You | 501(c)(3) Nonprofit<!-- TODO: Replace with actual EIN --><br>
              1675 Story Ave, Louisville, KY 40206
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      logger.error({ err: result.error, email }, 'Donation thank you email error')
      return false
    }

    return true
  } catch (error) {
    logger.error({ err: error, email }, 'Error sending donation thank you')
    return false
  }
}

export async function sendBulkMeetingReminders() {
  try {
    const now = new Date()

    // Send 24-hour reminders
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setHours(23, 59, 59, 999)

    const rsvps24h = await db.rSVP.findMany({
      where: {
        reminder24hSent: false,
        status: 'CONFIRMED',
        session: {
          startDate: {
            gte: tomorrow,
            lte: endOfTomorrow,
          },
        },
      },
      include: {
        user: true,
        session: true,
      },
    })

    let sent24h = 0
    for (const rsvp of rsvps24h) {
      const sent = await sendMeetingReminder(rsvp.id, {
        type: '24h',
        field: 'reminder24hSent',
      })
      if (sent) sent24h++
    }

    // Send 1-hour reminders
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000)
    const oneHourWindow = new Date(inOneHour.getTime() - 10 * 60 * 1000) // 10-minute window

    const rsvps1h = await db.rSVP.findMany({
      where: {
        reminder1hSent: false,
        status: 'CONFIRMED',
        session: {
          startDate: {
            gte: oneHourWindow,
            lte: inOneHour,
          },
        },
      },
      include: {
        user: true,
        session: true,
      },
    })

    let sent1h = 0
    for (const rsvp of rsvps1h) {
      const sent = await sendMeetingReminder(rsvp.id, {
        type: '1h',
        field: 'reminder1hSent',
      })
      if (sent) sent1h++
    }

    logger.info({ sent24h, sent1h, total: sent24h + sent1h }, 'Bulk meeting reminders sent')
    return { sent24h, sent1h, total: sent24h + sent1h }
  } catch (error) {
    logger.error({ err: error }, 'Error sending bulk reminders')
    return { sent24h: 0, sent1h: 0, total: 0 }
  }
}

export async function sendDonationConfirmationEmail(
  donationId: string,
  recipientEmail: string,
  donorName: string,
  amount: number,
  frequency: string
) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      logger.warn('Donation email: RESEND_API_KEY not configured - email not sent')
      return false
    }

    const isDonationIdValid = donationId && typeof donationId === 'string' && donationId.length > 0

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #10b981 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .amount { font-size: 32px; font-weight: bold; color: #7c3aed; margin: 20px 0; }
            .impact-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
            .footer { font-size: 12px; color: #666; margin-top: 30px; text-align: center; }
            h1 { margin: 0; }
            h2 { color: #7c3aed; margin-top: 0; }
            .highlight { background: #fef08a; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💚 Thank You!</h1>
              <p style="margin: 10px 0 0 0;">Your generosity changes lives</p>
            </div>

            <div class="content">
              <p>Hi ${escapeHtml(donorName)},</p>

              <p>We are incredibly grateful for your donation of <strong>$${amount.toFixed(2)}</strong> to A Vision For You. Your compassion and support make a real difference in the lives of the people we serve.</p>

              <div class="impact-box">
                <h3 style="margin-top: 0;">Your Impact:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>$25 = 10 meals for someone in recovery</li>
                  <li>$50 = 1 day of shelter support</li>
                  <li>$100 = 1 week of recovery support</li>
                  <li>$250 = 1 month of peer counseling</li>
                  <li>$500 = Sponsors 1 full recovery program bed</li>
                </ul>
              </div>

              <h2>Take Your Impact Further</h2>
              <p>Did you know that monthly recurring donations are 2x more powerful? Here's why:</p>

              <div class="highlight">
                <strong>💡 Monthly giving allows us to:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Plan long-term recovery programs with confidence</li>
                  <li>Provide consistent housing and meal support</li>
                  <li>Expand peer counseling services</li>
                  <li>Help more people every single month</li>
                </ul>
              </div>

              <p><strong>Consider becoming a monthly donor:</strong></p>
              <p>For the same amount you just gave, imagine the impact of that donation recurring every month. A $50 one-time gift becomes $600/year in life-changing support.</p>

              <center>
                <a href="https://avisionforyou.vercel.app/donate" class="button">💚 Become a Monthly Donor</a>
              </center>

              <h2>Your Donation Receipt</h2>
              <p style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-family: monospace;">
                <strong>Donation ID:</strong> ${isDonationIdValid ? donationId : 'Pending'}<br>
                <strong>Amount:</strong> $${amount.toFixed(2)}<br>
                <strong>Type:</strong> ${frequency === 'MONTHLY' ? 'Monthly Recurring' : 'One-Time Gift'}<br>
                <strong>Status:</strong> Received & Processing
              </p>

              <p>You'll receive a formal tax receipt via email shortly. A Vision For You is a 501(c)(3) nonprofit organization - your donation is tax-deductible.</p>

              <h2>Questions?</h2>
              <p>If you have any questions about your donation or want to learn more about our programs, please don't hesitate to reach out to us at <strong>admin@avisionforyou.org</strong></p>

              <p style="margin-top: 30px;">With deep gratitude,<br><strong>The A Vision For You Team</strong></p>

              <div class="footer">
                <p>A Vision For You<br>
                1675 Story Ave, Louisville, KY 40206<br>
                <a href="https://avisionforyou.org" style="color: #3b82f6;">avisionforyou.org</a></p>
                <p style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
                  This email was sent to ${escapeHtml(recipientEmail)} because you made a donation to A Vision For You.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await sendEmail({
      to: recipientEmail,
      subject: `Thank You for Your ${amount < 100 ? 'Generous' : 'Major'} Donation - A Vision For You`,
      html,
      from: process.env.EMAIL_FROM || 'A Vision For You <noreply@avisionforyou.org>'
    })

    logger.info({ recipientEmail }, 'Donation confirmation email sent successfully')
    return true
  } catch (error) {
    logger.error({
      err: error,
      recipientEmail,
      donorName,
      amount,
    }, 'Failed to send donation confirmation email')
    return false
  }
}
