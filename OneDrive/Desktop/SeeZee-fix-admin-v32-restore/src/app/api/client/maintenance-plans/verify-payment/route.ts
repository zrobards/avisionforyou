import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientAccessContext } from "@/lib/client-access";
import { sendEmail } from "@/lib/email/send";
import { renderReceiptEmail } from "@/lib/email/templates/receipt";
import Stripe from "stripe";

/**
 * POST /api/client/maintenance-plans/verify-payment
 * Manually verify payment status for development (when webhooks aren't available)
 */
export async function POST(req: NextRequest) {
  try {
    // Validate environment and log debug info
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    console.log('[VERIFY-PAYMENT] Stripe key present:', Boolean(stripeSecretKey));
    console.log('[VERIFY-PAYMENT] Stripe key prefix:', stripeSecretKey?.slice(0, 7));
    
    if (!stripeSecretKey) {
      console.error('[VERIFY-PAYMENT] STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { 
          error: "Payment system not configured",
          message: "The payment system is not properly configured. Please contact support.",
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
      console.error('[VERIFY-PAYMENT] No session or user ID');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.email) {
      console.error('[VERIFY-PAYMENT] No user email in session');
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    // Verify user exists in database - try by ID first, then email
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user && session.user.email) {
      console.warn(`[VERIFY-PAYMENT] User not found by ID ${session.user.id}, trying email ${session.user.email}`);
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!user) {
      console.error('[VERIFY-PAYMENT] User not found in database', {
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

    const identity = {
      userId: user.id,
      email: session.user.email,
    };

    // Get user's accessible projects
    let access;
    try {
      access = await getClientAccessContext(identity);
    } catch (error: any) {
      console.error('[VERIFY-PAYMENT] Failed to get client access context:', error);
      return NextResponse.json(
        { 
          error: "Failed to verify access",
          message: "Unable to verify your project access. Please contact support.",
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

    // Find the maintenance plan
    const maintenancePlan = await prisma.maintenancePlan.findFirst({
      where: {
        project: {
          OR: [
            { organizationId: { in: access.organizationIds } },
            { id: { in: access.leadProjectIds } },
          ],
        },
      },
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
        { error: "No maintenance plan found" },
        { status: 404 }
      );
    }

    // If already has subscription ID, check if it's still valid
    if (maintenancePlan.stripeSubscriptionId) {
      try {
        let subscription;
        try {
          subscription = await stripe.subscriptions.retrieve(maintenancePlan.stripeSubscriptionId);
        } catch (stripeError: any) {
          if (stripeError.type === 'StripeAuthenticationError' || stripeError.code === 'api_key_expired') {
            console.error('[VERIFY-PAYMENT] Stripe authentication error:', stripeError.message);
            return NextResponse.json(
              { 
                error: 'Payment system configuration error',
                message: 'The payment system is not properly configured. Please contact support.',
              },
              { status: 500 }
            );
          }
          throw stripeError;
        }
        if (subscription.status === 'active') {
          // Update maintenance plan to ensure it's ACTIVE
          await prisma.maintenancePlan.update({
            where: { id: maintenancePlan.id },
            data: {
              status: 'ACTIVE',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
          return NextResponse.json({ 
            success: true, 
            message: "Payment verified. Subscription is active.",
            subscriptionId: subscription.id 
          });
        }
      } catch (error: any) {
        console.warn('[VERIFY-PAYMENT] Failed to retrieve subscription:', error.message);
      }
    }

    // Check checkout session if available
    if (maintenancePlan.stripeCheckoutSessionId) {
      // In production, reject test session IDs (mismatch between test/live keys)
      const isProduction = process.env.NODE_ENV === 'production' || 
                          process.env.VERCEL_ENV === 'production' ||
                          !process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
      
      if (isProduction && maintenancePlan.stripeCheckoutSessionId.startsWith('cs_test_')) {
        console.error('[VERIFY-PAYMENT] Test session ID in production environment:', maintenancePlan.stripeCheckoutSessionId);
        // Clear the invalid test session ID so user can create a new one
        await prisma.maintenancePlan.update({
          where: { id: maintenancePlan.id },
          data: { stripeCheckoutSessionId: null },
        });
        return NextResponse.json({
          success: false,
          message: "Invalid payment session. Please try updating your tier again to create a new payment link.",
          error: 'TEST_SESSION_IN_PRODUCTION'
        });
      }
      
      try {
        let checkoutSession;
        try {
          checkoutSession = await stripe.checkout.sessions.retrieve(
            maintenancePlan.stripeCheckoutSessionId,
            { expand: ['subscription'] }
          );
        } catch (stripeError: any) {
          // Handle "No such checkout.session" for test sessions in production
          if (stripeError.code === 'resource_missing' && 
              maintenancePlan.stripeCheckoutSessionId.startsWith('cs_test_') &&
              isProduction) {
            console.error('[VERIFY-PAYMENT] Test session not found in production (using live keys):', maintenancePlan.stripeCheckoutSessionId);
            // Clear the invalid test session ID
            await prisma.maintenancePlan.update({
              where: { id: maintenancePlan.id },
              data: { stripeCheckoutSessionId: null },
            });
            return NextResponse.json({
              success: false,
              message: "Invalid payment session. Please try updating your tier again to create a new payment link.",
              error: 'TEST_SESSION_IN_PRODUCTION'
            });
          }
          
          if (stripeError.type === 'StripeAuthenticationError' || stripeError.code === 'api_key_expired') {
            console.error('[VERIFY-PAYMENT] Stripe authentication error:', stripeError.message);
            return NextResponse.json(
              { 
                error: 'Payment system configuration error',
                message: 'The payment system is not properly configured. Please contact support.',
              },
              { status: 500 }
            );
          }
          throw stripeError;
        }
        
        console.log('[VERIFY-PAYMENT] Checkout session:', {
          id: checkoutSession.id,
          payment_status: checkoutSession.payment_status,
          mode: checkoutSession.mode,
          has_subscription: !!checkoutSession.subscription,
        });

        if (checkoutSession.payment_status === 'paid' && checkoutSession.subscription) {
          // Extract subscription ID - can be string or expanded object
          let subscriptionId: string;
          if (typeof checkoutSession.subscription === 'string') {
            subscriptionId = checkoutSession.subscription;
          } else if (checkoutSession.subscription && typeof checkoutSession.subscription === 'object' && 'id' in checkoutSession.subscription) {
            subscriptionId = (checkoutSession.subscription as Stripe.Subscription).id;
          } else {
            console.error('[VERIFY-PAYMENT] Invalid subscription format in checkout session');
            return NextResponse.json({ 
              success: false, 
              message: "Payment completed but subscription ID not found. Please contact support.",
            });
          }
          
          console.log('[VERIFY-PAYMENT] Found subscription ID:', subscriptionId);
          
          // Update maintenance plan with subscription ID
          await prisma.maintenancePlan.update({
            where: { id: maintenancePlan.id },
            data: {
              stripeSubscriptionId: subscriptionId,
              status: 'ACTIVE',
            },
          });

          // Get subscription details to set period end
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            await prisma.maintenancePlan.update({
              where: { id: maintenancePlan.id },
              data: {
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            });
            console.log('[VERIFY-PAYMENT] Updated period end:', new Date(subscription.current_period_end * 1000).toISOString());
          } catch (subError: any) {
            console.error('[VERIFY-PAYMENT] Failed to retrieve subscription details:', subError.message);
            // Continue anyway - subscription ID is set
          }

          // Also update project for backward compatibility
          try {
            await prisma.project.update({
              where: { id: maintenancePlan.projectId },
              data: {
                stripeSubscriptionId: subscriptionId,
                maintenanceStatus: 'ACTIVE',
              },
            });
          } catch (projError: any) {
            console.error('[VERIFY-PAYMENT] Failed to update project:', projError.message);
            // Continue anyway
          }

          console.log('[VERIFY-PAYMENT] Payment verified, plan activated:', maintenancePlan.id);

          // Send receipt email as fallback (webhook might not have sent it yet)
          try {
            const maintenancePlanWithDetails = await prisma.maintenancePlan.findUnique({
              where: { id: maintenancePlan.id },
              include: {
                project: {
                  include: {
                    organization: {
                      include: {
                        members: {
                          where: { role: 'OWNER' },
                          include: { user: true },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            });

            if (maintenancePlanWithDetails) {
              const owner = maintenancePlanWithDetails.project.organization.members[0]?.user;
              const customerEmail = owner?.email || session.user.email;

              if (customerEmail) {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const periodEnd = new Date(subscription.current_period_end * 1000);

                const { html, text } = renderReceiptEmail({
                  customerName: owner?.name || customerEmail.split('@')[0],
                  customerEmail: customerEmail,
                  receiptType: 'maintenance-plan',
                  amount: Number(maintenancePlanWithDetails.monthlyPrice) / 100,
                  currency: 'USD',
                  transactionId: checkoutSession.id,
                  description: `Monthly subscription for ${maintenancePlanWithDetails.tier} tier maintenance plan`,
                  items: [{
                    name: `${maintenancePlanWithDetails.tier} Maintenance Plan - Monthly Subscription`,
                    quantity: 1,
                    amount: Number(maintenancePlanWithDetails.monthlyPrice) / 100,
                  }],
                  subscriptionTier: maintenancePlanWithDetails.tier,
                  nextBillingDate: periodEnd,
                  dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com'}/client/subscriptions`,
                });

                const emailResult = await sendEmail({
                  to: customerEmail,
                  subject: `Payment Receipt - Maintenance Plan Subscription`,
                  html,
                  text,
                });

                if (emailResult.success) {
                  console.log(`[VERIFY-PAYMENT] ✅ Receipt email sent successfully to ${customerEmail} for subscription ${subscriptionId}`);
                } else {
                  console.error(`[VERIFY-PAYMENT] ❌ Failed to send receipt email:`, emailResult.error);
                }
              }
            }
          } catch (emailError) {
            // Don't fail the request if email fails
            console.error('[VERIFY-PAYMENT] Error sending receipt email:', emailError);
          }

          return NextResponse.json({ 
            success: true, 
            message: "Payment verified! Your subscription is now active.",
            subscriptionId 
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: `Payment status: ${checkoutSession.payment_status}. Please complete payment.`,
            paymentStatus: checkoutSession.payment_status
          });
        }
      } catch (error: any) {
        console.error('[VERIFY-PAYMENT] Failed to retrieve checkout session:', error.message);
        return NextResponse.json(
          { error: `Failed to verify payment: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: "No checkout session found. Please complete payment first." 
    });
  } catch (error: any) {
    console.error("[POST /api/client/maintenance-plans/verify-payment]", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

