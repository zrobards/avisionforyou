import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { calculateLeadScore } from '@/lib/leads/scoring';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'CEO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Get lead
    const lead = await db.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Calculate score
    const score = calculateLeadScore(lead);

    // Update lead
    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: { leadScore: score }
    });

    return NextResponse.json({ 
      success: true, 
      lead: updatedLead,
      score: score 
    });

  } catch (error) {
    console.error('Error calculating lead score:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate score' 
    }, { status: 500 });
  }
}
