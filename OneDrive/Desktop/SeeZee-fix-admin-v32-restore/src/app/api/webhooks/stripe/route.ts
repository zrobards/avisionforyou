import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email/send";
import { renderReceiptEmail, ReceiptType } from "@/lib/email/templates/receipt";

// Force Node.js runtime for Prisma and Stripe SDK compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  console.log('[WEBHOOK] Stripe webhook received');
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("[WEBHOOK] No signature provided");
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[WEBHOOK] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`[WEBHOOK] Event verified: ${event.type} (${event.id})`);
  } catch (err: any) {
    console.error("[WEBHOOK] Signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        console.log(`[WEBHOOK] Processing checkout.session.completed for session ${(event.data.object as Stripe.Checkout.Session).id}`);
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "invoice.finalized":
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;
      case "invoice.voided":
        await handleInvoiceVoided(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.created":
        console.log(`[WEBHOOK] Processing customer.subscription.created for subscription ${(event.data.object as Stripe.Subscription).id}`);
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Send receipt email for a successful payment
 */
async function sendReceiptEmail(
  session: Stripe.Checkout.Session,
  receiptType: ReceiptType,
  additionalData?: {
    invoiceNumber?: string;
    invoiceId?: string;
    hours?: number;
    expirationDays?: number | null;
    subscriptionTier?: string;
    nextBillingDate?: Date;
    description?: string;
    items?: Array<{ name: string; quantity: number; amount: number }>;
    customerName?: string;
    customerEmail?: string;
  }
) {
  try {
    // Get customer email from session
    let customerEmail = additionalData?.customerEmail || session.customer_email;
    
    if (!customerEmail && typeof session.customer === 'string') {
      const customer = await stripe.customers.retrieve(session.customer).catch(() => null);
      if (customer && !customer.deleted) {
        customerEmail = customer.email || null;
      }
    } else if (!customerEmail && session.customer && typeof session.customer === 'object' && !session.customer.deleted) {
      customerEmail = session.customer.email || null;
    }

    if (!customerEmail) {
      console.warn(`[RECEIPT EMAIL] No customer email found for session ${session.id}, skipping receipt email`);
      return;
    }

    // Get customer name
    let customerName = additionalData?.customerName;
    if (!customerName && typeof session.customer === 'string') {
      try {
        const customer = await stripe.customers.retrieve(session.customer);
        if (customer && !customer.deleted) {
          customerName = customer.name || undefined;
        }
      } catch (err) {
        console.warn(`[RECEIPT EMAIL] Failed to retrieve customer name:`, err);
      }
    } else if (!customerName && session.customer && typeof session.customer === 'object' && !session.customer.deleted) {
      customerName = session.customer.name || undefined;
    }

    // Get amount from session
    const amount = (session.amount_total || 0) / 100; // Convert from cents
    const currency = session.currency?.toUpperCase() || 'USD';

    // Get line items if available
    let items = additionalData?.items;
    if (!items && session.line_items) {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        items = lineItems.data.map(item => ({
          name: item.description || item.price?.product as string || 'Item',
          quantity: item.quantity || 1,
          amount: (item.amount_total || 0) / 100,
        }));
      } catch (err) {
        console.warn(`[RECEIPT EMAIL] Failed to retrieve line items:`, err);
      }
    }

    // Build dashboard URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com';
    let dashboardUrl: string | undefined;
    let invoiceUrl: string | undefined;

    if (receiptType === 'invoice' && additionalData?.invoiceId) {
      invoiceUrl = `${baseUrl}/client/invoices/${additionalData.invoiceId}`;
      dashboardUrl = `${baseUrl}/client/invoices`;
    } else if (receiptType === 'hour-pack') {
      dashboardUrl = `${baseUrl}/client/hours`;
    } else if (receiptType === 'maintenance-plan' || receiptType === 'subscription') {
      dashboardUrl = `${baseUrl}/client/subscriptions`;
    } else {
      dashboardUrl = `${baseUrl}/client`;
    }

    // Render email
    const { html, text } = renderReceiptEmail({
      customerName: customerName || customerEmail.split('@')[0],
      customerEmail,
      receiptType,
      amount,
      currency,
      transactionId: session.id,
      invoiceNumber: additionalData?.invoiceNumber,
      description: additionalData?.description,
      items,
      dashboardUrl,
      invoiceUrl,
      hours: additionalData?.hours,
      expirationDays: additionalData?.expirationDays,
      subscriptionTier: additionalData?.subscriptionTier,
      nextBillingDate: additionalData?.nextBillingDate,
    });

    // Send email
    console.log(`[RECEIPT EMAIL] Attempting to send receipt email:`, {
      to: customerEmail,
      receiptType,
      sessionId: session.id,
      amount,
      hasHtml: !!html,
      hasText: !!text,
    });

    const result = await sendEmail({
      to: customerEmail,
      subject: `Payment Receipt - ${receiptType === 'invoice' ? additionalData?.invoiceNumber || 'Invoice' : receiptType === 'hour-pack' ? 'Hour Pack Purchase' : receiptType === 'maintenance-plan' ? 'Maintenance Plan Subscription' : 'Payment'}`,
      html,
      text,
    });

    if (result.success) {
      console.log(`[RECEIPT EMAIL] ✅ Receipt email sent successfully to ${customerEmail} for session ${session.id} (type: ${receiptType})`);
    } else {
      console.error(`[RECEIPT EMAIL] ❌ Failed to send receipt email to ${customerEmail} for session ${session.id}:`, {
        error: result.error,
        receiptType,
        customerEmail,
        sessionId: session.id,
      });
    }
  } catch (error) {
    // Don't throw - receipt email failure shouldn't break the webhook
    console.error(`[RECEIPT EMAIL] ❌ Exception sending receipt email for session ${session.id}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      receiptType,
      sessionId: session.id,
    });
  }
}

/**
 * Handle checkout.session.completed event
 * This fires when a Stripe Checkout session is completed (payment successful)
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Check if this is an hour pack purchase
    if (session.metadata?.type === 'hour-pack') {
      await handleHourPackPurchase(session);
      return;
    }

    // Check if this is a maintenance plan subscription checkout
    if (session.metadata?.type === 'maintenance-plan-subscription') {
      const maintenancePlanId = session.metadata?.maintenancePlanId;
      
      console.log(`[WEBHOOK] Processing maintenance plan subscription checkout:`, {
        maintenancePlanId,
        sessionId: session.id,
        subscriptionId: session.subscription,
        paymentStatus: session.payment_status,
      });
      
      if (!maintenancePlanId) {
        console.error('[WEBHOOK] No maintenancePlanId in session metadata for maintenance plan subscription checkout');
        return;
      }
      
      // Only process if payment was successful
      if (session.payment_status !== 'paid') {
        console.log(`[WEBHOOK] Payment not completed for session ${session.id}, status: ${session.payment_status}`);
        return;
      }
      
      // Get subscription ID - for subscription mode, it should be available
      let subscriptionId: string | null = null;
      
      // session.subscription can be a string ID or an expanded Subscription object
      if (typeof session.subscription === 'string') {
        subscriptionId = session.subscription;
      } else if (session.subscription && typeof session.subscription === 'object' && 'id' in session.subscription) {
        subscriptionId = (session.subscription as Stripe.Subscription).id;
      }
      
      console.log(`[WEBHOOK] Subscription ID check:`, {
        sessionId: session.id,
        subscriptionId,
        mode: session.mode,
        hasSubscription: !!subscriptionId,
      });
      
      // If subscription ID is not directly available and we're in subscription mode, retrieve it
      if (!subscriptionId && session.mode === 'subscription') {
        console.log(`[WEBHOOK] Subscription ID not in session, retrieving from Stripe...`);
        try {
          // Retrieve the session with expanded subscription
          const retrievedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['subscription'],
          });
          
          if (typeof retrievedSession.subscription === 'string') {
            subscriptionId = retrievedSession.subscription;
          } else if (retrievedSession.subscription && typeof retrievedSession.subscription === 'object' && 'id' in retrievedSession.subscription) {
            subscriptionId = (retrievedSession.subscription as Stripe.Subscription).id;
          }
          
          console.log(`[WEBHOOK] Retrieved subscription ID:`, subscriptionId);
        } catch (err) {
          console.error('[WEBHOOK] Failed to retrieve session with subscription:', err);
          // Continue - subscription.created webhook will handle it
        }
      }
      
      if (subscriptionId) {
        try {
          // Update maintenance plan with subscription ID immediately
          const updateResult = await prisma.maintenancePlan.update({
            where: { id: maintenancePlanId },
            data: {
              stripeSubscriptionId: subscriptionId,
              status: 'ACTIVE',
            },
          });
          
          console.log(`[WEBHOOK] Maintenance plan ${maintenancePlanId} updated with subscription ${subscriptionId}, status: ${updateResult.status}`);
          
          // Get subscription details to set period end
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const periodEnd = new Date(subscription.current_period_end * 1000);
            await prisma.maintenancePlan.update({
              where: { id: maintenancePlanId },
              data: {
                currentPeriodEnd: periodEnd,
              },
            });
            console.log(`[WEBHOOK] Maintenance plan ${maintenancePlanId} activated with subscription ${subscriptionId}, period ends: ${periodEnd.toISOString()}`);

            // Send receipt email for initial subscription payment
            try {
              const maintenancePlan = await prisma.maintenancePlan.findUnique({
                where: { id: maintenancePlanId },
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

              if (maintenancePlan) {
                const owner = maintenancePlan.project.organization.members[0]?.user;
                await sendReceiptEmail(session, 'maintenance-plan', {
                  subscriptionTier: maintenancePlan.tier,
                  nextBillingDate: periodEnd,
                  description: `Monthly subscription for ${maintenancePlan.tier} tier maintenance plan`,
                  items: [{
                    name: `${maintenancePlan.tier} Maintenance Plan - Monthly Subscription`,
                    quantity: 1,
                    amount: Number(maintenancePlan.monthlyPrice) / 100,
                  }],
                  customerName: owner?.name || undefined,
                  customerEmail: owner?.email || undefined,
                });
                console.log(`[WEBHOOK] Receipt email sent for maintenance plan subscription ${maintenancePlanId}`);
              }
            } catch (emailError) {
              // Don't fail the webhook if email fails
              console.error('[WEBHOOK] Failed to send receipt email for maintenance plan subscription:', emailError);
            }
          } catch (err) {
            console.error('[WEBHOOK] Failed to fetch subscription details:', err);
          }
        } catch (error: any) {
          console.error('[WEBHOOK] Failed to update maintenance plan:', {
            maintenancePlanId,
            subscriptionId,
            error: error.message,
            stack: error.stack,
          });
          throw error;
        }
      } else {
        console.warn(`[WEBHOOK] No subscription ID found for session ${session.id}. This is normal for subscription checkouts - the subscription.created webhook will handle activation.`);
        // The subscription.created webhook will handle linking the subscription to the maintenance plan
        // This can happen if checkout.session.completed fires before the subscription is fully created
        return;
      }
    }

    // Get invoice ID from session metadata
    const invoiceId = session.metadata?.invoiceId;
    
    if (!invoiceId) {
      console.log(`No invoice ID found in checkout session ${session.id}`);
      return;
    }

    // Find the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      console.log(`Invoice not found: ${invoiceId}`);
      return;
    }

    // Only update if payment was successful
    if (session.payment_status === "paid") {
      if (invoice.status !== "PAID") {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });
        console.log(`Invoice ${invoice.number} marked as paid via checkout session ${session.id}`);
      }

      // Always send receipt email for successful payments, even if invoice was already marked as paid
      const invoiceWithItems = await prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          items: true,
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
      });

      if (invoiceWithItems) {
        const owner = invoiceWithItems.organization.members[0]?.user;
        try {
          await sendReceiptEmail(session, 'invoice', {
            invoiceNumber: invoice.number,
            invoiceId: invoice.id,
            description: invoice.description || invoice.title,
            items: invoiceWithItems.items.map(item => ({
              name: item.description,
              quantity: item.quantity,
              amount: Number(item.amount),
            })),
            customerName: owner?.name || undefined,
            customerEmail: owner?.email || undefined,
          });
          console.log(`[WEBHOOK] Receipt email sent for invoice ${invoice.number}`);
        } catch (emailError) {
          // Don't fail the webhook if email fails
          console.error(`[WEBHOOK] Failed to send receipt email for invoice ${invoice.number}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
    throw error;
  }
}

/**
 * Handle hour pack purchase
 * Creates HourPack record when payment is successful
 */
async function handleHourPackPurchase(session: Stripe.Checkout.Session) {
  try {
    // CRITICAL: Check for duplicates FIRST before any processing
    // Check by session ID (most reliable - Stripe sends one session per checkout)
    const existingBySession = await prisma.hourPack.findFirst({
      where: {
        OR: [
          { stripePaymentId: session.id }, // Check by session ID
          ...(typeof session.payment_intent === 'string' 
            ? [{ stripePaymentId: session.payment_intent }] 
            : []),
        ],
      },
    });

    if (existingBySession) {
      console.log(`[DUPLICATE PREVENTION] Hour pack already exists for session ${session.id} or payment ${session.payment_intent}. Skipping.`);
      return;
    }

    // Also check for duplicate invoice by session ID
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        OR: [
          { stripeInvoiceId: session.id },
          ...(session.invoice ? [{ stripeInvoiceId: session.invoice as string }] : []),
        ],
      },
    });

    if (existingInvoice) {
      console.log(`[DUPLICATE PREVENTION] Invoice already exists for session ${session.id}. Hour pack may have been created. Skipping.`);
      return;
    }

    const metadata = session.metadata || {};
    const packId = metadata.packId;
    const userId = metadata.userId;
    const organizationId = metadata.organizationId;

    if (!packId || !userId) {
      console.log(`Missing required metadata for hour pack purchase: packId=${packId}, userId=${userId}`);
      return;
    }

    // Only process if payment was successful
    if (session.payment_status !== "paid") {
      console.log(`Hour pack purchase not paid yet: ${session.id}`);
      return;
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
      console.error(`Invalid pack ID: ${packId}`);
      return;
    }

    // Get user's organization and find their active maintenance plan
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
      console.error(`User not found: ${userId}`);
      return;
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

    // If no maintenance plan found, try to find any active plan for the organization
    if (!maintenancePlan && organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
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
      });

      if (org?.projects[0]?.maintenancePlanRel) {
        maintenancePlan = org.projects[0].maintenancePlanRel;
      }
    }

    // If no maintenance plan found, we need to find or create one
    if (!maintenancePlan) {
      console.log(`No active maintenance plan found, attempting to create one...`);
      
      // Get the organization
      const org = organizationId 
        ? await prisma.organization.findUnique({ where: { id: organizationId } })
        : user.organizations[0]?.organization;

      if (!org) {
        console.error(`No organization found for user ${userId}`);
        return;
      }

      // Find the most recent project for this organization
      const project = await prisma.project.findFirst({
        where: { organizationId: org.id },
        orderBy: { createdAt: 'desc' },
      });

      if (!project) {
        console.error(`No project found for organization ${org.id}`);
        return;
      }

      // Check if there's an existing maintenance plan (even if inactive)
      let existingPlan = await prisma.maintenancePlan.findUnique({
        where: { projectId: project.id },
      });

      if (!existingPlan) {
        // Create a new maintenance plan with default tier
        existingPlan = await prisma.maintenancePlan.create({
          data: {
            projectId: project.id,
            tier: 'ESSENTIALS', // Default tier
            monthlyPrice: new Prisma.Decimal(50000), // $500 default
            status: 'ACTIVE',
            billingDay: 1,
          },
        });
        console.log(`Created new maintenance plan ${existingPlan.id} for project ${project.id}`);
      } else {
        // Reactivate if inactive
        if (existingPlan.status !== 'ACTIVE') {
          existingPlan = await prisma.maintenancePlan.update({
            where: { id: existingPlan.id },
            data: { status: 'ACTIVE' },
          });
          console.log(`Reactivated maintenance plan ${existingPlan.id}`);
        }
      }

      maintenancePlan = existingPlan;
    }

    // Get payment intent ID (use session ID as fallback for tracking)
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.id; // Use session ID if payment_intent not available

    // Final duplicate check right before creation (defense in depth)
    const finalDuplicateCheck = await prisma.hourPack.findFirst({
      where: {
        OR: [
          { stripePaymentId: session.id },
          ...(paymentIntentId !== session.id ? [{ stripePaymentId: paymentIntentId }] : []),
        ],
      },
    });

    if (finalDuplicateCheck) {
      console.log(`[DUPLICATE PREVENTION] Final check: Hour pack already exists. Session: ${session.id}, Payment: ${paymentIntentId}`);
      return;
    }

    // Calculate expiration date
    const expiresAt = pack.expirationDays
      ? new Date(Date.now() + pack.expirationDays * 24 * 60 * 60 * 1000)
      : null;

    const amountTotal = session.amount_total || 0;

    // Create the hour pack with session ID stored for tracking
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
        stripePaymentId: paymentIntentId, // Store payment intent or session ID
        isActive: true,
      },
    });

    console.log(`[SUCCESS] Hour pack ${packId} created: ID=${hourPack.id}, Session=${session.id}, Payment=${paymentIntentId}, Hours=${pack.hours}`);

    console.log(`Hour pack ${packId} created for maintenance plan ${maintenancePlan.id} (${pack.hours} hours)`);
    
    // Create activity entry for admin dashboard notification
    try {
      const packNames: Record<string, string> = {
        SMALL: 'Starter Pack',
        MEDIUM: 'Growth Pack',
        LARGE: 'Scale Pack',
        PREMIUM: 'Premium Reserve',
      };
      const packName = packNames[packId as keyof typeof packNames] || packId;
      
      // Create activity directly (webhook context doesn't have user session)
      await prisma.activity.create({
        data: {
          type: 'PAYMENT',
          title: `Hour Pack Purchased - ${packName}`,
          description: `Client purchased ${pack.hours}-hour pack (${packName}) for $${(amountTotal / 100).toFixed(2)}`,
          metadata: {
            hourPackId: hourPack.id,
            packType: packId,
            hours: pack.hours,
            cost: amountTotal / 100,
            maintenancePlanId: maintenancePlan.id,
            projectId: maintenancePlan.projectId,
          },
          read: false,
        },
      });
    } catch (activityError) {
      // Don't fail the webhook if activity creation fails
      console.error('Failed to create activity for hour pack purchase:', activityError);
    }

    // Create finance transaction and ensure Stripe customer is saved
    const org = organizationId 
      ? await prisma.organization.findUnique({ where: { id: organizationId } })
      : user.organizations[0]?.organization;

    if (org) {
      const project = await prisma.project.findFirst({
        where: { organizationId: org.id },
        orderBy: { createdAt: 'desc' },
      });

      // Get or create Stripe customer from the session
      let stripeCustomerId = session.customer as string | null;
      
      // If session has customer, ensure it's saved to project and organization
      if (stripeCustomerId) {
        if (project && !project.stripeCustomerId) {
          await prisma.project.update({
            where: { id: project.id },
            data: { stripeCustomerId: stripeCustomerId },
          });
          console.log(`Saved Stripe customer ${stripeCustomerId} to project ${project.id}`);
        }
        
        // Also save to organization if not set
        if (!org.stripeCustomerId) {
          await prisma.organization.update({
            where: { id: org.id },
            data: { stripeCustomerId: stripeCustomerId },
          });
          console.log(`Saved Stripe customer ${stripeCustomerId} to organization ${org.id}`);
        }
      } else if (!stripeCustomerId && session.customer_email) {
        // Create Stripe customer if we have email but no customer ID
        try {
          const customer = await stripe.customers.create({
            email: session.customer_email,
            name: user.name || undefined,
            metadata: {
              userId: user.id,
              organizationId: org.id,
              projectId: project?.id || '',
            },
          });
          stripeCustomerId = customer.id;
          
          if (project) {
            await prisma.project.update({
              where: { id: project.id },
              data: { stripeCustomerId: customer.id },
            });
            console.log(`Created and saved Stripe customer ${customer.id} to project ${project.id}`);
          }
          
          // Also save to organization
          await prisma.organization.update({
            where: { id: org.id },
            data: { stripeCustomerId: customer.id },
          });
          console.log(`Created and saved Stripe customer ${customer.id} to organization ${org.id}`);
        } catch (error) {
          console.error("Failed to create Stripe customer:", error);
        }
      }

      // Check for duplicate invoice before creating
      const existingInvoiceCheck = await prisma.invoice.findFirst({
        where: {
          OR: [
            { stripeInvoiceId: session.id },
            ...(session.invoice ? [{ stripeInvoiceId: session.invoice as string }] : []),
            ...(paymentIntentId ? [{ stripeInvoiceId: paymentIntentId }] : []),
          ],
        },
      });

      let invoice;
      if (!existingInvoiceCheck) {
        // Create invoice for the hour pack purchase
        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;
        
        const packNames: Record<string, string> = {
          SMALL: 'Starter Pack',
          MEDIUM: 'Growth Pack',
          LARGE: 'Scale Pack',
          PREMIUM: 'Premium Reserve',
        };
        
        invoice = await prisma.invoice.create({
          data: {
            number: invoiceNumber,
            title: `Hour Pack - ${packNames[packId as keyof typeof packNames] || packId}`,
            description: `${pack.hours} support hours${pack.expirationDays ? ` (valid for ${pack.expirationDays} days)` : ' (never expires)'}`,
            amount: new Prisma.Decimal(amountTotal / 100), // Convert cents to dollars
            total: new Prisma.Decimal(amountTotal / 100),
            currency: 'USD',
            status: 'PAID',
            dueDate: new Date(),
            organizationId: org.id,
            projectId: project?.id || null,
            stripeInvoiceId: session.invoice as string || session.id, // Use session ID as fallback
            paidAt: new Date(),
            invoiceType: 'hour-pack',
            items: {
              create: {
                description: `${packNames[packId as keyof typeof packNames] || packId} - ${pack.hours} hours`,
                quantity: 1,
                rate: amountTotal / 100,
                amount: amountTotal / 100,
              },
            },
          },
        });

        console.log(`[SUCCESS] Invoice ${invoiceNumber} created for hour pack purchase: ${amountTotal / 100} USD, Session=${session.id}`);
      } else {
        invoice = existingInvoiceCheck;
        console.log(`[DUPLICATE PREVENTION] Invoice already exists for session ${session.id}, skipping invoice creation`);
      }

      await prisma.financeTransaction.create({
        data: {
          organizationId: org.id,
          projectId: project?.id || null,
          type: 'ADDON_SERVICE',
          amount: amountTotal,
          currency: 'USD',
          status: 'PAID',
          stripePaymentId: paymentIntentId,
          stripeInvoiceId: session.invoice as string | null,
          paymentMethod: 'card',
          description: `Hour Pack Purchase - ${pack.hours} hours (${packId})`,
          paidAt: new Date(),
          metadata: {
            hourPackId: hourPack.id,
            packType: packId,
            hours: pack.hours,
            expirationDays: pack.expirationDays,
            invoiceId: invoice.id,
          },
        },
      });

      console.log(`Finance transaction created for hour pack purchase: ${amountTotal / 100} USD`);
    }

    // Send receipt email
    const packNames: Record<string, string> = {
      SMALL: 'Starter Pack',
      MEDIUM: 'Growth Pack',
      LARGE: 'Scale Pack',
      PREMIUM: 'Premium Reserve',
    };
    const packName = packNames[packId as keyof typeof packNames] || packId;
    
    await sendReceiptEmail(session, 'hour-pack', {
      description: `${packName} - ${pack.hours} support hours${pack.expirationDays ? ` (valid for ${pack.expirationDays} days)` : ' (never expires)'}`,
      hours: pack.hours,
      expirationDays: pack.expirationDays,
      items: [{
        name: `${packName} - ${pack.hours} hours`,
        quantity: 1,
        amount: amountTotal / 100,
      }],
      customerName: user.name || undefined,
      customerEmail: user.email || undefined,
    });
  } catch (error) {
    console.error("Error handling hour pack purchase:", error);
    throw error;
  }
}

