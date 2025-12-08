import { Resend } from 'resend'
import { db } from './db'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ReminderType {
  type: '24h' | '1h'
  field: 'reminder24hSent' | 'reminder1hSent'
}

export async function sendMeetingReminder(
  rsvpId: string,
  reminderType: ReminderType = { type: '24h', field: 'reminder24hSent' }
) {
  try {
    const rsvp = await db.rSVP.findUnique({
      where: { id: rsvpId },
      include: {
        user: true,
        session: true,
      },
    })

    if (!rsvp || !rsvp.user.email) {
      console.error('RSVP or user email not found')
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

    const result = await resend.emails.send({
      from: 'A Vision For You <noreply@avisionforyou.org>',
      to: rsvp.user.email,
      subject: `Reminder: ${rsvp.session.title} Meeting ${reminderType.type === '24h' ? 'Tomorrow' : 'Starting Soon'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #1f2937; margin: 0;">Meeting Reminder</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${rsvp.user.name || 'there'},
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that you have an upcoming meeting ${reminderText}:
          </p>
          
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin: 0 0 8px 0;">${rsvp.session.title}</h2>
            <p style="color: #1e3a8a; margin: 4px 0;">
              <strong>Date:</strong> ${formattedDate}
            </p>
            <p style="color: #1e3a8a; margin: 4px 0;">
              <strong>Time:</strong> ${formattedTime}
            </p>
            ${rsvp.session.location ? `
            <p style="color: #1e3a8a; margin: 4px 0;">
              <strong>Location:</strong> ${rsvp.session.location}
            </p>
            ` : ''}
            ${rsvp.session.link ? `
            <p style="color: #1e3a8a; margin: 4px 0;">
              <strong>Meeting Link:</strong> <a href="${rsvp.session.link}" style="color: #3b82f6;">${rsvp.session.link}</a>
            </p>
            ` : ''}
          </div>
          
          ${rsvp.session.description ? `
          <div style="color: #374151; font-size: 14px; line-height: 1.6;">
            <p><strong>Description:</strong></p>
            <p>${rsvp.session.description}</p>
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
              A Vision For You Recovery<br/>
              <a href="https://avisionforyou.org" style="color: #3b82f6; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.error('Email error:', result.error)
      return false
    }

    // Mark reminder as sent
    await db.rSVP.update({
      where: { id: rsvpId },
      data: { [reminderType.field]: true },
    })

    return true
  } catch (error) {
    console.error('Error sending meeting reminder:', error)
    return false
  }
}

export async function sendAdmissionConfirmation(
  name: string,
  email: string,
  program: string
) {
  try {
    const result = await resend.emails.send({
      from: 'A Vision For You <noreply@avisionforyou.org>',
      to: email,
      subject: 'Thank You for Your Interest in A Vision For You Recovery',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">A Vision For You Recovery</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in our recovery programs. We have received your inquiry for the <strong>${program}</strong> program.
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
                📞 Call us: <a href="tel:5025551234" style="color: #3b82f6; text-decoration: none;">(502) 555-1234</a><br>
                📧 Email: <a href="mailto:admissions@avisionforyou.org" style="color: #3b82f6; text-decoration: none;">admissions@avisionforyou.org</a>
              </p>
            </div>
          </div>
          
          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              A Vision For You Recovery<br>
              1675 Story Ave, Louisville, KY 40206<br>
              <a href="https://avisionforyou.org" style="color: #3b82f6; text-decoration: none;">avisionforyou.org</a>
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.error('Admission confirmation email error:', result.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending admission confirmation:', error)
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
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@avisionforyou.org'
    
    const result = await resend.emails.send({
      from: 'A Vision For You <noreply@avisionforyou.org>',
      to: adminEmail,
      replyTo: email,
      subject: `New Admission Inquiry: ${name} - ${program}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🔔 New Admission Inquiry</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Applicant Information</h2>
              <table style="width: 100%; color: #374151; line-height: 1.8;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #3b82f6;">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Program:</td>
                  <td style="padding: 8px 0;">${program}</td>
                </tr>
              </table>
            </div>
            
            ${message ? `
            <div style="background-color: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">Message:</h3>
              <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            ` : ''}
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-weight: bold;">⚡ Action Required</p>
              <p style="color: #92400e; margin: 5px 0 0 0;">Please follow up within 24 hours to maintain engagement.</p>
            </div>
          </div>
          
          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is an automated notification from A Vision For You Recovery admissions system.
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.error('Admin notification email error:', result.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending admin notification:', error)
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
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

    const isRecurring = frequency !== 'ONE_TIME'
    
    const result = await resend.emails.send({
      from: 'A Vision For You <noreply@avisionforyou.org>',
      to: email,
      subject: `Thank You for Your ${isRecurring ? 'Recurring ' : ''}Donation!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #059669; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">💚 Thank You for Your Generosity!</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear ${name},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your ${isRecurring ? 'recurring ' : ''}donation of <strong>${formattedAmount}</strong> ${isRecurring ? 'per ' + frequency.toLowerCase() : ''} 
              has been received. Your support makes a real difference in the lives of individuals on their recovery journey.
            </p>
            
            <div style="background-color: white; border: 2px solid #10b981; padding: 25px; margin: 25px 0; border-radius: 8px; text-align: center;">
              <p style="color: #059669; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">${formattedAmount}</p>
              <p style="color: #6b7280; margin: 0;">${isRecurring ? 'Recurring ' + frequency : 'One-Time'} Donation</p>
            </div>
            
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h2 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">Your Impact</h2>
              <p style="color: #374151; line-height: 1.6; margin: 0;">
                Your contribution helps us provide:<br><br>
                ✅ Free recovery meetings and support groups<br>
                ✅ Evidence-based treatment programs<br>
                ✅ Peer support and mentorship<br>
                ✅ Resources for families affected by addiction
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
              A Vision For You Recovery | EIN: XX-XXXXXXX<br>
              1675 Story Ave, Louisville, KY 40206
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.error('Donation thank you email error:', result.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending donation thank you:', error)
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

    console.log(
      `Sent ${sent24h} 24-hour reminders and ${sent1h} 1-hour reminders`
    )
    return { sent24h, sent1h, total: sent24h + sent1h }
  } catch (error) {
    console.error('Error sending bulk reminders:', error)
    return { sent24h: 0, sent1h: 0, total: 0 }
  }
}

