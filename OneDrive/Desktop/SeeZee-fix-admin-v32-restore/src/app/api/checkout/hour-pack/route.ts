import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Hour pack definitions (must match frontend)
const HOUR_PACKS = {
  SMALL: {
    name: 'Starter Pack',
    hours: 5,
    price: 35000, // $350 in cents
    expirationDays: 60,
  },
  MEDIUM: {
    name: 'Growth Pack',
    hours: 10,
    price: 65000, // $650 in cents
    expirationDays: 90,
  },
  LARGE: {
    name: 'Scale Pack',
    hours: 20,
    price: 120000, // $1200 in cents
    expirationDays: 120,
  },
  PREMIUM: {
    name: 'Premium Reserve',
    hours: 10,
    price: 85000, // $850 in cents
    expirationDays: null, // Never expires
  },
};

// Handle GET requests (browser navigation or direct URL access)
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST to create a checkout session.' },
    { status: 405 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      console.error('[Hour Pack Checkout] No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { packId, projectId } = body;

    if (!packId || !HOUR_PACKS[packId as keyof typeof HOUR_PACKS]) {
      return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
    }

    const pack = HOUR_PACKS[packId as keyof typeof HOUR_PACKS];

    // Get user's organization - try by ID first, then by email as fallback
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  take: 1,
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    // Fallback: try to find user by email if ID lookup fails
    if (!user && session.user.email) {
      console.warn(`[Hour Pack Checkout] User not found by ID ${session.user.id}, trying email ${session.user.email}`);
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          organizations: {
            include: {
              organization: {
                include: {
                  projects: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!user) {
      console.error('[Hour Pack Checkout] User not found in database', {
        userId: session.user.id,
        email: session.user.email,
      });
      return NextResponse.json(
        { 
          error: 'User not found',
          message: 'Your account may not be fully set up. Please contact support if this issue persists.',
        },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | null = null;
    const userOrg = user.organizations[0]?.organization;

    if (userOrg?.stripeCustomerId) {
      stripeCustomerId = userOrg.stripeCustomerId;
    } else if (userOrg) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
          organizationId: userOrg.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update organization with Stripe customer ID
      await prisma.organization.update({
        where: { id: userOrg.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create Stripe checkout session
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId || undefined,
      customer_email: !stripeCustomerId ? session.user.email || undefined : undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hour Pack - ${pack.name}`,
              description: `${pack.hours} support hours${pack.expirationDays ? ` (valid for ${pack.expirationDays} days)` : ' (never expires)'}`,
              metadata: {
                type: 'hour-pack',
                packId,
                hours: pack.hours.toString(),
                expirationDays: pack.expirationDays?.toString() || 'never',
              },
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/hours/success?pack=${packId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/hours?canceled=true`,
      metadata: {
        type: 'hour-pack',
        packId,
        hours: pack.hours.toString(),
        expirationDays: pack.expirationDays?.toString() || 'never',
        userId: session.user.id,
        organizationId: userOrg?.id || '',
        projectId: projectId || '',
      },
    });
    } catch (stripeError: any) {
      console.error('[Hour Pack Checkout] Stripe error:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
      });
      
      // Handle invalid API key error
      if (stripeError.type === 'StripeAuthenticationError' || stripeError.code === 'api_key_expired') {
        return NextResponse.json(
          { 
            error: 'Payment system configuration error',
            message: 'The payment system is not properly configured. Please contact support.',
          },
          { status: 500 }
        );
      }
      
      // Handle other Stripe errors
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session',
          message: stripeError.message || 'Payment processing error. Please try again or contact support.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: any) {
    console.error('[Hour Pack Checkout Error]', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        message: 'An unexpected error occurred. Please try again or contact support.',
      },
      { status: 500 }
    );
  }
}