/**
 * Handle invoice.paid event
 * Creates invoice in database if it doesn't exist (for subscription invoices)
 */
async function handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
  try {
    let invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    // If invoice doesn't exist, create it (for subscription invoices)
    if (!invoice && stripeInvoice.subscription) {
      // Find the subscription and get the maintenance plan
      const subscription = await stripe.subscriptions.retrieve(
        stripeInvoice.subscription as string
      );

      // Find maintenance plan by subscription ID
      const maintenancePlan = await prisma.maintenancePlan.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (maintenancePlan) {
        // Generate invoice number
        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;

        // Create invoice in database
        invoice = await prisma.invoice.create({
          data: {
            number: invoiceNumber,
            title: `Maintenance Plan - ${maintenancePlan.tier}`,
            description: `Monthly subscription for ${maintenancePlan.tier} tier`,
            amount: new Prisma.Decimal(stripeInvoice.amount_paid / 100),
            tax: new Prisma.Decimal((stripeInvoice.tax || 0) / 100),
            total: new Prisma.Decimal(stripeInvoice.total / 100),
            currency: stripeInvoice.currency.toUpperCase(),
            status: 'PAID',
            dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000) : new Date(),
            organizationId: maintenancePlan.project.organizationId,
            projectId: maintenancePlan.projectId,
            stripeInvoiceId: stripeInvoice.id,
            sentAt: new Date(),
            paidAt: new Date(stripeInvoice.status_transitions.paid_at! * 1000),
            invoiceType: 'subscription',
            items: {
              create: stripeInvoice.lines.data.map((line) => ({
                description: line.description || `Subscription - ${maintenancePlan.tier}`,
                quantity: line.quantity || 1,
                rate: new Prisma.Decimal((line.price?.unit_amount || 0) / 100),
                amount: new Prisma.Decimal((line.amount || 0) / 100),
              })),
            },
          },
        });

        console.log(`Created invoice ${invoiceNumber} from Stripe subscription invoice ${stripeInvoice.id}`);
      } else {
        console.log(`Maintenance plan not found for subscription ${subscription.id}`);
        return;
      }
    } else if (!invoice) {
      console.log(`Invoice not found for Stripe invoice ${stripeInvoice.id} and no subscription found`);
      return;
    }

    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidAt: new Date(stripeInvoice.status_transitions.paid_at! * 1000),
      },
    });

    // Create payment record
    if (stripeInvoice.charge && typeof stripeInvoice.charge === 'string') {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: stripeInvoice.amount_paid,
          status: "COMPLETED",
          method: "stripe",
          stripeChargeId: stripeInvoice.charge,
          stripePaymentId: stripeInvoice.payment_intent as string | null,
          processedAt: new Date(),
          currency: stripeInvoice.currency.toUpperCase(),
        },
      });
    }

    console.log(`Invoice ${invoice.number} marked as paid`);
    
    // Send receipt email for ALL paid invoices (both subscription and regular)
    try {
      const invoiceWithItems = await prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          items: true,
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
      });

      if (invoiceWithItems) {
        const owner = invoiceWithItems.organization.members[0]?.user;
        const customerEmail = stripeInvoice.customer_email || owner?.email;
        
        if (customerEmail) {
          // Create a mock session object for the receipt email function
          const mockSession = {
            id: stripeInvoice.id,
            amount_total: stripeInvoice.amount_paid,
            currency: stripeInvoice.currency,
            customer_email: customerEmail,
            customer: typeof stripeInvoice.customer === 'string' ? stripeInvoice.customer : stripeInvoice.customer?.id,
          } as Stripe.Checkout.Session;

          // Determine receipt type based on invoice type
          const receiptType: ReceiptType = stripeInvoice.subscription ? 'subscription' : 'invoice';
          
          // Get subscription details if this is a subscription invoice
          let subscriptionTier: string | undefined;
          let nextBillingDate: Date | undefined;
          
          if (stripeInvoice.subscription) {
            try {
              const subscription = await stripe.subscriptions.retrieve(
                stripeInvoice.subscription as string
              );
              const maintenancePlan = await prisma.maintenancePlan.findFirst({
                where: { stripeSubscriptionId: subscription.id },
              });
              if (maintenancePlan) {
                subscriptionTier = maintenancePlan.tier;
                nextBillingDate = new Date(subscription.current_period_end * 1000);
              }
            } catch (err) {
              console.warn('[WEBHOOK] Failed to get subscription details for receipt email:', err);
            }
          }

          await sendReceiptEmail(mockSession, receiptType, {
            invoiceNumber: invoice.number,
            invoiceId: invoice.id,
            subscriptionTier,
            nextBillingDate,
            description: invoice.description || invoice.title,
            items: invoiceWithItems.items.map(item => ({
              name: item.description,
              quantity: item.quantity,
              amount: Number(item.amount),
            })),
            customerName: owner?.name || undefined,
            customerEmail: customerEmail,
          });
          console.log(`[WEBHOOK] Receipt email sent for invoice ${invoice.number} (type: ${receiptType})`);
        } else {
          console.warn(`[WEBHOOK] No customer email found for invoice ${invoice.number}`);
        }
      }
    } catch (emailError) {
      // Don't fail the webhook if email fails
      console.error(`[WEBHOOK] Failed to send receipt email for invoice ${invoice.number}:`, emailError);
    }
    
    // Create activity entry for admin dashboard notification
    if (stripeInvoice.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          stripeInvoice.subscription as string
        );
        const maintenancePlan = await prisma.maintenancePlan.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          include: {
            project: {
              include: {
                organization: true,
              },
            },
          },
        });
        
        if (maintenancePlan) {
          // Create activity directly (webhook context doesn't have user session)
          await prisma.activity.create({
            data: {
              type: 'INVOICE_PAID',
              title: `Subscription Payment Received - ${maintenancePlan.tier} Plan`,
              description: `${maintenancePlan.project.organization?.name || 'Client'} paid $${(stripeInvoice.amount_paid / 100).toFixed(2)} for ${maintenancePlan.tier} subscription`,
              metadata: {
                invoiceId: invoice.id,
                invoiceNumber: invoice.number,
                subscriptionId: subscription.id,
                maintenancePlanId: maintenancePlan.id,
                projectId: maintenancePlan.projectId,
                organizationId: maintenancePlan.project.organizationId,
                amount: stripeInvoice.amount_paid / 100,
                tier: maintenancePlan.tier,
              },
              read: false,
            },
          });

          // Receipt email is already sent above for all invoices (including subscriptions)
        }
      } catch (activityError) {
        // Don't fail the webhook if activity creation fails
        console.error('Failed to create activity for subscription payment:', activityError);
      }
    }
  } catch (error) {
    console.error("Error handling invoice.paid:", error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(stripeInvoice: Stripe.Invoice) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (!invoice) {
      console.log(`Invoice not found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }

    // Update invoice status to OVERDUE if past due date
    const isPastDue = new Date(invoice.dueDate) < new Date();
    if (isPastDue) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "OVERDUE" },
      });
    }

    console.log(`Invoice ${invoice.number} payment failed`);
  } catch (error) {
    console.error("Error handling invoice.payment_failed:", error);
    throw error;
  }
}

/**
 * Handle invoice.finalized event
 * Creates invoice in database if it doesn't exist (for subscription invoices)
 */
async function handleInvoiceFinalized(stripeInvoice: Stripe.Invoice) {
  try {
    let invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    // If invoice doesn't exist, create it (for subscription invoices)
    if (!invoice && stripeInvoice.subscription) {
      // Find the subscription and get the maintenance plan
      const subscription = await stripe.subscriptions.retrieve(
        stripeInvoice.subscription as string
      );

      // Find maintenance plan by subscription ID
      const maintenancePlan = await prisma.maintenancePlan.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (maintenancePlan) {
        // Generate invoice number
        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;

        // Create invoice in database
        invoice = await prisma.invoice.create({
          data: {
            number: invoiceNumber,
            title: `Maintenance Plan - ${maintenancePlan.tier}`,
            description: `Monthly subscription for ${maintenancePlan.tier} tier`,
            amount: new Prisma.Decimal(stripeInvoice.amount_due / 100),
            tax: new Prisma.Decimal((stripeInvoice.tax || 0) / 100),
            total: new Prisma.Decimal(stripeInvoice.total / 100),
            currency: stripeInvoice.currency.toUpperCase(),
            status: stripeInvoice.status === 'paid' ? 'PAID' : 'SENT',
            dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000) : new Date(),
            organizationId: maintenancePlan.project.organizationId,
            projectId: maintenancePlan.projectId,
            stripeInvoiceId: stripeInvoice.id,
            sentAt: new Date(),
            paidAt: stripeInvoice.status === 'paid' && stripeInvoice.status_transitions.paid_at
              ? new Date(stripeInvoice.status_transitions.paid_at * 1000)
              : null,
            invoiceType: 'subscription',
            items: {
              create: stripeInvoice.lines.data.map((line) => ({
                description: line.description || `Subscription - ${maintenancePlan.tier}`,
                quantity: line.quantity || 1,
                rate: new Prisma.Decimal((line.price?.unit_amount || 0) / 100),
                amount: new Prisma.Decimal((line.amount || 0) / 100),
              })),
            },
          },
        });

        console.log(`Created invoice ${invoiceNumber} from Stripe subscription invoice ${stripeInvoice.id}`);
      } else {
        console.log(`Maintenance plan not found for subscription ${subscription.id}`);
        return;
      }
    } else if (!invoice) {
      console.log(`Invoice not found for Stripe invoice ${stripeInvoice.id} and no subscription found`);
      return;
    }

    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: stripeInvoice.status === 'paid' ? 'PAID' : 'SENT',
        sentAt: new Date(),
      },
    });

    console.log(`Invoice ${invoice.number} finalized`);
  } catch (error) {
    console.error("Error handling invoice.finalized:", error);
    throw error;
  }
}

/**
 * Handle invoice.voided event
 */
async function handleInvoiceVoided(stripeInvoice: Stripe.Invoice) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (!invoice) {
      console.log(`Invoice not found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "CANCELLED" },
    });

    console.log(`Invoice ${invoice.number} voided`);
  } catch (error) {
    console.error("Error handling invoice.voided:", error);
    throw error;
  }
}

