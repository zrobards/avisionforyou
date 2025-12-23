"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

/**
 * Create a Stripe invoice and payment link
 */
export async function createStripeInvoice(invoiceId: string) {
  try {
    // Get the invoice with all details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        organization: true,
        project: true,
        items: true,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.stripeInvoiceId) {
      return { success: false, error: "Stripe invoice already exists for this invoice" };
    }

    // Get or create Stripe customer
    let stripeCustomerId = invoice.organization.stripeCustomerId;
    
    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: invoice.organization.email || undefined,
        name: invoice.organization.name,
        address: invoice.organization.address
          ? {
              line1: invoice.organization.address,
              city: invoice.organization.city || undefined,
              state: invoice.organization.state || undefined,
              postal_code: invoice.organization.zipCode || undefined,
              country: invoice.organization.country || 'US',
            }
          : undefined,
        metadata: {
          organizationId: invoice.organizationId,
        },
      });

      stripeCustomerId = customer.id;

      // Update organization with Stripe customer ID
      await prisma.organization.update({
        where: { id: invoice.organizationId },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      auto_advance: false, // Don't automatically finalize
      collection_method: 'send_invoice',
      days_until_due: Math.max(
        1,
        Math.ceil(
          (new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      ),
      description: invoice.description || undefined,
      metadata: {
        invoiceId: invoice.id,
        projectId: invoice.projectId || '',
        organizationId: invoice.organizationId,
      },
    });

    // Add invoice items
    for (const item of invoice.items) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: Math.round(Number(item.rate)), // Amount in cents
        currency: invoice.currency.toLowerCase(),
      });
    }

    // Add tax if applicable
    if (invoice.tax && Number(invoice.tax) > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: 'Tax',
        amount: Math.round(Number(invoice.tax)),
        currency: invoice.currency.toLowerCase(),
      });
    }

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    // Update database with Stripe invoice ID
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        stripeInvoiceId: finalizedInvoice.id,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    revalidatePath('/admin/invoices');
    revalidatePath('/client/invoices');

    return {
      success: true,
      stripeInvoiceId: finalizedInvoice.id,
      hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url,
    };
  } catch (error: any) {
    console.error("Failed to create Stripe invoice:", error);
    return {
      success: false,
      error: error.message || "Failed to create Stripe invoice",
    };
  }
}

/**
 * Send an invoice via Stripe
 */
export async function sendInvoiceViaStripe(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (!invoice.stripeInvoiceId) {
      // Create Stripe invoice first
      const result = await createStripeInvoice(invoiceId);
      if (!result.success) {
        return result;
      }
      return { success: true, message: "Invoice created and sent via Stripe" };
    }

    // Send the invoice
    await stripe.invoices.sendInvoice(invoice.stripeInvoiceId);

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    revalidatePath('/admin/invoices');
    revalidatePath('/client/invoices');

    return { success: true, message: "Invoice sent successfully" };
  } catch (error: any) {
    console.error("Failed to send invoice:", error);
    return {
      success: false,
      error: error.message || "Failed to send invoice",
    };
  }
}

/**
 * Send receipt email for a paid invoice (fallback if webhook didn't send it)
 */
