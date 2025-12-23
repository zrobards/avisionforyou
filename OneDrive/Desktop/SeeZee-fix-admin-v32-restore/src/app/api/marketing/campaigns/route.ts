import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'CEO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Create campaign
    const campaign = await db.emailCampaign.create({
      data: {
        name: data.name,
        templateId: data.templateId,
        status: data.scheduleType === 'NOW' ? 'DRAFT' : 'SCHEDULED',
        scheduledFor: data.scheduleDate ? new Date(data.scheduleDate) : null
      }
    });

    return NextResponse.json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ 
      error: 'Failed to create campaign' 
    }, { status: 500 });
  }
}
