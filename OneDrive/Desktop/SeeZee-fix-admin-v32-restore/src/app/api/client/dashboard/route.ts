import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDashboardData } from '@/lib/dashboard-helpers';

/**
 * GET /api/client/dashboard
 * Returns unified dashboard data for the authenticated client
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id: userId, email } = session.user;
    
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 400 }
      );
    }
    
    // Fetch all dashboard data
    const data = await getDashboardData(userId, email);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

