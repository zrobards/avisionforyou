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

