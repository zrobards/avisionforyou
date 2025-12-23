import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";
import { renderTemplate } from "@/lib/email/renderTemplate";
import { sendEmail } from "@/lib/email/send";

/**
 * POST /api/prospects/reachout
 * Convert a prospect to a lead and optionally send an email using a template
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prospectId, emailTemplateId, customEmail } = body;

    if (!prospectId) {
      return NextResponse.json(
        { error: "Prospect ID required" },
        { status: 400 }
      );
    }

    // Fetch prospect
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    // Check if already converted
    if (prospect.convertedToLeadId) {
      return NextResponse.json(
        { error: "Prospect already converted to lead", leadId: prospect.convertedToLeadId },
        { status: 400 }
      );
    }

    // Convert prospect to lead
    const lead = await prisma.lead.create({
      data: {
        name: prospect.name,
        email: prospect.email || `${prospect.name.toLowerCase().replace(/\s+/g, '')}@placeholder.com`,
        phone: prospect.phone || null,
        company: prospect.company || prospect.name,
        source: prospect.source || "GOOGLE_PLACES",
        status: LeadStatus.NEW,
        message: `Converted from prospect discovery. ${prospect.internalNotes || ''}`,
        
        // Address fields
        address: prospect.address,
        city: prospect.city,
        state: prospect.state,
        zipCode: prospect.zipCode,
        country: prospect.country,
        latitude: prospect.latitude,
        longitude: prospect.longitude,
        
        // Business info
        ein: prospect.ein,
        category: prospect.category,
        subcategory: prospect.subcategory,
        annualRevenue: prospect.annualRevenue,
        employeeCount: prospect.employeeCount,
        
        // Website info
        websiteUrl: prospect.websiteUrl,
        hasWebsite: prospect.hasWebsite,
        websiteQuality: prospect.websiteQuality,
        needsAssessment: prospect.needsAssessment ?? undefined,
        
        // Scoring
        leadScore: prospect.leadScore,
        tags: prospect.tags,
        
        // Metadata
        metadata: {
          prospectId: prospect.id,
          discoveryMetadata: prospect.discoveryMetadata,
          aiAnalysis: prospect.aiAnalysis,
          convertedAt: new Date().toISOString(),
        },
        
        internalNotes: prospect.internalNotes,
      },
    });

    // Update prospect to mark as converted
    await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        convertedToLeadId: lead.id,
        convertedAt: new Date(),
      },
    });

    // Send email if template or custom email provided
    let emailSent = false;
    if (emailTemplateId || customEmail) {
      try {
        if (emailTemplateId) {
          // Use email template
          const template = await prisma.emailTemplate.findUnique({
            where: { id: emailTemplateId },
          });

          if (template && template.active) {
            // Prepare template variables
            const variables: Record<string, any> = {
              clientName: prospect.name,
              organizationName: prospect.company || prospect.name,
              websiteUrl: prospect.websiteUrl || "their website",
              city: prospect.city || "",
              state: prospect.state || "",
              category: prospect.category || "",
            };

            // Render template
            const rendered = renderTemplate(
              template.subject,
              template.htmlContent,
              template.textContent,
              variables
            );

            // Send email
            if (prospect.email) {
              await sendEmail({
                to: prospect.email,
                subject: rendered.subject,
                html: rendered.html,
                text: rendered.text || undefined,
              });
              emailSent = true;
            }
          }
        } else if (customEmail) {
          // Use custom email
          if (prospect.email) {
            await sendEmail({
              to: prospect.email,
              subject: customEmail.subject || "Reaching out from SeeZee Studio",
              html: customEmail.body || customEmail.html,
              text: customEmail.text,
            });
            emailSent = true;
          }
        }

        // Update lead with email tracking
        if (emailSent) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              status: LeadStatus.CONTACTED,
              emailsSent: 1,
              lastEmailSentAt: new Date(),
              lastContactedAt: new Date(),
            },
          });
        }
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      emailSent,
      message: "Prospect converted to lead successfully",
    });
  } catch (error: any) {
    console.error("Reachout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert prospect to lead" },
      { status: 500 }
    );
  }
}

