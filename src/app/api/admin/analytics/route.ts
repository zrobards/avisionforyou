import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // === PARALLEL QUERY BATCH 1: Independent counts & aggregates ===
    const [
      // User metrics
      totalUsers,
      newUsersLast30Days,
      newUsersPrevious30Days,
      activeUsersLast30Days,
      cohortUsers,
      // Donation metrics (aggregated at DB level)
      totalDonations,
      totalAmountAgg,
      donationsLast30Days,
      amountLast30DaysAgg,
      amountPrevious30DaysAgg,
      recurringDonors,
      usersWhoDonated,
      donationsByFrequency,
      // Engagement metrics
      totalMeetings,
      upcomingMeetings,
      totalRSVPs,
      rsvpsLast30Days,
      confirmedRSVPs,
      popularMeetings,
      // Program interest
      programInterestGroups,
      // Admission inquiries
      totalInquiries,
      inquiriesLast30Days,
      processedInquiries,
      // Blog metrics
      totalBlogPosts,
      blogViewsAgg,
      // Funnel metrics
      assessmentToRSVP,
      rsvpToDonation,
    ] = await Promise.all([
      // --- User metrics ---
      db.user.count(),
      db.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      db.user.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
      }),
      db.user.count({
        where: {
          OR: [
            { rsvps: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { donations: { some: { createdAt: { gte: thirtyDaysAgo } } } }
          ]
        }
      }),
      db.user.findMany({
        where: { createdAt: { gte: ninetyDaysAgo, lt: sixtyDaysAgo } },
        select: { id: true }
      }),

      // --- Donation metrics (DB-level aggregation) ---
      db.donation.count(),
      db.donation.aggregate({ _sum: { amount: true } }),
      db.donation.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      db.donation.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { amount: true }
      }),
      db.donation.aggregate({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { amount: true }
      }),
      db.donation.count({
        where: { frequency: { not: 'ONE_TIME' } }
      }),
      db.user.count({
        where: { donations: { some: {} } }
      }),
      db.donation.groupBy({
        by: ['frequency'],
        _count: true,
        _sum: { amount: true }
      }),

      // --- Engagement metrics ---
      db.programSession.count(),
      db.programSession.count({
        where: { startDate: { gte: now } }
      }),
      db.rSVP.count(),
      db.rSVP.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      db.rSVP.count({
        where: { status: 'CONFIRMED' }
      }),
      db.programSession.findMany({
        select: {
          id: true,
          title: true,
          startDate: true,
          _count: { select: { rsvps: true } }
        },
        orderBy: { rsvps: { _count: 'desc' } },
        take: 5
      }),

      // --- Program interest (DB-level groupBy) ---
      db.assessment.groupBy({
        by: ['recommendedProgram'],
        _count: true
      }),

      // --- Admission inquiries ---
      db.admissionInquiry.count(),
      db.admissionInquiry.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      db.admissionInquiry.count({
        where: { status: 'PROCESSED' }
      }),

      // --- Blog metrics ---
      db.blogPost.count({
        where: { status: 'PUBLISHED' }
      }),
      db.blogPost.aggregate({
        where: { status: 'PUBLISHED' },
        _sum: { views: true }
      }),

      // --- Funnel metrics ---
      db.user.count({
        where: {
          AND: [
            { assessment: { isNot: null } },
            { rsvps: { some: {} } }
          ]
        }
      }),
      db.user.count({
        where: {
          AND: [
            { rsvps: { some: {} } },
            { donations: { some: {} } }
          ]
        }
      }),
    ]);

    // === Derived values from batch 1 ===
    const totalAmount = Number(totalAmountAgg._sum.amount ?? 0);
    const amountLast30Days = Number(amountLast30DaysAgg._sum.amount ?? 0);
    const amountPrevious30Days = Number(amountPrevious30DaysAgg._sum.amount ?? 0);
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    const donationConversionRate = totalUsers > 0 ? (usersWhoDonated / totalUsers) * 100 : 0;

    const userGrowthRate = newUsersPrevious30Days > 0
      ? ((newUsersLast30Days - newUsersPrevious30Days) / newUsersPrevious30Days) * 100
      : 0;

    const donationGrowthRate = amountPrevious30Days > 0
      ? ((amountLast30Days - amountPrevious30Days) / amountPrevious30Days) * 100
      : 0;

    const attendanceRate = totalRSVPs > 0 ? (confirmedRSVPs / totalRSVPs) * 100 : 0;
    const avgRSVPsPerUser = activeUsersLast30Days > 0 ? rsvpsLast30Days / activeUsersLast30Days : 0;

    const totalBlogViews = Number(blogViewsAgg._sum.views ?? 0);
    const avgViewsPerPost = totalBlogPosts > 0 ? Math.round(totalBlogViews / totalBlogPosts) : 0;

    const inquiryResponseRate = totalInquiries > 0 ? (processedInquiries / totalInquiries) * 100 : 0;

    // Map program interest from groupBy results
    const programInterest = programInterestGroups
      .map(g => ({
        program: g.recommendedProgram || 'Unknown',
        count: g._count
      }))
      .sort((a, b) => b.count - a.count);

    const assessmentCompleted = programInterestGroups.reduce((sum, g) => sum + g._count, 0);

    // Map donation methods from groupBy results
    const frequencyLabelMap: Record<string, string> = {
      ONE_TIME: 'One-Time',
      MONTHLY: 'Monthly',
      YEARLY: 'Yearly',
    };
    const donationMethods = donationsByFrequency
      .map(g => ({
        method: frequencyLabelMap[g.frequency] || g.frequency,
        count: g._count,
        amount: Number(g._sum.amount ?? 0)
      }))
      .filter(m => m.count > 0);

    // === PARALLEL QUERY BATCH 2: Retention + Trends + Top Donors ===
    const cohortIds = cohortUsers.map(u => u.id);

    const [
      retainedUsers,
      userGrowthTrend,
      donationTrend,
      topDonorsRaw,
    ] = await Promise.all([
      // Retention
      cohortIds.length > 0
        ? db.user.count({
            where: {
              id: { in: cohortIds },
              OR: [
                { rsvps: { some: { createdAt: { gte: thirtyDaysAgo } } } },
                { donations: { some: { createdAt: { gte: thirtyDaysAgo } } } }
              ]
            }
          })
        : Promise.resolve(0),

      // User Growth Trend (last 6 months) - parallel
      Promise.all(
        Array.from({ length: 6 }, (_, idx) => {
          const i = 5 - idx;
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          return db.user.count({
            where: { createdAt: { gte: monthStart, lte: monthEnd } }
          }).then(count => ({
            month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count
          }));
        })
      ),

      // Donation Trend (last 6 months) - parallel
      Promise.all(
        Array.from({ length: 6 }, (_, idx) => {
          const i = 5 - idx;
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          return Promise.all([
            db.donation.aggregate({
              where: { createdAt: { gte: monthStart, lte: monthEnd } },
              _sum: { amount: true },
              _count: true
            }),
            Promise.resolve(monthStart)
          ]).then(([agg, ms]) => ({
            month: ms.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            amount: Number(agg._sum.amount ?? 0),
            count: agg._count
          }));
        })
      ),

      // Top Donors - limited findMany instead of full table scan
      db.donation.findMany({
        select: {
          name: true,
          email: true,
          amount: true,
        },
        orderBy: { amount: 'desc' },
        take: 100
      }),
    ]);

    const retentionRate = cohortIds.length > 0 ? (retainedUsers / cohortIds.length) * 100 : 0;

    // Aggregate top donors from the limited result set
    const topDonors = topDonorsRaw
      .reduce((acc: { name: string; amount: number; count: number }[], d) => {
        const donorKey = d.name || d.email || 'Anonymous';
        const existing = acc.find(donor => donor.name === donorKey);
        if (existing) {
          existing.amount += Number(d.amount);
          existing.count += 1;
        } else {
          acc.push({ name: donorKey, amount: Number(d.amount), count: 1 });
        }
        return acc;
      }, [])
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // === Funnel rates ===
    const assessmentToRSVPRate = assessmentCompleted > 0 ? (assessmentToRSVP / assessmentCompleted) * 100 : 0;
    const rsvpToDonationRate = assessmentToRSVP > 0 ? (rsvpToDonation / assessmentToRSVP) * 100 : 0;

    // === INSIGHTS ===
    const insights = [];

    if (donationConversionRate < 10) {
      insights.push({
        type: 'warning',
        title: 'Low Donation Conversion',
        message: `Only ${donationConversionRate.toFixed(1)}% of users have donated. Consider adding donation prompts or highlighting impact stories.`
      });
    }

    if (retentionRate < 30) {
      insights.push({
        type: 'warning',
        title: 'Low User Retention',
        message: `Only ${retentionRate.toFixed(1)}% of users remain active after 90 days. Focus on engagement and follow-up communications.`
      });
    }

    if (userGrowthRate > 20) {
      insights.push({
        type: 'success',
        title: 'Strong User Growth',
        message: `User growth increased by ${userGrowthRate.toFixed(1)}% this month. Keep up the momentum!`
      });
    }

    if (donationGrowthRate > 15) {
      insights.push({
        type: 'success',
        title: 'Donation Growth Accelerating',
        message: `Donations increased by ${donationGrowthRate.toFixed(1)}% this month. Your fundraising efforts are paying off!`
      });
    }

    if (assessmentToRSVPRate < 25) {
      insights.push({
        type: 'info',
        title: 'Assessment to RSVP Gap',
        message: `Only ${assessmentToRSVPRate.toFixed(1)}% of users who complete assessments RSVP to meetings. Improve meeting visibility after assessments.`
      });
    }

    if (topDonors.length > 0 && topDonors[0].amount > totalAmount * 0.2) {
      insights.push({
        type: 'info',
        title: 'Donor Concentration Risk',
        message: `Top donor contributes ${((topDonors[0].amount / totalAmount) * 100).toFixed(1)}% of total revenue. Diversify donor base for sustainability.`
      });
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsersLast30Days,
        newUsersLast30Days,
        userGrowthRate: Math.round(userGrowthRate * 10) / 10,
        retentionRate: Math.round(retentionRate * 10) / 10,
        userGrowthTrend
      },
      donations: {
        total: totalDonations,
        last30Days: donationsLast30Days,
        totalAmount,
        amountLast30Days,
        averageDonation: Math.round(averageDonation * 100) / 100,
        conversionRate: Math.round(donationConversionRate * 10) / 10,
        recurringDonors,
        growthRate: Math.round(donationGrowthRate * 10) / 10,
        donationTrend,
        donationMethods,
        topDonors
      },
      engagement: {
        totalMeetings,
        upcomingMeetings,
        totalRSVPs,
        rsvpsLast30Days,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        avgRSVPsPerUser: Math.round(avgRSVPsPerUser * 10) / 10,
        popularMeetings
      },
      programs: {
        assessmentsCompleted: assessmentCompleted,
        programInterest
      },
      admissions: {
        totalInquiries,
        inquiriesLast30Days,
        responseRate: Math.round(inquiryResponseRate * 10) / 10
      },
      content: {
        totalBlogPosts,
        totalBlogViews,
        avgViewsPerPost
      },
      funnel: {
        assessmentCompleted,
        assessmentToRSVP,
        rsvpToDonation,
        assessmentToRSVPRate: Math.round(assessmentToRSVPRate * 10) / 10,
        rsvpToDonationRate: Math.round(rsvpToDonationRate * 10) / 10
      },
      insights
    });
  } catch (error) {
    logger.error({ err: error }, 'Analytics error');
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
