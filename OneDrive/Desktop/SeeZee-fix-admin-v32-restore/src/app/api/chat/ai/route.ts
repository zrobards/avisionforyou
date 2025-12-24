import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/ai/build-system-prompt";

interface ChatHistory {
  role: "user" | "assistant";
  content: string;
}

interface PageContext {
  url: string;
  title: string;
  headings: string[];
  links: Array<{ text: string; href: string }>;
  mainContent: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, leadInfo, pageContext, pageContextText, history } = body as {
      message: string;
      conversationId?: string;
      leadInfo?: { name?: string; email?: string };
      pageContext?: PageContext;
      pageContextText?: string;
      history?: ChatHistory[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if Anthropic API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return a helpful fallback response
      return NextResponse.json({
        content: getFallbackResponse(message),
        conversationId: conversationId || `local-${Date.now()}`,
        quickActions: getQuickActions(message),
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey });

    // Build conversation history for context
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
    
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-8)) {
        if (h.role && h.content) {
          messages.push({
            role: h.role as "user" | "assistant",
            content: h.content,
          });
        }
      }
    }

    // Build user message with page context
    let userMessage = leadInfo?.name 
      ? `[User: ${leadInfo.name}${leadInfo.email ? `, ${leadInfo.email}` : ""}] ${message}`
      : message;

    // Add page context if available
    if (pageContextText) {
      userMessage = `${pageContextText}\n\nUser's question: ${message}`;
    }

    messages.push({
      role: "user",
      content: userMessage,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: buildSystemPrompt(),
      messages,
    });

    const aiContent = response.content[0].type === "text" 
      ? response.content[0].text 
      : "I'm having trouble responding right now.";

    // Get or create conversation record
    let convId = conversationId;
    if (!convId) {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const conversation = await prisma.aIConversation.create({
        data: {
          sessionId,
          visitorName: leadInfo?.name,
          visitorEmail: leadInfo?.email,
          status: "ACTIVE",
          intent: detectIntent(message),
          source: req.headers.get("referer") || undefined,
        },
      });
      convId = conversation.id;
    }

    // Save messages to database
    await prisma.aIMessage.createMany({
      data: [
        {
          conversationId: convId,
          role: "USER",
          content: message,
        },
        {
          conversationId: convId,
          role: "ASSISTANT",
          content: aiContent,
          modelUsed: "claude-sonnet-4-20250514",
          tokens: response.usage?.output_tokens,
        },
      ],
    });

    // Update conversation
    await prisma.aIConversation.update({
      where: { id: convId },
      data: {
        updatedAt: new Date(),
        intent: detectIntent(message),
      },
    });

    // Extract any links from the AI response for potential navigation
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: Array<{ text: string; href: string }> = [];
    let match;
    while ((match = linkRegex.exec(aiContent)) !== null) {
      links.push({
        text: match[1],
        href: match[2],
      });
    }

    return NextResponse.json({
      content: aiContent,
      conversationId: convId,
      quickActions: getQuickActions(message),
      links: links.length > 0 ? links : undefined,
      pageContext: pageContext ? {
        url: pageContext.url,
        availableLinks: pageContext.links,
      } : undefined,
    });

  } catch (error) {
    console.error("AI Chat error:", error);
    
    // Return fallback response on error
    const body = await req.clone().json().catch(() => ({}));
    return NextResponse.json({
      content: getFallbackResponse(body.message || ""),
      conversationId: body.conversationId || `error-${Date.now()}`,
      quickActions: ["Pricing", "Services", "Contact"],
    });
  }
}

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.match(/price|cost|how much|budget|afford|pricing/)) return "pricing";
  if (lower.match(/portfolio|examples|past work|show me|work/)) return "portfolio";
  if (lower.match(/contact|call|email|talk|human|person|schedule/)) return "contact";
  if (lower.match(/start|begin|get started|new project/)) return "get_started";
  if (lower.match(/maintain|support|update|monthly/)) return "maintenance";
  if (lower.match(/nonprofit|501c3|charity|donation/)) return "nonprofit";
  if (lower.match(/timeline|how long|when|deadline|fast/)) return "timeline";
  
  return "general";
}

function getQuickActions(message: string): string[] {
  const intent = detectIntent(message);
  
  const actions: Record<string, string[]> = {
    pricing: ["Services", "Contact", "Get Started"],
    portfolio: ["Pricing", "Contact", "Get Started"],
    contact: ["Pricing", "Services", "Get Started"],
    get_started: ["Pricing", "Services", "Contact"],
    maintenance: ["Pricing", "Contact", "Get Started"],
    nonprofit: ["Pricing", "Services", "Contact"],
    timeline: ["Pricing", "Contact", "Get Started"],
    general: ["Pricing", "Services", "Contact"],
  };
  
  return actions[intent] || actions.general;
}

function getFallbackResponse(message: string): string {
  const intent = detectIntent(message);
  
  const responses: Record<string, string> = {
    pricing: `Great question about pricing! Here's what SeeZee offers:

• **Starter Package**: $599 (3-5 pages)
• **Growth Package**: $1,499 (7-10 pages)
• **Pro Package**: $2,999 (unlimited pages, custom features)

**Nonprofits get 40% off!**

Would you like to schedule a free consultation to discuss your specific needs?`,

    portfolio: `SeeZee has worked with some amazing clients! Some recent projects include:

• **A Vision For You (AVFY)** - Recovery community platform
• **Big Red Bus** - Mental health resource directory
• Various nonprofit and small business websites

Check out our full portfolio at **/portfolio**, or let me know what kind of project you're thinking about!`,

    contact: `I'd love to connect you with our team! Here are your options:

• **Email**: sean@see-zee.com
• **Schedule a call**: Visit /contact
• **Start a project**: Visit /start

The team typically responds within 24 hours. Is there anything else I can help with in the meantime?`,

    get_started: `Awesome! Here's how to get started with SeeZee:

1. **Fill out our quick questionnaire** at /start
2. We'll review and send you a custom proposal
3. Once approved, we'll kick off your project!

The whole process takes about 15 minutes. Ready to begin?`,

    nonprofit: `SeeZee loves working with nonprofits!

We offer a **40% discount** on all packages for 501(c)(3) organizations. That means:
• Starter: **$359** (instead of $599)
• Growth: **$899** (instead of $1,499)
• Pro: **$1,799** (instead of $2,999)

What kind of nonprofit work does your organization do?`,

    timeline: `Here are typical project timelines:

• **Starter sites**: 1-2 weeks
• **Growth sites**: 2-3 weeks
• **Pro/custom sites**: 4-6 weeks

Need it faster? We offer rush delivery for an additional fee. When are you hoping to launch?`,

    maintenance: `SeeZee offers ongoing maintenance plans starting at **$150/month**:

• Regular security updates
• Content changes (2-5 per month depending on plan)
• Uptime monitoring
• Priority support

Already have a website that needs care? Let me know more about it!`,

    general: `Hey there! I'm SeeZee's AI assistant. I can help you with:

• **Pricing** for websites and apps
• **Portfolio** examples of our work
• **Getting started** on your project

What would you like to know more about?`,
  };
  
  return responses[intent] || responses.general;
}