export async function sendInvoiceReceiptEmail(invoiceId: string) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/actions/invoice.ts:182',message:'sendInvoiceReceiptEmail entry',data:{invoiceId},sessionId:'debug-session',runId:'run1',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  console.log(`[INVOICE RECEIPT] Starting sendInvoiceReceiptEmail for invoiceId: ${invoiceId}`);
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/actions/invoice.ts:207',message:'Invoice fetched from DB',data:{invoiceId,found:!!invoice,status:invoice?.status,hasItems:!!invoice?.items,hasOrg:!!invoice?.organization,membersCount:invoice?.organization?.members?.length||0},sessionId:'debug-session',runId:'run1',hypothesisId:'C',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!invoice) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/actions/invoice.ts:210',message:'Invoice not found - early return',data:{invoiceId},sessionId:'debug-session',runId:'run1',hypothesisId:'C',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { success: false, error: 'Invoice not found' };
    }

    // Only send receipt if invoice is paid
    if (invoice.status !== 'PAID') {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/actions/invoice.ts:216',message:'Invoice not paid - early return',data:{invoiceId,status:invoice.status},sessionId:'debug-session',runId:'run1',hypothesisId:'C',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { success: false, error: 'Invoice is not paid yet' };
    }

    const owner = invoice.organization.members[0]?.user;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/actions/invoice.ts:221',message:'Owner check',data:{invoiceId,hasOwner:!!owner,hasEmail:!!owner?.email,email:owner?.email},sessionId:'debug-session',runId:'run1',hypothesisId:'C',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!owner?.email) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/actions/invoice.ts:224',message:'No owner email - early return',data:{invoiceId,hasOwner:!!owner},sessionId:'debug-session',runId:'run1',hypothesisId:'C',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { success: false, error: 'No customer email found' };
    }

    // Import email utilities
    const { sendEmail } = await import('@/lib/email/send');
    const { renderReceiptEmail } = await import('@/lib/email/templates/receipt');

    // Get Stripe invoice if available for additional details
    let stripeInvoice = null;
    if (invoice.stripeInvoiceId) {
      try {
        stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);
      } catch (err) {
        console.warn('[INVOICE RECEIPT] Failed to retrieve Stripe invoice:', err);
      }
    }

    // Determine receipt type - check if it's a subscription invoice
    let receiptType: 'invoice' | 'subscription' = 'invoice';
    let subscriptionTier: string | undefined;
    let nextBillingDate: Date | undefined;

    if (stripeInvoice?.subscription) {
      receiptType = 'subscription';
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
        console.warn('[INVOICE RECEIPT] Failed to get subscription details:', err);
      }
    }

    console.log(`[INVOICE RECEIPT] Preparing to send receipt email for invoice ${invoice.number} to ${owner.email}`);

    // Render and send receipt email
    const { html, text } = renderReceiptEmail({
      customerName: owner.name || owner.email.split('@')[0],
      customerEmail: owner.email,
      receiptType: receiptType,
      amount: Number(invoice.total),
      currency: 'USD',
      transactionId: invoice.stripeInvoiceId || invoice.id,
      invoiceNumber: invoice.number,
      description: invoice.description || invoice.title,
      items: invoice.items.map(item => ({
        name: item.description,
        quantity: item.quantity,
        amount: Number(item.amount),
      })),
      subscriptionTier,
      nextBillingDate,
      invoiceUrl: invoice.stripeInvoiceId
        ? `https://invoice.stripe.com/i/${invoice.stripeInvoiceId}`
        : `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com'}/client/invoices/${invoice.id}`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com'}/client/invoices`,
    });

    console.log(`[INVOICE RECEIPT] Email template rendered, calling sendEmail...`);

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/actions/invoice.ts:287',message:'About to call sendEmail',data:{invoiceId,to:owner.email,subject:`Payment Receipt - Invoice ${invoice.number}`,hasHtml:!!html,hasText:!!text,hasResendKey:!!process.env.RESEND_API_KEY},sessionId:'debug-session',runId:'run1',hypothesisId:'D',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const result = await sendEmail({
      to: owner.email,
      subject: `Payment Receipt - Invoice ${invoice.number}`,
      html,
      text,
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/actions/invoice.ts:297',message:'sendEmail result received',data:{invoiceId,success:result.success,error:result.error},sessionId:'debug-session',runId:'run1',hypothesisId:'D',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (result.success) {
      console.log(`[INVOICE RECEIPT] ✅ Receipt email sent successfully to ${owner.email} for invoice ${invoice.number}`);
      return { success: true, message: 'Receipt email sent' };
    } else {
      console.error(`[INVOICE RECEIPT] ❌ Failed to send receipt email to ${owner.email} for invoice ${invoice.number}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('[INVOICE RECEIPT] Error sending receipt email:', error);
    return { success: false, error: error.message || 'Failed to send receipt email' };
  }
}

/**
 * Mark an invoice as paid
 */
export async function markInvoiceAsPaid(invoiceId: string) {
  try {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    revalidatePath('/admin/invoices');
    revalidatePath('/client/invoices');

    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark invoice as paid:", error);
    return {
      success: false,
      error: error.message || "Failed to mark invoice as paid",
    };
  }
}

/**
 * Get Stripe payment link for an invoice
 */
export async function getStripePaymentLink(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (!invoice.stripeInvoiceId) {
      return { success: false, error: "No Stripe invoice associated" };
    }

    // Get the Stripe invoice
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);

    return {
      success: true,
      paymentUrl: stripeInvoice.hosted_invoice_url,
    };
  } catch (error: any) {
    console.error("Failed to get payment link:", error);
    return {
      success: false,
      error: error.message || "Failed to get payment link",
    };
  }
}

/**
 * Create and send an invoice with Stripe integration
 */
export async function createAndSendInvoice(data: {
  organizationId: string;
  projectId?: string;
  title: string;
  description?: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
  }>;
  tax?: number;
  dueDate: Date;
}) {
  try {
    // Calculate totals
    const amount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const tax = data.tax || 0;
    const total = amount + tax;

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, '0')}`;

    // Create invoice in database
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        title: data.title,
        description: data.description,
        status: 'DRAFT',
        organizationId: data.organizationId,
        projectId: data.projectId,
        amount,
        tax,
        total,
        currency: 'USD',
        dueDate: data.dueDate,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
    });

    // Create Stripe invoice and send it
    const result = await createStripeInvoice(invoice.id);
    if (!result.success) {
      return result;
    }

    revalidatePath('/admin/invoices');
    revalidatePath('/client/invoices');

    return {
      success: true,
      invoice,
      paymentUrl: result.hostedInvoiceUrl,
    };
  } catch (error: any) {
    console.error("Failed to create and send invoice:", error);
    return {
      success: false,
      error: error.message || "Failed to create and send invoice",
    };
  }
}

