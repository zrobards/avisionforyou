import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@/auth';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'CEO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, purpose, targetAudience, tone, templateName } = await req.json();

    const systemPrompt = `You are an email copywriter for SeeZee Studio, a web development agency.

Generate professional email templates with variable placeholders.

VARIABLE FORMAT: Use {{variableName}} for dynamic content
COMMON VARIABLES: {{clientName}}, {{organizationName}}, {{projectName}}, {{amount}}, {{dueDate}}, {{teamMember}}, {{websiteUrl}}, {{invoiceNumber}}

OUTPUT FORMAT:
Subject: [subject line with variables]

[Email body in HTML with variables]

Variables Used: [comma-separated list]

GUIDELINES:
- Keep emails concise (under 200 words)
- Professional but warm tone
- Clear call-to-action
- Use HTML for formatting (paragraphs, bold, links)
- Include SeeZee branding signature`;

    const userPrompt = `Generate email template:

Template Name: ${templateName}
Category: ${category}
Purpose: ${purpose}
Target Audience: ${targetAudience}
Tone: ${tone}

Create a complete, professional email template.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const result = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse result
    const subjectMatch = result.match(/Subject:\s*(.+)/i);
    const variablesMatch = result.match(/Variables Used:\s*(.+)/i);
    
    const subject = subjectMatch ? subjectMatch[1].trim() : '';
    const variablesLine = variablesMatch ? variablesMatch[1].trim() : '';
    const variables = variablesLine.split(',').map((v: string) => v.trim().replace(/[{}]/g, ''));

    // Extract body (everything between subject and variables)
    let body = result
      .replace(/Subject:.*\n/i, '')
      .replace(/Variables Used:.*$/i, '')
      .trim();

    return NextResponse.json({
      success: true,
      subject,
      body,
      variables,
      category,
      name: templateName
    });

  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json({ 
      error: 'Failed to generate template' 
    }, { status: 500 });
  }
}
