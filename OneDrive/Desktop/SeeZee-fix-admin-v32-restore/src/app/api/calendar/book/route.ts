import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, startTime, endTime, clientName, clientEmail, purpose } = body;

    // Validate required fields
    if (!userId || !startTime || !endTime || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the user being booked
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create calendar event
    const event = await prisma.calendarEvent.create({
      data: {
        title: `Meeting with ${clientName}`,
        description: purpose || `Consultation requested by ${clientName}`,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdBy: userId,
        attendees: [clientEmail, user.email].filter(Boolean) as string[],
        status: "SCHEDULED",
        color: "#22d3ee", // Cyan
      },
    });

    // Create a lead from the booking
    const existingLead = await prisma.lead.findFirst({
      where: { email: clientEmail.toLowerCase() },
    });

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          name: clientName,
          email: clientEmail.toLowerCase(),
          message: purpose || "Booked a consultation call",
          source: "BOOKING",
          status: "NEW",
        },
      });
    }

    // Send confirmation email to client
    try {
      await sendEmail({
        to: clientEmail,
        subject: `Meeting Confirmed with ${user.name} - SeeZee Studio`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22d3ee;">Meeting Confirmed! 🎉</h1>
            <p>Hi ${clientName},</p>
            <p>Your meeting with ${user.name} has been scheduled.</p>
            
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #94a3b8;">When</p>
              <p style="margin: 5px 0 15px; color: white; font-size: 18px;">
                ${new Date(startTime).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                at ${new Date(startTime).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              
              <p style="margin: 0; color: #94a3b8;">Duration</p>
              <p style="margin: 5px 0; color: white;">
                ${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)} minutes
              </p>
            </div>
            
            <p style="color: #94a3b8;">We'll send you a meeting link closer to the date.</p>
            
            <p>Best,<br/>SeeZee Studio</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the booking if email fails
    }

    // Notify the team member
    try {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `New Meeting Booked - ${clientName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1>New Meeting Booked 📅</h1>
              <p>${clientName} has booked a meeting with you.</p>
              
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p><strong>Client:</strong> ${clientName}</p>
                <p><strong>Email:</strong> ${clientEmail}</p>
                <p><strong>When:</strong> ${new Date(startTime).toLocaleString()}</p>
                ${purpose ? `<p><strong>Purpose:</strong> ${purpose}</p>` : ""}
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send team notification:", emailError);
    }

    return NextResponse.json({
      success: true,
      eventId: event.id,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book meeting" },
      { status: 500 }
    );
  }
}

