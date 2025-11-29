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

