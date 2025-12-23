import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { Prisma, ProjectStatus, InvoiceStatus, PaymentStatus } from '@prisma/client';
import { renderReceiptEmail } from '@/lib/email/templates/receipt';
import { sendEmail } from '@/lib/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

type ContactInfo = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  website?: string;
};

type QuestionnaireTotals = {
  total?: number | string | null;
};

type QuestionnaireAnswers = {
  goals?: unknown;
};

type QuestionnaireData = {
  contact?: ContactInfo;
  selectedService?: unknown;
  totals?: QuestionnaireTotals;
  questionnaire?: QuestionnaireAnswers;
};

const slugify = (value: string): string => {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return base.length > 0 ? base : `org-${Date.now()}`;
};

const deriveDescription = (goals: unknown): string => {
  if (Array.isArray(goals)) {
    const filtered = goals.filter((goal): goal is string => typeof goal === 'string' && goal.trim().length > 0);
    if (filtered.length > 0) {
      return filtered.join(', ');
    }
  }

  if (typeof goals === 'string' && goals.trim().length > 0) {
    return goals;
  }

  return 'New project from questionnaire';
};

const buildBudgetDecimal = (total: unknown): Prisma.Decimal | undefined => {
  if (total === null || total === undefined) {
    return undefined;
  }

  const numeric = typeof total === 'string' ? Number.parseInt(total, 10) : Number(total);

  if (!Number.isFinite(numeric) || Number.isNaN(numeric)) {
    return undefined;
  }

  return new Prisma.Decimal(numeric).dividedBy(100);
};

async function ensureOrganization(
  tx: Prisma.TransactionClient,
  contact: Required<Pick<ContactInfo, 'email'>> & ContactInfo,
  userId: string
): Promise<string> {
  const normalizedEmail = contact.email.trim().toLowerCase();
  const normalizedPhone = typeof contact.phone === 'string' ? contact.phone.trim() : null;
  const normalizedWebsite = typeof contact.website === 'string' ? contact.website.trim() : null;

  if (contact.company && contact.company.trim().length > 0) {
    const companyName = contact.company.trim();
    const companySlug = slugify(companyName);

    const organization = await tx.organization.upsert({
      where: { slug: companySlug },
      update: {
        name: companyName,
        email: normalizedEmail,
        phone: normalizedPhone,
        website: normalizedWebsite,
      },
      create: {
        name: companyName,
        slug: companySlug,
        email: normalizedEmail,
        phone: normalizedPhone,
        website: normalizedWebsite,
      },
    });

    await tx.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId,
        },
      },
      update: {
        role: 'OWNER',
      },
      create: {
        organizationId: organization.id,
        userId,
        role: 'OWNER',
      },
    });

    return organization.id;
  }

  const personalName = contact.name?.trim() || 'Client';
  const personalSlug = slugify(`personal-${userId.slice(0, 12)}`);

  const organization = await tx.organization.upsert({
    where: { slug: personalSlug },
    update: {
      name: `Personal – ${personalName}`,
      email: normalizedEmail,
    },
    create: {
      name: `Personal – ${personalName}`,
      slug: personalSlug,
      email: normalizedEmail,
    },
  });

  await tx.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId,
      },
    },
    update: {
      role: 'OWNER',
    },
    create: {
      organizationId: organization.id,
      userId,
      role: 'OWNER',
    },
  });

  return organization.id;
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  questionnaireId: string | null
): Promise<boolean> {
  if (!questionnaireId) {
    console.warn('checkout.session.completed received without questionnaire reference');
    return true;
  }

  // Get questionnaire data first to prepare receipt email data
  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: questionnaireId },
  });

  if (!questionnaire) {
    console.warn('Questionnaire not found for checkout session', { questionnaireId });
    return true;
  }

  const payload = (questionnaire.data ?? {}) as QuestionnaireData;
  const contact = payload.contact;

  if (!contact || typeof contact.email !== 'string' || contact.email.trim().length === 0) {
    console.error('Questionnaire missing contact email', { questionnaireId });
    return false;
  }

  const normalizedEmail = contact.email.trim().toLowerCase();
  const selectedService =
    typeof payload.selectedService === 'string' && payload.selectedService.trim().length > 0
      ? payload.selectedService.trim()
      : 'Project';
  
  // Capture values for receipt email (outside transaction)
  const paymentAmountCents = session.amount_total || 0;
  const receiptEmailData = {
    customerName: contact.name || contact.email.split('@')[0],
    customerEmail: normalizedEmail,
    selectedService,
    paymentAmountCents,
  };

  const description = deriveDescription(payload.questionnaire?.goals);
  const budgetDecimal = buildBudgetDecimal(payload.totals?.total);
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : undefined;

  return prisma.$transaction(async (tx) => {

    const updatedData: Prisma.InputJsonObject = {
      ...((typeof payload === 'object' && payload !== null ? (payload as Prisma.InputJsonObject) : {})),
      status: 'PAYMENT_COMPLETE',
      paidAt: new Date().toISOString(),
    };

    await tx.questionnaire.update({
      where: { id: questionnaireId },
      data: {
        data: updatedData,
      },
    });

    let user = await tx.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          name: contact.name?.trim() || undefined,
          email: normalizedEmail,
          phone: contact.phone?.trim() || null,
          company: contact.company?.trim() || null,
          role: 'CLIENT',
        },
      });
    } else {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: user.name ?? contact.name?.trim() ?? undefined,
          phone: user.phone ?? contact.phone?.trim() ?? undefined,
          company: user.company ?? contact.company?.trim() ?? undefined,
        },
      });
    }

    const organizationId = await ensureOrganization(tx, { ...contact, email: normalizedEmail }, user.id);

    const project = await tx.project.upsert({
      where: { questionnaireId },
      update: {
        name: `${selectedService} for ${contact.company || contact.name || 'Client'}`,
        description,
        status: ProjectStatus.ACTIVE,
        organization: { connect: { id: organizationId } },
        ...(budgetDecimal ? { budget: budgetDecimal } : {}),
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
      },
      create: {
        name: `${selectedService} for ${contact.company || contact.name || 'Client'}`,
        description,
        status: ProjectStatus.ACTIVE,
        organization: { connect: { id: organizationId } },
        questionnaire: { connect: { id: questionnaireId } },
        ...(budgetDecimal ? { budget: budgetDecimal } : {}),
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
      },
    });

    // Get payment amount from Stripe session (amount_total is in cents)
    const paymentAmount = paymentAmountCents > 0 ? new Prisma.Decimal(paymentAmountCents).dividedBy(100) : budgetDecimal || new Prisma.Decimal(0);

    // Create invoice for full payment (100% paid upfront)
    if (paymentAmount.gt(0)) {
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          title: 'Project Payment',
          description: `Full payment for ${selectedService} project`,
          amount: paymentAmount,
          tax: new Prisma.Decimal(0),
          total: paymentAmount,
          status: InvoiceStatus.PAID,
          organizationId: organizationId,
          projectId: project.id,
          stripeInvoiceId: session.invoice as string | undefined,
          sentAt: new Date(),
          paidAt: new Date(),
          dueDate: new Date(),
          items: {
            create: {
              description: `${selectedService} - Full Payment`,
              quantity: 1,
              rate: paymentAmount,
              amount: paymentAmount,
            },
          },
        },
      });

      // Create payment record
      if (session.payment_intent) {
        await tx.payment.create({
          data: {
            amount: paymentAmount,
            currency: 'USD',
            status: PaymentStatus.COMPLETED,
            method: 'stripe',
            stripePaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            invoiceId: invoice.id,
            processedAt: new Date(),
          },
        });
      }
    }

    return true;
  }).then(async (): Promise<boolean> => {
    // Send receipt email after transaction commits
    // Do this outside the transaction to avoid issues
    if (receiptEmailData.paymentAmountCents > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://see-zee.com';
      const dashboardUrl = `${baseUrl}/client`;
      
      try {
        const { html, text } = renderReceiptEmail({
          customerName: receiptEmailData.customerName,
          customerEmail: receiptEmailData.customerEmail,
          receiptType: 'questionnaire',
          amount: Number(receiptEmailData.paymentAmountCents) / 100,
          currency: 'USD',
          transactionId: session.id,
          description: `Full payment for ${receiptEmailData.selectedService} project`,
          items: [{
            name: `${receiptEmailData.selectedService} - Full Payment`,
            quantity: 1,
            amount: Number(receiptEmailData.paymentAmountCents) / 100,
          }],
          dashboardUrl,
        });

        await sendEmail({
          to: receiptEmailData.customerEmail,
          subject: `Payment Receipt - Project Request`,
          html,
          text,
        });

        console.log(`[QUESTIONNAIRE WEBHOOK] Receipt email sent to ${receiptEmailData.customerEmail} for questionnaire ${questionnaireId}`);
      } catch (emailError) {
        console.error('[QUESTIONNAIRE WEBHOOK] Failed to send receipt email:', emailError);
      }
      return true;
    }
    return true;
  });
}

