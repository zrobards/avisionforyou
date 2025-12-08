import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Schema matching your frontend's payWithStripe request
const sessionRequestSchema = z.object({
  contact: z.object({
    name: z.string(),
    email: z.string().email(),
    company: z.string().optional(),
    domain: z.string().optional(),
  }),
  selections: z.object({
    pkg: z.enum(['WEBSITE', 'PORTAL', 'AUTOMATION']),
    pages: z.number(),
    features: z.array(z.string()),
    integrations: z.array(z.string()),
    rush: z.boolean(),
  }),
  amount: z.number(),
  metadata: z.object({
    package: z.string(),
    pricingRuleId: z.string().optional(),
    subtotal: z.number(),
    rush: z.number(),
    tax: z.number(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contact, selections, amount, metadata } = sessionRequestSchema.parse(body)

    // Create lead record first
    const lead = await prisma.lead.create({
      data: {
        name: contact.name,
        email: contact.email,
        company: contact.company,
        message: `Interested in ${selections.pkg} development package`,
        timeline: selections.rush ? 'rush' : 'standard',
        budget: amount > 20000 ? '20plus' : amount > 10000 ? '10to20' : amount > 5000 ? '5to10' : 'under5k',
        requirements: {
          package: selections.pkg,
          pages: selections.pages,
          features: selections.features,
          integrations: selections.integrations,
          rush: selections.rush,
          domain: contact.domain,
        },
        source: 'checkout',
      }
    })

    // Create quote record
    const quote = await prisma.quote.create({
      data: {
        serviceType: selections.pkg.toLowerCase(),
        timeline: selections.rush ? 'rush' : 'standard',
        features: [...selections.features, ...selections.integrations],
        requirements: {
          package: selections.pkg,
          pages: selections.pages,
          features: selections.features,
          integrations: selections.integrations,
          rush: selections.rush,
        },
        basePrice: metadata.subtotal - metadata.rush,
        featurePrice: 0, // Already included in subtotal
        timelineMultiplier: selections.rush ? 1.5 : 1.0,
        subtotal: metadata.subtotal,
        tax: metadata.tax,
        total: amount,
        customerName: contact.name,
        customerEmail: contact.email,
        pricingRuleId: metadata.pricingRuleId || 'default',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        convertedToLead: true,
        convertedAt: new Date(),
      }
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${selections.pkg} Development Package`,
              description: `${selections.pages} pages, ${selections.features.length} features, ${selections.integrations.length} integrations${selections.rush ? ' (Rush Delivery)' : ''}`,
              metadata: {
                package: selections.pkg,
                pages: selections.pages.toString(),
                features: JSON.stringify(selections.features),
                integrations: JSON.stringify(selections.integrations),
                rush: selections.rush.toString(),
              },
            },
            unit_amount: Math.round(amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        lead_id: lead.id,
        quote_id: quote.id,
        package: selections.pkg,
        customer_name: contact.name,
        customer_email: contact.email,
        pages: selections.pages.toString(),
        rush: selections.rush.toString(),
        subtotal: metadata.subtotal.toString(),
        tax: metadata.tax.toString(),
        total: amount.toString(),
      },
      customer_email: contact.email,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      automatic_tax: {
        enabled: false,
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}