import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/client/hours/verify-pack-purchase
 * Manually verify and process an hour pack purchase from Stripe session
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify this is an hour pack purchase
    if (stripeSession.metadata?.type !== 'hour-pack') {
      return NextResponse.json(
        { error: 'This is not an hour pack purchase', sessionType: stripeSession.metadata?.type },
        { status: 400 }
      );
    }

    // Verify payment was successful
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed', paymentStatus: stripeSession.payment_status },
        { status: 400 }
      );
    }

    // Check if pack already exists
    const existingPack = await prisma.hourPack.findFirst({
      where: {
        OR: [
          { stripePaymentId: sessionId },
          ...(stripeSession.payment_intent && typeof stripeSession.payment_intent === 'string'
            ? [{ stripePaymentId: stripeSession.payment_intent }]
            : []),
        ],
      },
    });

    if (existingPack) {
      return NextResponse.json({
        success: true,
        message: 'Hour pack already exists',
        pack: {
          id: existingPack.id,
          packType: existingPack.packType,
          hours: existingPack.hours,
          hoursRemaining: existingPack.hoursRemaining,
          purchasedAt: existingPack.purchasedAt,
        },
      });
    }

    // Get pack details from metadata
    const metadata = stripeSession.metadata;
    const packId = metadata.packId;
    const userId = metadata.userId;

    if (!packId || !userId) {
      return NextResponse.json(
        { error: 'Missing required metadata (packId or userId)' },
        { status: 400 }
      );
    }

    // Verify user matches
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'User mismatch - this purchase belongs to a different user' },
        { status: 403 }
      );
    }

    // Pack details
    const packDetails: Record<string, { hours: number; expirationDays: number | null }> = {
      SMALL: { hours: 5, expirationDays: 60 },
      MEDIUM: { hours: 10, expirationDays: 90 },
      LARGE: { hours: 20, expirationDays: 120 },
      PREMIUM: { hours: 10, expirationDays: null },
    };

    const pack = packDetails[packId as keyof typeof packDetails];
    if (!pack) {
      return NextResponse.json({ error: `Invalid pack ID: ${packId}` }, { status: 400 });
    }

    // Find user's maintenance plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  include: {
                    maintenancePlanRel: {
                      where: {
                        status: 'ACTIVE',
                      },
                    },
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find active maintenance plan
    let maintenancePlan = null;
    for (const orgMember of user.organizations) {
      for (const project of orgMember.organization.projects) {
        if (project.maintenancePlanRel) {
          maintenancePlan = project.maintenancePlanRel;
          break;
        }
      }
      if (maintenancePlan) break;
    }

    if (!maintenancePlan) {
      return NextResponse.json(
        { error: 'No active maintenance plan found' },
        { status: 404 }
      );
    }

    // Calculate expiration date
    const expiresAt = pack.expirationDays
      ? new Date(Date.now() + pack.expirationDays * 24 * 60 * 60 * 1000)
      : null;

    const amountTotal = stripeSession.amount_total || 0;
    const paymentIntentId = typeof stripeSession.payment_intent === 'string'
      ? stripeSession.payment_intent
      : sessionId;

    // Create the hour pack
    const hourPack = await prisma.hourPack.create({
      data: {
        planId: maintenancePlan.id,
        packType: packId as any,
        hours: pack.hours,
        hoursRemaining: pack.hours,
        cost: amountTotal,
        purchasedAt: new Date(),
        expiresAt: expiresAt,
        neverExpires: pack.expirationDays === null,
        stripePaymentId: paymentIntentId,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Hour pack created successfully',
      pack: {
        id: hourPack.id,
        packType: hourPack.packType,
        hours: hourPack.hours,
        hoursRemaining: hourPack.hoursRemaining,
        purchasedAt: hourPack.purchasedAt,
        expiresAt: hourPack.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('[Verify Pack Purchase Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify pack purchase' },
      { status: 500 }
    );
  }
}




