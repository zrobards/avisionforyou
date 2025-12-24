import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/activity/recent
 * Fetch recent activities across all prospects
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only CEO, CFO, or OUTREACH roles can access
    const allowedRoles = ['CEO', 'CFO', 'OUTREACH'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch recent activities with prospect data
    // Note: If ProspectActivity doesn't exist in Prisma client, this will fail gracefully
    try {
      // Safely check if the model exists
      let prospectActivityModel: any;
      try {
        prospectActivityModel = (prisma as any).prospectActivity;
        if (!prospectActivityModel || typeof prospectActivityModel.findMany !== 'function') {
          throw new Error('Model not available');
        }
      } catch {
        console.warn('ProspectActivity model not available - Prisma client needs regeneration. Run: npx prisma generate');
        return NextResponse.json({ activities: [] });
      }

      const activities = await prospectActivityModel.findMany({
        include: {
          prospect: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({ activities });
    } catch (queryError: any) {
      console.warn('ProspectActivity query failed:', queryError.message);
      return NextResponse.json({ activities: [] });
    }
  } catch (error: any) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
}

