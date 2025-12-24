import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful AI assistant for SeeZee Studio, a Louisville-based web development agency founded by two high school students, Sean and Zach. SeeZee specializes in:

- Accessible websites for nonprofits and community organizations
- Mental health and healthcare organization platforms
- Custom web applications
- Maintenance and support plans

SERVICES & PRICING:
- Starter Package: $2,500-5,000 (5-page website, 2-3 weeks)
- Business Package: $5,000-10,000 (custom platform, 4-6 weeks)
- Enterprise: $10,000+ (complex applications, 8+ weeks)
- Maintenance: $150-750/month depending on tier

RECENT WORK:
- A Vision For You Recovery: Full nonprofit platform with donation system (avfyrecovery.org)
- Big Red Bus: Community discovery platform (FBLA project)

YOUR ROLE:
1. Answer questions about SeeZee's services, process, and portfolio
2. Qualify leads by asking about their organization, goals, budget, and timeline
3. Capture contact information when appropriate (name, email, phone)
4. Schedule discovery calls when the visitor is interested
5. Be warm, professional, and helpful - not pushy or salesy

IMPORTANT BEHAVIORS:
- Keep responses concise (2-3 sentences typically)
- Ask one question at a time to qualify the lead
- If someone asks technical questions you can't answer, offer to connect them with the team
- If someone is clearly interested in a project, ask for their email to send more info
- Mention that SeeZee was founded by students when relevant - it's a unique differentiator

LEAD QUALIFICATION QUESTIONS (ask naturally, not all at once):
- What type of organization are you? (nonprofit, business, personal)
- Do you have an existing website?
- What are your main goals for the project?
- What's your timeline?
- What's your approximate budget?

When someone provides contact info or wants to talk to a human, you should acknowledge it and let them know the team will reach out soon.`;

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "Session ID and message are required" },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation = await db.aIConversation.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20, // Limit context to last 20 messages
        },
      },
    });

    if (!conversation) {
      conversation = await db.aIConversation.create({
        data: {
          sessionId,
          source: request.headers.get("referer") || "unknown",
          status: "ACTIVE",
        },
        include: { messages: true },
      });
    }

    // Save user message
    await db.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: message,
      },
    });

    // Build message history for Claude
    const conversationHistory = conversation.messages.map((msg) => ({
      role: msg.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

    // Add current message
    conversationHistory.push({ role: "user", content: message });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: conversationHistory,
    });

    const aiResponse =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Save AI response
    await db.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: aiResponse,
        modelUsed: "claude-sonnet-4-20250514",
        tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    });

    // Extract lead info if present
    const leadInfo = extractLeadInfo(message);
    if (Object.keys(leadInfo).length > 0) {
      await db.aIConversation.update({
        where: { id: conversation.id },
        data: leadInfo,
      });
    }

    // Detect if human handoff is needed
    const needsHuman = detectHandoffIntent(message, aiResponse);
    if (needsHuman) {
      await db.aIConversation.update({
        where: { id: conversation.id },
        data: { status: "WAITING_FOR_HUMAN" },
      });

      // Could send notification here
      await notifyTeam(conversation.id, message);
    }

    // Update intent classification
    const intent = classifyIntent(message);
    if (intent) {
      await db.aIConversation.update({
        where: { id: conversation.id },
        data: { intent },
      });
    }

    return NextResponse.json({
      message: aiResponse,
      needsHuman,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message:
          "I'm having trouble connecting right now. Please try again or email us at seezee.enterprises@gmail.com.",
        needsHuman: false,
      },
      { status: 200 } // Return 200 to show the error message in chat
    );
  }
}

function extractLeadInfo(message: string): Partial<{
  visitorEmail: string;
  visitorPhone: string;
  visitorName: string;
}> {
  const info: any = {};

  // Extract email
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) info.visitorEmail = emailMatch[0];

  // Extract phone
  const phoneMatch = message.match(
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  );
  if (phoneMatch) info.visitorPhone = phoneMatch[0];

  // Extract name (simple heuristic)
  const namePatterns = [
    /my name is (\w+(?:\s+\w+)?)/i,
    /I'm (\w+(?:\s+\w+)?)/i,
    /this is (\w+(?:\s+\w+)?)/i,
  ];
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match) {
      info.visitorName = match[1];
      break;
    }
  }

  return info;
}

function detectHandoffIntent(userMessage: string, aiResponse: string): boolean {
  const handoffPhrases = [
    "talk to a human",
    "speak with someone",
    "talk to a person",
    "speak with a person",
    "call me",
    "schedule a call",
    "want to discuss",
    "ready to start",
    "ready to get started",
    "sign up",
    "let's do it",
    "interested in hiring",
  ];

  const combined = (userMessage + " " + aiResponse).toLowerCase();
  return handoffPhrases.some((phrase) => combined.includes(phrase));
}

function classifyIntent(message: string): string | null {
  const lower = message.toLowerCase();

  if (
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("how much") ||
    lower.includes("budget")
  ) {
    return "pricing";
  }
  if (
    lower.includes("portfolio") ||
    lower.includes("work") ||
    lower.includes("example") ||
    lower.includes("projects")
  ) {
    return "portfolio";
  }
  if (
    lower.includes("timeline") ||
    lower.includes("how long") ||
    lower.includes("when can")
  ) {
    return "timeline";
  }
  if (
    lower.includes("support") ||
    lower.includes("help") ||
    lower.includes("issue") ||
    lower.includes("problem")
  ) {
    return "support";
  }
  if (
    lower.includes("nonprofit") ||
    lower.includes("non-profit") ||
    lower.includes("501c3")
  ) {
    return "nonprofit";
  }
  if (lower.includes("maintenance") || lower.includes("monthly")) {
    return "maintenance";
  }

  return null;
}

async function notifyTeam(conversationId: string, lastMessage: string) {
  // In production, send email or Slack notification
  console.log(`[HANDOFF REQUEST] Conversation ${conversationId}: ${lastMessage}`);
  
  // Could use Resend to send email:
  // await resend.emails.send({
  //   from: 'SeeZee Bot <bot@see-zee.com>',
  //   to: 'seezee.enterprises@gmail.com',
  //   subject: '🚨 Chat Handoff Request',
  //   html: `A visitor wants to speak with someone. <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/chat/${conversationId}">View Conversation</a>`
  // });
}







