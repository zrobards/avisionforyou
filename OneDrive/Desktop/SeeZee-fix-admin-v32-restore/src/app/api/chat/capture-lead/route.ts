import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, name, email, projectNeed } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Update conversation with lead info
    if (conversationId) {
      await prisma.aIConversation.update({
        where: { id: conversationId },
        data: {
          visitorName: name,
          visitorEmail: email,
          leadQuality: "warm", // Captured during chat = warm lead
        },
      });
    }

    // Check if lead already exists
    const existingLead = await prisma.lead.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingLead) {
      // Update existing lead
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          name: name,
          message: projectNeed 
            ? `${existingLead.message || ""}\n\n[AI Chat]: ${projectNeed}`.trim()
            : existingLead.message,
          source: "AI_CHAT",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Lead updated",
        leadId: existingLead.id,
      });
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email.toLowerCase(),
        message: projectNeed || "Captured via AI Chat",
        source: "AI_CHAT",
        status: LeadStatus.NEW,
      },
    });

    // Notify all admins about new lead
    const { createNewLeadNotification } = await import("@/lib/notifications");
    await createNewLeadNotification(
      lead.id,
      lead.name,
      lead.email,
      lead.company,
      "AI Chat"
    ).catch(err => console.error("Failed to create lead notification:", err));

    return NextResponse.json({
      success: true,
      message: "Lead captured",
      leadId: lead.id,
    });

  } catch (error) {
    console.error("Capture lead error:", error);
    return NextResponse.json(
      { error: "Failed to capture lead" },
      { status: 500 }
    );
  }
}

