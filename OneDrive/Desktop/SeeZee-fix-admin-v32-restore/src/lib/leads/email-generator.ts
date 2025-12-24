/**
 * Email generation utilities for prospect outreach
 * This file provides helper functions for email generation
 */

import Anthropic from '@anthropic-ai/sdk';
import { Prospect } from '@prisma/client';

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
- Starting at $2,499 for small nonprofits (nonprofit discount)
- Maintenance plans from $150/month
- Fast turnaround (1-4 weeks depending on scope)

## RECENT WORK EXAMPLES
- A Vision For You (AVFY): Recovery community platform with meeting finder
- Big Red Bus: Mental health resource directory for Louisville

## EMAIL GUIDELINES
1. Keep it under 200 words
2. Be genuine and warm, not salesy or pushy
3. Focus on THEIR mission, not just what you sell
4. Mention something specific about their organization or situation
5. Reference their Google rating/reviews if impressive
6. Mention specific opportunities from AI analysis
7. Provide a clear but soft call-to-action (offer a free 15-minute consultation)
8. Sign off as Sean McCulloch, SeeZee Studio, with contact info

## OUTPUT FORMAT
Return JSON with this structure:
{
  "subject": "Email subject line",
  "body": "Full email body text"
}`;

export interface EmailDraft {
  subject: string;
  body: string;
}

/**
 * Generate personalized email for a prospect using Claude AI
 */
export async function generateProspectEmail(prospect: Prospect): Promise<EmailDraft> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  // Build context about the prospect
  const aiAnalysis = prospect.aiAnalysis as any;
  const opportunities = prospect.opportunities || [];
  const redFlags = prospect.redFlags || [];

  const prospectContext = `
Organization: ${prospect.name || prospect.company || 'Unknown Organization'}
Category: ${prospect.category || 'Nonprofit'}
Location: ${[prospect.city, prospect.state].filter(Boolean).join(', ') || 'Unknown'}
Google Rating: ${prospect.googleRating ? `${prospect.googleRating} stars` : 'N/A'} (${prospect.googleReviews || 0} reviews)
Annual Revenue: ${prospect.annualRevenue ? `$${prospect.annualRevenue.toLocaleString()}` : 'Unknown'}
Employee Count: ${prospect.employeeCount || 'Unknown'}
Website Status: ${
    !prospect.hasWebsite
      ? 'No website found - they need one!'
      : prospect.websiteQuality === 'POOR'
      ? 'Has a poor quality website with issues'
      : prospect.websiteQuality === 'FAIR'
      ? 'Has a fair website that could be improved'
      : 'Has a website'
  }
Website URL: ${prospect.websiteUrl || 'None'}
Lead Score: ${prospect.leadScore}/100
Urgency Level: ${prospect.urgencyLevel || 'MEDIUM'}
${opportunities.length > 0 ? `Opportunities: ${opportunities.join(', ')}` : ''}
${redFlags.length > 0 ? `Red Flags: ${redFlags.join(', ')}` : ''}
${aiAnalysis?.reasoning ? `AI Reasoning: ${aiAnalysis.reasoning}` : ''}
${aiAnalysis?.contactStrategy ? `Recommended Approach: ${aiAnalysis.contactStrategy}` : ''}
${aiAnalysis?.estimatedBudget ? `Estimated Budget: ${aiAnalysis.estimatedBudget}` : ''}
Contact Email: ${prospect.email || 'Not available'}
Contact Name: ${prospect.name || 'Unknown'}

Generate a personalized outreach email for this organization. Focus on their specific situation and mention:
1. Their Google rating/reviews if impressive (${prospect.googleRating && prospect.googleRating >= 4 ? 'they have great reviews' : ''})
2. Specific opportunities: ${opportunities.slice(0, 2).join(' and ')}
3. Your local Louisville connection
4. Your recent work with AVFY or similar nonprofits
5. Offer a free 15-minute consultation
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: OUTREACH_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: prospectContext,
      },
    ],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';

  let subject = `Helping ${prospect.name || prospect.company || 'your organization'} reach more people online`;
  let body = content;

  try {
    // Try to parse as JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const emailData = JSON.parse(jsonMatch[0]);
      subject = emailData.subject || subject;
      body = emailData.body || body;
    }
  } catch {
    // If JSON parsing fails, use content as body
  }

  // Ensure body includes signature
  if (!body.includes('Sean McCulloch') && !body.includes('SeeZee Studio')) {
    body += `\n\nBest regards,\nSean McCulloch\nSeeZee Studio\nLouisville, KY\n(502) 435-2986\nsean@see-zee.com`;
  }

  return { subject, body };
}

/**
 * Fallback email template when AI is unavailable
 */
export function getFallbackEmail(prospect: Prospect): EmailDraft {
  const orgName = prospect.name || prospect.company || 'your organization';
  const location = [prospect.city, prospect.state].filter(Boolean).join(', ');
  const hasNoWebsite = !prospect.hasWebsite;
  const googleRating = prospect.googleRating;
  const googleReviews = prospect.googleReviews;

  const subject = hasNoWebsite
    ? `A website for ${orgName} - free consultation`
    : `Improving ${orgName}'s online presence`;

  let body: string;

  if (hasNoWebsite) {
    body = `Hi there,

I came across ${orgName}${location ? ` in ${location}` : ''}${googleRating && googleRating >= 4 ? ` and was impressed by your ${googleRating}-star rating with ${googleReviews} reviews` : ''}${prospect.category ? ` - clearly you're making a real difference in ${prospect.category.toLowerCase()}` : ''}.

I noticed your organization doesn't currently have a website. As a Louisville-based web agency specializing in nonprofit platforms, I'd love to help you reach more people who need your services.

We recently built a platform for A Vision For You (AVFY) here in Louisville that significantly increased their community engagement. We offer accessible, professional websites starting at $2,499 (with our nonprofit discount).

Would you have 15 minutes this week for a quick call? I'd be happy to share some ideas - no obligation.

Best regards,
Sean McCulloch
SeeZee Studio
Louisville, KY
(502) 435-2986
sean@see-zee.com`;
  } else {
    body = `Hi there,

I came across ${orgName}${location ? ` in ${location}` : ''}${googleRating && googleRating >= 4 ? ` and was impressed by your ${googleRating}-star rating with ${googleReviews} reviews` : ''} and wanted to reach out.

I noticed a few opportunities to enhance your online presence - things like improving mobile responsiveness and accessibility that could help more people find and connect with your services.

We specialize in helping nonprofits like yours create accessible, modern websites. We offer a nonprofit discount and work with organizations of all sizes.

Would you be open to a brief call to discuss some quick wins for your site?

Best regards,
Sean McCulloch
SeeZee Studio
Louisville, KY
(502) 435-2986
sean@see-zee.com`;
  }

  return { subject, body };
}

