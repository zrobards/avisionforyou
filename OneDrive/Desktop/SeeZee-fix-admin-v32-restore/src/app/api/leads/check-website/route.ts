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

    const { leadId, url } = await req.json();

    // Get lead
    const lead = await db.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Use provided URL or lead's existing URL
    const websiteUrl = url || lead.websiteUrl;

    if (!websiteUrl) {
      return NextResponse.json({ 
        error: 'No website URL provided' 
      }, { status: 400 });
    }

    // Check website
    const analysis = await checkWebsite(websiteUrl);

    // Update lead with results
    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: {
        hasWebsite: analysis.scores.reachable,
        websiteQuality: analysis.quality,
        needsAssessment: {
          issues: analysis.issues,
          scores: analysis.scores,
          checkedAt: new Date().toISOString()
        } as any,
        websiteUrl: websiteUrl
      }
    });

    // Recalculate lead score
    const newScore = calculateLeadScore(updatedLead);
    await db.lead.update({
      where: { id: leadId },
      data: { leadScore: newScore }
    });

    return NextResponse.json({
      success: true,
      analysis,
      newScore,
      lead: updatedLead
    });

  } catch (error) {
    console.error('Error checking website:', error);
    return NextResponse.json({ 
      error: 'Failed to check website',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