/**
 * Handle subscription.created event
 * Links Stripe subscription to MaintenancePlan
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`[WEBHOOK] Processing customer.subscription.created for subscription ${subscription.id}`);
  try {
    const maintenancePlanId = subscription.metadata?.maintenancePlanId;
    const projectId = subscription.metadata?.projectId;
    
    if (!maintenancePlanId && !projectId) {
      console.warn(`[WEBHOOK] No maintenancePlanId or projectId in subscription ${subscription.id} metadata`);
      return;
    }

    // Find maintenance plan by ID or by project
    let maintenancePlan = null;
    if (maintenancePlanId) {
      maintenancePlan = await prisma.maintenancePlan.findUnique({
        where: { id: maintenancePlanId },
        include: { project: true },
      });
    } else if (projectId) {
      maintenancePlan = await prisma.maintenancePlan.findFirst({
        where: { projectId },
        include: { project: true },
      });
    }

    if (!maintenancePlan) {
      console.warn(`[WEBHOOK] Maintenance plan not found for subscription ${subscription.id} (maintenancePlanId: ${maintenancePlanId}, projectId: ${projectId})`);
      return;
    }

    console.log(`[WEBHOOK] Updating maintenance plan ${maintenancePlan.id} with subscription ${subscription.id}`);
    
    // Check if there's an existing subscription for this project that needs to be cancelled
    const existingMaintenancePlan = await prisma.maintenancePlan.findFirst({
      where: {
        projectId: maintenancePlan.projectId,
        id: { not: maintenancePlan.id },
        stripeSubscriptionId: { not: null },
        status: 'ACTIVE',
      },
    });

    // Cancel old subscription if it exists
    if (existingMaintenancePlan?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(existingMaintenancePlan.stripeSubscriptionId);
        console.log(`[WEBHOOK] Cancelled old subscription ${existingMaintenancePlan.stripeSubscriptionId} for project ${maintenancePlan.projectId}`);
        
        // Update old maintenance plan status
        await prisma.maintenancePlan.update({
          where: { id: existingMaintenancePlan.id },
          data: { status: 'CANCELLED' },
        });
      } catch (error: any) {
        console.error(`[WEBHOOK] Failed to cancel old subscription ${existingMaintenancePlan.stripeSubscriptionId}:`, error.message);
        // Continue anyway - new subscription will still be created
      }
    }
    
    // Update maintenance plan with Stripe subscription ID
    // Set status to ACTIVE if subscription is active
    const updateResult = await prisma.maintenancePlan.update({
      where: { id: maintenancePlan.id },
      data: {
        stripeSubscriptionId: subscription.id,
        status: subscription.status === 'active' ? 'ACTIVE' : 'PAUSED',
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
    
    console.log(`[WEBHOOK] Maintenance plan ${maintenancePlan.id} updated: status=${updateResult.status}, subscription=${subscription.id}`);

    // Also update project for backward compatibility
    await prisma.project.update({
      where: { id: maintenancePlan.projectId },
      data: {
        stripeSubscriptionId: subscription.id,
        maintenanceStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`[WEBHOOK] Subscription ${subscription.id} linked to maintenance plan ${maintenancePlan.id}, status: ${subscription.status === 'active' ? 'ACTIVE' : 'PAUSED'}`);

    // Send receipt email for initial subscription creation if subscription is active
    // This handles cases where checkout.session.completed didn't send the email
    if (subscription.status === 'active') {
      try {
        const maintenancePlanWithOrg = await prisma.maintenancePlan.findUnique({
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

        if (maintenancePlanWithOrg) {
          const owner = maintenancePlanWithOrg.project.organization.members[0]?.user;
          const customer = await stripe.customers.retrieve(subscription.customer as string).catch(() => null);
          
          // Create a mock session object for the receipt email function
          const mockSession = {
            id: subscription.latest_invoice as string || subscription.id,
            amount_total: subscription.items.data[0]?.price?.unit_amount || 0,
            currency: subscription.currency || 'usd',
            customer_email: (customer && !customer.deleted ? customer.email : null) || owner?.email || undefined,
            customer: subscription.customer,
          } as Stripe.Checkout.Session;

          if (mockSession.customer_email) {
            await sendReceiptEmail(mockSession, 'maintenance-plan', {
              subscriptionTier: maintenancePlanWithOrg.tier,
              nextBillingDate: new Date(subscription.current_period_end * 1000),
              description: `Monthly subscription for ${maintenancePlanWithOrg.tier} tier maintenance plan`,
              items: [{
                name: `${maintenancePlanWithOrg.tier} Maintenance Plan - Monthly Subscription`,
                quantity: 1,
                amount: Number(maintenancePlanWithOrg.monthlyPrice) / 100,
              }],
              customerName: owner?.name || (customer && !customer.deleted ? customer.name : null) || undefined,
              customerEmail: mockSession.customer_email,
            });
            console.log(`[WEBHOOK] Receipt email sent for subscription.created - subscription ${subscription.id}`);
          }
        }
      } catch (emailError) {
        // Don't fail the webhook if email fails
        console.error('[WEBHOOK] Failed to send receipt email for subscription.created:', emailError);
      }
    }
  } catch (error) {
    console.error("[WEBHOOK] Error handling subscription.created:", error);
    throw error;
  }
}

/**
 * Handle subscription.updated event
 * Updates MaintenancePlan when subscription changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Find maintenance plan by subscription ID
    const maintenancePlan = await prisma.maintenancePlan.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { project: true },
    });

    if (!maintenancePlan) {
      console.log(`Maintenance plan not found for subscription ${subscription.id}`);
      return;
    }

    // Update maintenance plan
    await prisma.maintenancePlan.update({
      where: { id: maintenancePlan.id },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : subscription.status === 'paused' ? 'PAUSED' : 'CANCELLED',
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Also update project for backward compatibility
    await prisma.project.update({
      where: { id: maintenancePlan.projectId },
      data: {
        maintenanceStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Subscription ${subscription.id} updated for maintenance plan ${maintenancePlan.id}`);
  } catch (error) {
    console.error("Error handling subscription.updated:", error);
    throw error;
  }
}

/**
 * Handle subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const project = await prisma.project.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!project) {
      console.log(`Project not found for subscription ${subscription.id}`);
      return;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        maintenanceStatus: 'CANCELLED',
        stripeSubscriptionId: null,
      },
    });

    console.log(`Subscription ${subscription.id} deleted`);
  } catch (error) {
    console.error("Error handling subscription.deleted:", error);
    throw error;
  }
}
