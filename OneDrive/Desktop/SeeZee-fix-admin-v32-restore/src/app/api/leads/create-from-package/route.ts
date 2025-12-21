import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      company,
      referralSource,
      stage,
      outreachProgram,
      projectType,
      projectGoals,
      timeline,
      specialRequirements,
      package: selectedPackage,
    } = body;

    // Validate required fields
    if (!name || !email || !projectGoals || !timeline || !selectedPackage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Create lead record
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        message: `Project Goals: ${projectGoals}\n\nTimeline: ${timeline}\n\nSpecial Requirements: ${specialRequirements || 'None'}`,
        serviceType: selectedPackage.toUpperCase(),
        source: referralSource || 'Package Selection',
        status: LeadStatus.NEW,
        metadata: {
          package: selectedPackage,
          referralSource: referralSource || null,
          stage: stage || null,
          outreachProgram: outreachProgram || null,
          projectType: projectType || null,
          projectGoals,
          timeline,
          specialRequirements: specialRequirements || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Project request submitted successfully',
    });
  } catch (error) {
    console.error('Error creating lead from package:', error);
    return NextResponse.json(
      { error: 'Failed to submit project request' },
      { status: 500 }
    );
  }
}








