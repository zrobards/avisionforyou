import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// GET /api/cron/event-reminders - Send reminders for upcoming events
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find events in next 24 hours that haven't sent reminders
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        startTime: {
          gte: new Date(),
          lte: tomorrow,
        },
        remindersSent: false,
        status: "SCHEDULED",
      },
      include: {
        organization: true,
        project: true,
      },
    });

    const sentReminders: string[] = [];

    for (const event of upcomingEvents) {
      // In production, integrate with Resend to send emails
      // For now, just log and mark as sent
      console.log(`[EVENT REMINDER] ${event.title}`);
      console.log(`  When: ${format(event.startTime, "PPpp")}`);
      console.log(`  Attendees: ${event.attendees.join(", ")}`);

      // Example email content that would be sent:
      // const emailContent = {
      //   to: event.attendees,
      //   subject: `Reminder: ${event.title} tomorrow`,
      //   html: `
      //     <h2>Event Reminder</h2>
      //     <p><strong>${event.title}</strong></p>
      //     <p>When: ${format(event.startTime, 'PPpp')}</p>
      //     <p>Location: ${event.location || 'N/A'}</p>
      //     ${event.meetingUrl ? `<p><a href="${event.meetingUrl}">Join Meeting</a></p>` : ''}
      //     <p>${event.description || ''}</p>
      //   `
      // };

      // Mark as sent
      await prisma.calendarEvent.update({
        where: { id: event.id },
        data: { remindersSent: true },
      });

      sentReminders.push(event.id);
    }

    return NextResponse.json({
      success: true,
      sent: sentReminders.length,
      eventIds: sentReminders,
    });
  } catch (error) {
    console.error("Error sending event reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}






