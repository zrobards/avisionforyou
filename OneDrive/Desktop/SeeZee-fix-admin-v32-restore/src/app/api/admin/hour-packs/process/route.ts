import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { stripe } from "@/lib/stripe";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF"];

/**
 * POST /api/admin/hour-packs/process
 * Manually process a failed hour pack purchase by Stripe session ID or payment intent ID
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId, paymentIntentId } = body;

    if (!sessionId && !paymentIntentId) {
      return NextResponse.json(
        { error: "Either sessionId or paymentIntentId is required" },
        { status: 400 }
      );
    }

    // Get Stripe session
    let stripeSession;
    if (sessionId) {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } else if (paymentIntentId) {
      // Find session by payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });
      if (sessions.data.length === 0) {
        return NextResponse.json(
          { error: "No checkout session found for this payment intent" },
          { status: 404 }
        );
      }
      stripeSession = sessions.data[0];
    }

    if (!stripeSession) {
      return NextResponse.json(
        { error: "Stripe session not found" },
        { status: 404 }
      );
    }

    // Check if this is an hour pack purchase
    if (stripeSession.metadata?.type !== 'hour-pack') {
      return NextResponse.json(
        { error: "This is not an hour pack purchase" },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Payment status is ${stripeSession.payment_status}, not paid` },
        { status: 400 }
      );
    }

    // Check if already processed
    const paymentIntentIdStr = typeof stripeSession.payment_intent === 'string' 
      ? stripeSession.payment_intent 
      : null;

    if (paymentIntentIdStr) {
      const existingPack = await prisma.hourPack.findFirst({
        where: { stripePaymentId: paymentIntentIdStr },
      });

      if (existingPack) {
        return NextResponse.json({
          success: true,
          message: "Hour pack already processed",
          hourPack: existingPack,
        });
      }
    }

    // Process the purchase using the same logic as the webhook
    const metadata = stripeSession.metadata || {};
    const packId = metadata.packId;
    const userId = metadata.userId;
    const organizationId = metadata.organizationId;

    if (!packId || !userId) {
      return NextResponse.json(
        { error: "Missing required metadata (packId or userId)" },
        { status: 400 }
      );
    }

    // Get pack details
    const packDetails = {
      SMALL: { hours: 5, expirationDays: 60 },
      MEDIUM: { hours: 10, expirationDays: 90 },
      LARGE: { hours: 20, expirationDays: 120 },
      PREMIUM: { hours: 10, expirationDays: null },
    };

    const pack = packDetails[packId as keyof typeof packDetails];
    if (!pack) {
      return NextResponse.json(
        { error: `Invalid pack ID: ${packId}` },
        { status: 400 }
      );
    }

    // Get user and organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          where: organizationId ? { id: organizationId } : undefined,
          include: {
            organization: {
              include: {
                projects: {
                  include: {
                    maintenancePlanRel: {
                      where: { status: 'ACTIVE' },
                    },
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User not found: ${userId}` },
        { status: 404 }
      );
    }

    // Find or create maintenance plan
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

    if (!maintenancePlan && organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          projects: {
            include: {
              maintenancePlanRel: {
                where: { status: 'ACTIVE' },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (org?.projects[0]?.maintenancePlanRel) {
        maintenancePlan = org.projects[0].maintenancePlanRel;
      }
    }

    // Create maintenance plan if needed
    if (!maintenancePlan) {
      const org = organizationId 
        ? await prisma.organization.findUnique({ where: { id: organizationId } })
        : user.organizations[0]?.organization;

      if (!org) {
        return NextResponse.json(
          { error: "No organization found" },
          { status: 404 }
        );
      }

      const project = await prisma.project.findFirst({
        where: { organizationId: org.id },
        orderBy: { createdAt: 'desc' },
      });

      if (!project) {
        return NextResponse.json(
          { error: "No project found for organization" },
          { status: 404 }
        );
      }

      let existingPlan = await prisma.maintenancePlan.findUnique({
        where: { projectId: project.id },
      });

      if (!existingPlan) {
        existingPlan = await prisma.maintenancePlan.create({
          data: {
            projectId: project.id,
            tier: 'ESSENTIALS',
            monthlyPrice: new Prisma.Decimal(50000),
            status: 'ACTIVE',
            billingDay: 1,
          },
        });
      } else if (existingPlan.status !== 'ACTIVE') {
        existingPlan = await prisma.maintenancePlan.update({
          where: { id: existingPlan.id },
          data: { status: 'ACTIVE' },
        });
      }

      maintenancePlan = existingPlan;
    }

    // Calculate expiration date
    const expiresAt = pack.expirationDays
      ? new Date(Date.now() + pack.expirationDays * 24 * 60 * 60 * 1000)
      : null;

    const amountTotal = stripeSession.amount_total || 0;

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
        stripePaymentId: paymentIntentIdStr,
        isActive: true,
      },
    });

    // Create finance transaction
    const org = organizationId 
      ? await prisma.organization.findUnique({ where: { id: organizationId } })
      : user.organizations[0]?.organization;

    if (org) {
      const project = await prisma.project.findFirst({
        where: { organizationId: org.id },
        orderBy: { createdAt: 'desc' },
      });

      await prisma.financeTransaction.create({
        data: {
          organizationId: org.id,
          projectId: project?.id || null,
          type: 'ADDON_SERVICE',
          amount: amountTotal,
          currency: 'USD',
          status: 'PAID',
          stripePaymentId: paymentIntentIdStr,
          stripeInvoiceId: stripeSession.invoice as string | null,
          paymentMethod: 'card',
          description: `Hour Pack Purchase - ${pack.hours} hours (${packId})`,
          paidAt: new Date(),
          metadata: {
            hourPackId: hourPack.id,
            packType: packId,
            hours: pack.hours,
            expirationDays: pack.expirationDays,
            processedManually: true,
            processedBy: session.user.id,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Hour pack processed successfully",
      hourPack: {
        id: hourPack.id,
        packType: hourPack.packType,
        hours: hourPack.hours,
        hoursRemaining: hourPack.hoursRemaining,
        cost: hourPack.cost,
        purchasedAt: hourPack.purchasedAt,
        expiresAt: hourPack.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("Error processing hour pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process hour pack" },
      { status: 500 }
    );
  }
}





