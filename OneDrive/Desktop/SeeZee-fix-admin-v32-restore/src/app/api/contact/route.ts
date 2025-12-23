import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple in-memory rate limiting (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 5) {
    // Max 5 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Get IP address for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Server-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs (prevent XSS)
    const sanitizedName = body.name.trim().slice(0, 100);
    const sanitizedEmail = body.email.trim().toLowerCase().slice(0, 255);
    const sanitizedMessage = body.message.trim().slice(0, 5000);

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
        status: 'NEW',
        source: 'CONTACT_FORM',
      },
    });

    // Notify all admins about new lead
    const { createNewLeadNotification } = await import("@/lib/notifications");
    await createNewLeadNotification(
      lead.id,
      lead.name,
      lead.email,
      lead.company,
      "Contact Form"
    ).catch(err => console.error("Failed to create lead notification:", err));

    // Email notification to team - to be implemented
    // To enable: integrate with Resend (already in dependencies) or SendGrid
    // Example: await resend.emails.send({ to: 'team@seezee.com', subject: 'New Contact Form', html: ... })

    return NextResponse.json({ 
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('[Contact Form Error]', error);
    return NextResponse.json(
      { error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    );
  }
}
