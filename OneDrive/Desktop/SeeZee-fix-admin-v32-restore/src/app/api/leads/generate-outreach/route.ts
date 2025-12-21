import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const OUTREACH_SYSTEM_PROMPT = `You are an outreach specialist for SeeZee Studio, a Louisville, Kentucky-based web development agency specializing in accessible websites for nonprofits and community organizations.

Your task is to write a personalized cold outreach email to a nonprofit organization.

## ABOUT SEEZEE STUDIO
- Founded by Sean McCulloch and Zach Robards
- Focus: Accessible, beautiful websites for nonprofits and local businesses
- Location: Louisville, Kentucky
- Core value: Making professional web presence affordable for organizations doing good

## WHAT SEEZEE OFFERS
- Custom website design and development
- WCAG AA+ accessibility compliance
- Starting at $599 for small nonprofits (40% nonprofit discount!)
- Maintenance plans from $150/month
- Fast turnaround (1-4 weeks depending on scope)

## RECENT WORK EXAMPLES
- A Vision For You (AVFY): Recovery community platform with meeting finder
- Big Red Bus: Mental health resource directory for Louisville

## EMAIL GUIDELINES
1. Keep it under 150 words
2. Be genuine and warm, not salesy or pushy
3. Focus on THEIR mission, not just what you sell
4. Mention something specific about their organization or situation
5. Provide a clear but soft call-to-action (offer a free consultation)
6. Sign off as Sean McCulloch, SeeZee Studio

## OUTPUT FORMAT
Return JSON with this structure:
{
  "subject": "Email subject line",
  "body": "Full email body text"
}`;

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    // Fetch lead data
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check for Anthropic API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return a fallback template
      return NextResponse.json(getFallbackEmail(lead));
    }

    // Build context about the lead
    const leadContext = `
Organization: ${lead.name || lead.company || "Unknown Organization"}
Category: ${lead.category || "Nonprofit"}
Location: ${[lead.city, lead.state].filter(Boolean).join(", ") || "Unknown"}
Annual Revenue: ${lead.annualRevenue ? `$${lead.annualRevenue.toLocaleString()}` : "Unknown"}
Employee Count: ${lead.employeeCount || "Unknown"}
Website Status: ${
      !lead.hasWebsite
        ? "No website found - they need one!"
        : lead.websiteQuality === "POOR"
        ? "Has a poor quality website with issues"
        : lead.websiteQuality === "FAIR"
        ? "Has a fair website that could be improved"
        : "Has a website"
    }
${lead.needsAssessment ? `Website Issues: ${JSON.stringify(lead.needsAssessment)}` : ""}
Contact Email: ${lead.email || "Not available"}
Contact Name: ${lead.name || "Unknown"}

Generate a personalized outreach email for this organization. Focus on their specific situation (${!lead.hasWebsite ? "no website" : "website needs improvement"}) and category (${lead.category || "nonprofit"}).
`;

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: OUTREACH_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: leadContext,
        },
      ],
    });

    // Parse response
    const content = response.content[0].type === "text" ? response.content[0].text : "";
    
    try {
      // Try to parse as JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const emailData = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          subject: emailData.subject,
          body: emailData.body,
        });
      }
    } catch {
      // If JSON parsing fails, return content as body
    }

    // Fallback: use content as body with generated subject
    return NextResponse.json({
      subject: `Helping ${lead.name || lead.company || "your organization"} reach more people online`,
      body: content,
    });

  } catch (error) {
    console.error("Generate outreach error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}

function getFallbackEmail(lead: any) {
  const orgName = lead.name || lead.company || "your organization";
  const location = [lead.city, lead.state].filter(Boolean).join(", ");
  const hasNoWebsite = !lead.hasWebsite;

  const subject = hasNoWebsite
    ? `A website for ${orgName} - free consultation`
    : `Improving ${orgName}'s online presence`;

  let body: string;

  if (hasNoWebsite) {
    body = `Hi there,

I came across ${orgName}${location ? ` in ${location}` : ""} and was impressed by the work you do${lead.category ? ` in ${lead.category.toLowerCase()}` : ""}.

I noticed your organization doesn't currently have a website. As a Louisville-based web agency specializing in nonprofit platforms, I'd love to help you reach more people who need your services.

We recently built a platform for A Vision For You (AVFY) here in Louisville that significantly increased their community engagement.

Would you have 15 minutes this week for a quick call? I'd be happy to share some ideas - no obligation.

Best,
Sean McCulloch
SeeZee Studio
sean@see-zee.com
(502) 435-2986`;
  } else {
    body = `Hi there,

I came across ${orgName}${location ? ` in ${location}` : ""} and wanted to reach out.

I noticed a few opportunities to enhance your online presence - things like improving mobile responsiveness and accessibility that could help more people find and connect with your services.

We specialize in helping nonprofits like yours create accessible, modern websites. We offer a 40% discount for 501(c)(3) organizations.

Would you be open to a brief call to discuss some quick wins for your site?

Best,
Sean McCulloch
SeeZee Studio
sean@see-zee.com
(502) 435-2986`;
  }

  return { subject, body };
}
