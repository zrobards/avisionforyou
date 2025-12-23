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

    // Get all leads
    const leads = await db.lead.findMany();

    let updated = 0;
    const results = [];

    for (const lead of leads) {
      const score = calculateLeadScore(lead);
      
      await db.lead.update({
        where: { id: lead.id },
        data: { leadScore: score }
      });

      updated++;
      results.push({ id: lead.id, name: lead.name, score });
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated scores for ${updated} leads`,
      total: leads.length,
      results
    });

  } catch (error) {
    console.error('Error recalculating scores:', error);
    return NextResponse.json({ 
      error: 'Failed to recalculate scores' 
    }, { status: 500 });
  }
}
