import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get donation statistics
    const donations = await db.donation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const averageDonation = donations.length > 0 ? totalAmount / donations.length : 0;

    // Group by month
    const monthlyTrend: { [key: string]: number } = {};
    donations.forEach((d) => {
      const month = new Date(d.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyTrend[month] = (monthlyTrend[month] || 0) + d.amount;
    });

    const monthlyTrendArray = Object.entries(monthlyTrend).map(([month, amount]) => ({ month, amount }));

    // Group by frequency (one-time vs recurring)
    const donationMethods = [
      {
        method: 'One-Time Donation',
        count: donations.filter((d) => d.frequency === 'ONE_TIME').length,
        amount: donations.filter((d) => d.frequency === 'ONE_TIME').reduce((sum, d) => sum + d.amount, 0),
      },
      {
        method: 'Monthly Recurring',
        count: donations.filter((d) => d.frequency === 'MONTHLY').length,
        amount: donations.filter((d) => d.frequency === 'MONTHLY').reduce((sum, d) => sum + d.amount, 0),
      },
      {
        method: 'Annual Recurring',
        count: donations.filter((d) => d.frequency === 'YEARLY').length,
        amount: donations.filter((d) => d.frequency === 'YEARLY').reduce((sum, d) => sum + d.amount, 0),
      },
    ].filter((m) => m.count > 0);

    // Top donors (anonymized)
    const topDonors = donations
      .reduce(
        (acc: { name: string; amount: number; count: number }[], d) => {
          const donorKey = d.name || d.email || 'Anonymous';
          const existing = acc.find((donor) => donor.name === donorKey);
          if (existing) {
            existing.amount += d.amount;
            existing.count += 1;
          } else {
            acc.push({
              name: donorKey,
              amount: d.amount,
              count: 1,
            });
          }
          return acc;
        },
        []
      )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Get user statistics
    const users = await db.user.findMany();
    const activeUsers = users.filter((u) => {
      const lastActive = new Date(u.updatedAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastActive > thirtyDaysAgo;
    });

    const currentMonth = new Date();
    currentMonth.setDate(1);
    const newUsersThisMonth = users.filter((u) => new Date(u.createdAt) >= currentMonth).length;

    const usersWithAssessment = await db.assessment.findMany();

    const userRetention = users.length > 0 ? Math.round((activeUsers.length / users.length) * 100) : 0;

    return NextResponse.json({
      donations: {
        totalDonations: donations.length,
        totalAmount,
        averageDonation,
        monthlyTrend: monthlyTrendArray,
        topDonors,
        donationMethods,
      },
      users: {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        newUsersThisMonth,
        usersWithAssessment: usersWithAssessment.length,
        userRetention,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
