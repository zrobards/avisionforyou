import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { calculateTotals } from '@/lib/qwiz/pricing';
import { getPackage, type PackageTier } from '@/lib/qwiz/packages';
import { LeadStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      packageId,
      email,
      name,
      phone,
      company,
      projectGoals,
      timeline,
      specialRequirements,
      leadId, // Optional, if lead already created
    } = body;

    // Validate required fields
    if (!packageId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate package tier
    const validTiers: PackageTier[] = ['starter', 'pro', 'elite'];
    if (!validTiers.includes(packageId)) {
      return NextResponse.json(
        { error: 'Invalid package tier' },
        { status: 400 }
      );
    }

    // Get package details
    const pkg = getPackage(packageId);

    // Calculate pricing
    const totals = calculateTotals({
      package: packageId,
      selectedFeatures: pkg.baseIncludedFeatures,
      rush: false,
    });

    // Create or find Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        phone: phone || undefined,
        metadata: {
          package: packageId,
          company: company || '',
        },
      });
    }

    // Create or get lead ID
    let finalLeadId = leadId;
    if (!finalLeadId) {
      const lead = await prisma.lead.create({
        data: {
          name,
          email,
          phone: phone || null,
          company: company || null,
          message: `Project Goals: ${projectGoals || 'Not specified'}\n\nTimeline: ${timeline || 'Not specified'}\n\nSpecial Requirements: ${specialRequirements || 'None'}`,
          serviceType: packageId.toUpperCase(),
          source: 'Package Selection',
          status: LeadStatus.NEW,
          metadata: {
            package: packageId,
            projectGoals: projectGoals || null,
            timeline: timeline || null,
            specialRequirements: specialRequirements || null,
          },
        },
      });
      finalLeadId = lead.id;
    }

    // Build line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${pkg.title} Package - Project Deposit`,
            description: `Deposit to start your ${pkg.title} package project. Total project cost: $${(totals.total / 100).toFixed(2)}. Remaining balance will be invoiced after project kickoff.`,
            images: [],
          },
          unit_amount: totals.deposit, // Deposit amount in cents
        },
        quantity: 1,
      },
    ];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/start/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/start/cancel?package=${packageId}`,
      metadata: {
        lead_id: finalLeadId,
        package: packageId,
        package_title: pkg.title,
        customer_name: name,
        customer_email: email,
        customer_phone: phone || '',
        customer_company: company || '',
        project_goals: projectGoals || '',
        timeline: timeline || '',
        special_requirements: specialRequirements || '',
        package_base: totals.packageBase.toString(),
        deposit_amount: totals.deposit.toString(),
        total_amount: totals.total.toString(),
        remaining_balance: (totals.total - totals.deposit).toString(),
        monthly_maintenance: totals.monthly.toString(),
      },
      payment_intent_data: {
        metadata: {
          lead_id: finalLeadId,
          package: packageId,
          total_amount: totals.total.toString(),
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Package checkout session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
















