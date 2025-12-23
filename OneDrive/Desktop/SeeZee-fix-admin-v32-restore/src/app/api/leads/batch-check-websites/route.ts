import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { checkWebsite } from '@/lib/leads/website-checker';
import { calculateLeadScore } from '@/lib/leads/scoring';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'CEO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all leads with websites
    const leads = await db.lead.findMany({
      where: {
        websiteUrl: { not: null }
      }
    });

    const results = [];
    let processed = 0;

    for (const lead of leads) {
      try {
        const analysis = await checkWebsite(lead.websiteUrl!);
        
        const updatedLead = await db.lead.update({
          where: { id: lead.id },
          data: {
            hasWebsite: analysis.scores.reachable,
            websiteQuality: analysis.quality,
            needsAssessment: {
              issues: analysis.issues,
              scores: analysis.scores,
              checkedAt: new Date().toISOString()
            } as any
          }
        });

        const newScore = calculateLeadScore(updatedLead);
        await db.lead.update({
          where: { id: lead.id },
          data: { leadScore: newScore }
        });

        processed++;
        results.push({
          id: lead.id,
          name: lead.name,
          quality: analysis.quality,
          score: newScore
        });

        // Rate limiting - wait 1 second between checks
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error checking ${lead.name}:`, error);
        results.push({
          id: lead.id,
          name: lead.name,
          error: 'Failed to check'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${processed} websites`,
      total: leads.length,
      results
    });

  } catch (error) {
    console.error('Error batch checking websites:', error);
    return NextResponse.json({ 
      error: 'Failed to batch check websites' 
    }, { status: 500 });
  }
}
