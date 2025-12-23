import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientAccessContext } from "@/lib/client-access";
import { NONPROFIT_TIERS, getTier } from "@/lib/config/tiers";
import Stripe from "stripe";

/**
 * POST /api/client/maintenance-plans/update-tier
 * Update the tier of a maintenance plan (upgrade/downgrade)
 */
export async function POST(req: NextRequest) {
  try {
    // Validate environment and log debug info
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    console.log('[TIER UPDATE] Stripe key present:', Boolean(stripeSecretKey));
    console.log('[TIER UPDATE] Stripe key prefix:', stripeSecretKey?.slice(0, 7));
    
    if (!stripeSecretKey) {
      console.error('[TIER UPDATE] STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { 
          error: "Payment system not configured",
          details: process.env.NODE_ENV === 'development' ? "STRIPE_SECRET_KEY environment variable is missing" : undefined
        },
        { status: 500 }
      );
    }

    // Initialize Stripe after validation
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const session = await auth();
    if (!session?.user?.id) {
      console.error('[TIER UPDATE] No session or user ID');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.email) {
      console.error('[TIER UPDATE] No user email in session');
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Verify user exists in database - try by ID first, then email
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user && session.user.email) {
      console.warn(`[TIER UPDATE] User not found by ID ${session.user.id}, trying email ${session.user.email}`);
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!user) {
      console.error('[TIER UPDATE] User not found in database', {
        userId: session.user.id,
        email: session.user.email,
      });
      return NextResponse.json(
        { 
          error: "User not found",
          message: "Your account may not be fully set up. Please contact support if this issue persists.",
        },
        { status: 404 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (error: any) {
      console.error('[TIER UPDATE] Failed to parse request body:', error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { tier } = body;

    if (!tier || !['ESSENTIALS', 'DIRECTOR', 'COO'].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be ESSENTIALS, DIRECTOR, or COO" },
        { status: 400 }
      );
    }

    const tierConfig = NONPROFIT_TIERS[tier as keyof typeof NONPROFIT_TIERS];
    if (!tierConfig) {
      console.error(`[TIER UPDATE] Invalid tier configuration for tier: ${tier}`);
      return NextResponse.json({ error: "Invalid tier configuration" }, { status: 400 });
    }

    const identity = {
      userId: user.id,
      email: session.user.email,
    };

    // Get user's accessible projects
    let access;
    try {
      access = await getClientAccessContext(identity);
    } catch (error: any) {
      console.error('[TIER UPDATE] Failed to get client access context:', error);
      return NextResponse.json(
        { 
          error: "Failed to verify access",
          message: "Unable to verify your project access. Please contact support.",
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    if (access.organizationIds.length === 0 && access.leadProjectIds.length === 0) {
      return NextResponse.json(
        { error: "No accessible projects found" },
        { status: 404 }
      );
    }

    // Find the maintenance plan for the user's organization
    // Note: We don't filter by status since we check payment status via stripeSubscriptionId
    let maintenancePlan;
    try {
      maintenancePlan = await prisma.maintenancePlan.findFirst({
        where: {
          project: {
            OR: [
              { organizationId: { in: access.organizationIds } },
              { id: { in: access.leadProjectIds } },
            ],
          },
          // Don't filter by status - we'll check payment via stripeSubscriptionId
          // This allows us to find plans regardless of status
        },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
        },
      });
    } catch (error: any) {
      console.error('[TIER UPDATE] Database error finding maintenance plan:', error);
      return NextResponse.json(
        { 
          error: "Failed to find maintenance plan",
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    // If no maintenance plan exists, create one
    if (!maintenancePlan) {
      // Get the first accessible project
      let project;
      try {
        project = await prisma.project.findFirst({
          where: {
            OR: [
              { organizationId: { in: access.organizationIds } },
              { id: { in: access.leadProjectIds } },
            ],
          },
          include: {
            organization: true,
          },
        });
      } catch (error: any) {
        console.error('[TIER UPDATE] Database error finding project:', error);
        return NextResponse.json(
          { 
            error: "Failed to find project",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        );
      }

      if (!project) {
        return NextResponse.json(
          { error: "No accessible project found" },
          { status: 404 }
        );
      }

      if (!project.organization) {
        console.error('[TIER UPDATE] Project missing organization:', project.id);
        return NextResponse.json(
          { error: "Project organization not found" },
          { status: 500 }
        );
      }

      // Create a new maintenance plan with the selected tier
      // Status will be PAUSED until payment is complete (no stripeSubscriptionId = not paid)
      try {
        maintenancePlan = await prisma.maintenancePlan.create({
          data: {
            projectId: project.id,
            tier: tier,
            monthlyPrice: tierConfig.monthlyPrice,
            supportHoursIncluded: tierConfig.supportHoursIncluded,
            changeRequestsIncluded: tierConfig.changeRequestsIncluded,
            status: 'PAUSED', // Will be activated to ACTIVE after payment via webhook
          },
          include: {
            project: {
              include: {
                organization: true,
              },
            },
          },
        });
      } catch (error: any) {
        console.error('[TIER UPDATE] Database error creating maintenance plan:', error);
        return NextResponse.json(
          { 
            error: "Failed to create maintenance plan",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        );
      }
    } else {
      // Validate maintenance plan has required relations
      if (!maintenancePlan.project) {
        console.error('[TIER UPDATE] Maintenance plan missing project:', maintenancePlan.id);
        return NextResponse.json(
          { error: "Maintenance plan data is invalid" },
          { status: 500 }
        );
      }

      if (!maintenancePlan.project.organization) {
        console.error('[TIER UPDATE] Project missing organization:', maintenancePlan.project.id);
        return NextResponse.json(
          { error: "Project organization not found" },
          { status: 500 }
        );
      }

      // Check if tier is already set BEFORE any updates
      // If tier matches AND payment is complete, return early
      if (maintenancePlan.tier === tier && maintenancePlan.stripeSubscriptionId) {
        return NextResponse.json(
          { 
            error: "You are already on this tier",
            success: true,
            message: `You are already subscribed to ${tierConfig.name}`
          },
          { status: 400 }
        );
      }

      // If tier is changing, always require going through checkout
      // This ensures payment is collected upfront
      if (maintenancePlan.tier !== tier) {
        // Update tier in database first (will be confirmed after payment)
        // Cancel old subscription if it exists, then create new checkout
        if (maintenancePlan.stripeSubscriptionId) {
          // Cancel the old subscription
          try {
            await stripe.subscriptions.cancel(maintenancePlan.stripeSubscriptionId);
            console.log(`[TIER UPDATE] Cancelled old subscription ${maintenancePlan.stripeSubscriptionId} for tier switch`);
          } catch (error: any) {
            console.error('[TIER UPDATE] Failed to cancel old subscription:', error.message);
            // Continue anyway - we'll create a new checkout session
          }
        }
        
        // Update tier in database (without subscription - will be set after payment)
        try {
          await prisma.maintenancePlan.update({
            where: { id: maintenancePlan.id },
            data: {
              tier: tier,
              monthlyPrice: tierConfig.monthlyPrice,
              supportHoursIncluded: tierConfig.supportHoursIncluded,
              changeRequestsIncluded: tierConfig.changeRequestsIncluded,
              stripeSubscriptionId: null, // Clear old subscription ID
              status: 'PAUSED', // Will be activated after payment
            },
          });
          // Reload to get updated data
          maintenancePlan = await prisma.maintenancePlan.findUnique({
            where: { id: maintenancePlan.id },
            include: {
              project: {
                include: {
                  organization: true,
                },
              },
            },
          });
          if (!maintenancePlan) {
            return NextResponse.json(
              { error: "Failed to reload maintenance plan" },
              { status: 500 }
            );
          }
        } catch (error: any) {
          console.error('[TIER UPDATE] Database error updating maintenance plan:', error);
          return NextResponse.json(
            { 
              error: "Failed to update maintenance plan",
              details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
          );
        }
      } else if (!maintenancePlan.stripeSubscriptionId) {
        // Same tier but no payment - just update database values
        try {
          await prisma.maintenancePlan.update({
            where: { id: maintenancePlan.id },
            data: {
              monthlyPrice: tierConfig.monthlyPrice,
              supportHoursIncluded: tierConfig.supportHoursIncluded,
              changeRequestsIncluded: tierConfig.changeRequestsIncluded,
              status: 'PAUSED',
            },
          });
        } catch (error: any) {
          console.error('[TIER UPDATE] Database error updating maintenance plan:', error);
        }
      }
    }

    // If there's NO Stripe subscription, create a checkout session
    // This happens for: new plans, unpaid plans, or tier switches
    if (!maintenancePlan.stripeSubscriptionId) {
      // Get or create Stripe customer
      let stripeCustomerId = maintenancePlan.project.organization.stripeCustomerId || 
                            maintenancePlan.project.stripeCustomerId;

      if (!stripeCustomerId) {
        // Create Stripe customer
        let customer;
        try {
          customer = await stripe.customers.create({
            email: session.user.email,
            name: session.user.name || undefined,
            metadata: {
              userId: user.id,
              organizationId: maintenancePlan.project.organizationId,
              projectId: maintenancePlan.projectId,
              maintenancePlanId: maintenancePlan.id,
            },
          });
          stripeCustomerId = customer.id;
        } catch (error: any) {
          console.error('[TIER UPDATE] Stripe customer creation failed:', error);
          return NextResponse.json(
            { 
              error: `Failed to create customer: ${error.message}`,
              details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
              code: error.type || 'STRIPE_ERROR'
            },
            { status: 500 }
          );
        }

        // Save customer ID to organization and project
        try {
          await Promise.all([
            prisma.organization.update({
              where: { id: maintenancePlan.project.organizationId },
              data: { stripeCustomerId: customer.id },
            }),
            prisma.project.update({
              where: { id: maintenancePlan.projectId },
              data: { stripeCustomerId: customer.id },
            }),
          ]);
        } catch (error: any) {
          console.error('[TIER UPDATE] Failed to save Stripe customer ID:', error);
          // Don't fail here - customer was created, we can continue
        }
      }

      // Get the price ID for the tier, or create on-the-fly if missing
      let priceId = tierConfig.stripePriceId;
      let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;

      if (priceId) {
        // Use existing price ID
        lineItem = {
          price: priceId,
          quantity: 1,
        };
      } else {
        // Create price on-the-fly using price_data
        console.log(`[TIER UPDATE] Stripe price ID missing for tier ${tier}, creating on-the-fly`);
        lineItem = {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierConfig.name} - Monthly Subscription`,
              description: tierConfig.description,
              metadata: {
                tier: tier,
                maintenancePlanId: maintenancePlan.id,
              },
            },
            unit_amount: tierConfig.monthlyPrice,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        };
      }

      // Create Stripe checkout session for subscription
      // Build absolute URLs for success/cancel (required by Stripe)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      process.env.NEXTAUTH_URL || 
                      'https://see-zee.com';
      
      // Ensure URL is absolute (has protocol)
      const absoluteBaseUrl = baseUrl.startsWith('http') 
        ? baseUrl 
        : `https://${baseUrl}`;
      
      const successUrl = `${absoluteBaseUrl}/client/hours?tier-updated=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${absoluteBaseUrl}/client/hours?tier-update-cancelled=true`;
      
      console.log('[TIER UPDATE] Creating checkout session with URLs:', {
        successUrl,
        cancelUrl,
        baseUrl,
      });
      
      let checkoutSession;
      try {
        checkoutSession = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          mode: 'subscription',
          line_items: [lineItem],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            type: 'maintenance-plan-subscription',
            maintenancePlanId: maintenancePlan.id,
            tier: tier,
            userId: user.id,
            organizationId: maintenancePlan.project.organizationId,
            projectId: maintenancePlan.projectId,
          },
          subscription_data: {
            metadata: {
              maintenancePlanId: maintenancePlan.id,
              tier: tier,
              organizationId: maintenancePlan.project.organizationId,
              projectId: maintenancePlan.projectId,
            },
          },
        });
      } catch (stripeError: any) {
        console.error('[TIER UPDATE] Stripe checkout session creation failed:', {
          message: stripeError.message,
          type: stripeError.type,
          code: stripeError.code,
          param: stripeError.param,
        });
        
        // Handle invalid API key error
        if (stripeError.type === 'StripeAuthenticationError' || stripeError.code === 'api_key_expired') {
          return NextResponse.json(
            { 
              error: 'Payment system configuration error',
              message: 'The payment system is not properly configured. Please contact support.',
              details: process.env.NODE_ENV === 'development' ? stripeError.message : undefined,
            },
            { status: 500 }
          );
        }
        
        // Provide user-friendly error messages based on Stripe error type
        let errorMessage = 'Failed to create checkout session';
        if (stripeError.type === 'StripeInvalidRequestError') {
          if (stripeError.code === 'resource_missing') {
            errorMessage = 'Invalid payment configuration. Please contact support.';
          } else if (stripeError.param) {
            errorMessage = `Invalid ${stripeError.param}. Please contact support.`;
          }
        } else if (stripeError.type === 'StripeAPIError') {
          errorMessage = 'Payment service temporarily unavailable. Please try again.';
        }

        return NextResponse.json(
          { 
            error: errorMessage,
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? stripeError.message : undefined,
            code: stripeError.type || 'STRIPE_ERROR'
          },
          { status: 500 }
        );
      }

      if (!checkoutSession.url) {
        console.error('[TIER UPDATE] Checkout session created but no URL returned');
        return NextResponse.json(
          { error: 'Failed to create checkout session. Please try again or contact support.' },
          { status: 500 }
        );
      }

      // Update maintenance plan with checkout session ID (temporary, will be updated by webhook)
      // Keep status as PAUSED until payment is complete (webhook will set to ACTIVE)
      try {
        await prisma.maintenancePlan.update({
          where: { id: maintenancePlan.id },
          data: {
            tier: tier,
            monthlyPrice: tierConfig.monthlyPrice,
            supportHoursIncluded: tierConfig.supportHoursIncluded,
            changeRequestsIncluded: tierConfig.changeRequestsIncluded,
            stripeCheckoutSessionId: checkoutSession.id,
            status: 'PAUSED', // Will be activated to ACTIVE by webhook after payment
          },
        });
      } catch (error: any) {
        console.error('[TIER UPDATE] Failed to update maintenance plan with checkout session:', error);
        // Don't fail here - checkout session was created, user can still pay
      }

      return NextResponse.json({
        success: true,
        requiresPayment: true,
        checkoutUrl: checkoutSession.url,
        message: `Please complete payment to switch to ${tierConfig.name}`,
      });
    }

    // This code path should never be reached now since we always create checkout if no subscription
    // If there IS a Stripe subscription and tier is same, we already returned earlier
    // If tier is different, we cancelled subscription above and created checkout
    return NextResponse.json({
      success: false,
      error: "Unexpected state: subscription exists but should have been handled",
    }, { status: 500 });
  } catch (error: any) {
    console.error("[POST /api/client/maintenance-plans/update-tier] Unexpected error:", {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
    });
    
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while updating tier",
        details: process.env.NODE_ENV === 'development' 
          ? (error?.message || 'Unknown error') 
          : undefined,
        code: 'UNEXPECTED_ERROR'
      },
      { status: 500 }
    );
  }
}