async function handleCheckoutFailure(questionnaireId: string | null): Promise<boolean> {
  if (!questionnaireId) {
    return true;
  }

  return prisma.$transaction(async (tx) => {
    const questionnaire = await tx.questionnaire.findUnique({
      where: { id: questionnaireId },
    });

    if (!questionnaire) {
      return true;
    }

    const baseData =
      (questionnaire.data && typeof questionnaire.data === 'object'
        ? (questionnaire.data as Prisma.InputJsonObject)
        : {}) || {};

    const updatedData: Prisma.InputJsonObject = {
      ...baseData,
      status: 'PAYMENT_FAILED',
      failedAt: new Date().toISOString(),
    };

    await tx.questionnaire.update({
      where: { id: questionnaireId },
      data: {
        data: updatedData,
      },
    });

    return true;
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let parsedPayload: unknown = null;

  try {
    parsedPayload = JSON.parse(body);
  } catch (error) {
    console.warn('Failed to parse Stripe webhook payload as JSON');
  }

  let webhookRecord = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id },
  });

  if (webhookRecord?.processed) {
    return NextResponse.json({ received: true });
  }

  if (!webhookRecord) {
    webhookRecord = await prisma.webhookEvent.create({
      data: {
        eventId: event.id,
        type: event.type,
        data: (parsedPayload ?? {}) as Prisma.InputJsonValue,
      },
    });
  } else if (parsedPayload) {
    webhookRecord = await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: {
        data: parsedPayload as Prisma.InputJsonValue,
      },
    });
  }

  let processedSuccessfully = false;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const questionnaireId = session.client_reference_id || session.metadata?.qid || null;
        processedSuccessfully = await handleCheckoutSessionCompleted(session, questionnaireId);
        break;
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const questionnaireId = session.client_reference_id || session.metadata?.qid || null;
        processedSuccessfully = await handleCheckoutFailure(questionnaireId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        processedSuccessfully = true;
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    processedSuccessfully = false;
  }

  if (processedSuccessfully) {
    await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: { processed: true },
    });

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
}

