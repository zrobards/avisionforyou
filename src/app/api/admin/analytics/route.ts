import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // === USER METRICS ===
    const totalUsers = await db.user.count();
    const newUsersLast30Days = await db.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    const newUsersPrevious30Days = await db.user.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });
    
    const activeUsersLast30Days = await db.user.count({
      where: {
        OR: [
          { rsvps: { some: { createdAt: { gte: thirtyDaysAgo } } } },
          { donations: { some: { createdAt: { gte: thirtyDaysAgo } } } }
        ]
      }
    });

    const userGrowthRate = newUsersPrevious30Days > 0
      ? ((newUsersLast30Days - newUsersPrevious30Days) / newUsersPrevious30Days) * 100
      : 0;

    // Retention Rate (90-day cohort)
    const cohortUsers = await db.user.findMany({
      where: { createdAt: { gte: ninetyDaysAgo, lt: sixtyDaysAgo } },
      select: { id: true }
    });
    const cohortIds = cohortUsers.map(u => u.id);
    const retainedUsers = await db.user.count({
      where: {
        id: { in: cohortIds },
        OR: [
          { rsvps: { some: { createdAt: { gte: thirtyDaysAgo } } } },
          { donations: { some: { createdAt: { gte: thirtyDaysAgo } } } }
        ]
      }
    });
    const retentionRate = cohortIds.length > 0 ? (retainedUsers / cohortIds.length) * 100 : 0;

    // User Growth Trend (last 6 months)
    const userGrowthTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await db.user.count({
        where: { createdAt: { gte: monthStart, lte: monthEnd } }
      });
      userGrowthTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      });
    }

    // === DONATION METRICS ===
    const donations = await db.donation.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const totalDonations = donations.length;
    const donationsLast30Days = donations.filter(d => new Date(d.createdAt) >= thirtyDaysAgo).length;
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const amountLast30Days = donations.filter(d => new Date(d.createdAt) >= thirtyDaysAgo)
      .reduce((sum, d) => sum + d.amount, 0);
    const amountPrevious30Days = donations.filter(d => {
      const date = new Date(d.createdAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).reduce((sum, d) => sum + d.amount, 0);
    
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    
    const usersWhoDonated = await db.user.count({
      where: { donations: { some: {} } }
    });
    const donationConversionRate = totalUsers > 0 ? (usersWhoDonated / totalUsers) * 100 : 0;
    
    const recurringDonors = donations.filter(d => d.frequency !== 'ONE_TIME').length;
    
    const donationGrowthRate = amountPrevious30Days > 0
      ? ((amountLast30Days - amountPrevious30Days) / amountPrevious30Days) * 100
      : 0;

    // Donation Trend (last 6 months)
    const donationTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthDonations = donations.filter(d => {
        const date = new Date(d.createdAt);
        return date >= monthStart && date <= monthEnd;
      });
      donationTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthDonations.reduce((sum, d) => sum + d.amount, 0),
        count: monthDonations.length
      });
    }

    // Donation Methods
    const donationMethods = [
      {
        method: 'One-Time',
        count: donations.filter(d => d.frequency === 'ONE_TIME').length,
        amount: donations.filter(d => d.frequency === 'ONE_TIME').reduce((sum, d) => sum + d.amount, 0)
      },
      {
        method: 'Monthly',
        count: donations.filter(d => d.frequency === 'MONTHLY').length,
        amount: donations.filter(d => d.frequency === 'MONTHLY').reduce((sum, d) => sum + d.amount, 0)
      },
      {
        method: 'Yearly',
        count: donations.filter(d => d.frequency === 'YEARLY').length,
        amount: donations.filter(d => d.frequency === 'YEARLY').reduce((sum, d) => sum + d.amount, 0)
      }
    ].filter(m => m.count > 0);

    // Top Donors
    const topDonors = donations
      .reduce((acc: { name: string; amount: number; count: number }[], d) => {
        const donorKey = d.name || d.email || 'Anonymous';
        const existing = acc.find(donor => donor.name === donorKey);
        if (existing) {
          existing.amount += d.amount;
          existing.count += 1;
        } else {
          acc.push({ name: donorKey, amount: d.amount, count: 1 });
        }
        return acc;
      }, [])
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // === ENGAGEMENT METRICS ===
    const totalMeetings = await db.programSession.count();
    const upcomingMeetings = await db.programSession.count({
      where: { startDate: { gte: now } }
    });
    const totalRSVPs = await db.rSVP.count();
    const rsvpsLast30Days = await db.rSVP.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    const confirmedRSVPs = await db.rSVP.count({
      where: { status: 'CONFIRMED' }
    });
    const attendanceRate = totalRSVPs > 0 ? (confirmedRSVPs / totalRSVPs) * 100 : 0;
    const avgRSVPsPerUser = activeUsersLast30Days > 0 ? rsvpsLast30Days / activeUsersLast30Days : 0;

    // Popular Meetings
    const popularMeetings = await db.programSession.findMany({
      select: {
        id: true,
        title: true,
        startDate: true,
        _count: { select: { rsvps: true } }
      },
      orderBy: { rsvps: { _count: 'desc' } },
      take: 5
    });

    // === PROGRAM INTEREST ===
    const assessments = await db.assessment.findMany();
    const programInterest = assessments.reduce((acc: any[], a) => {
      const program = a.recommendedProgram || 'Unknown';
      const existing = acc.find(p => p.program === program);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ program, count: 1 });
      }
      return acc;
    }, []).sort((a, b) => b.count - a.count);

    // === ADMISSION INQUIRIES ===
    const totalInquiries = await db.admissionInquiry.count();
    const inquiriesLast30Days = await db.admissionInquiry.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    const processedInquiries = await db.admissionInquiry.count({
      where: { status: 'PROCESSED' }
    });
    const inquiryResponseRate = totalInquiries > 0 ? (processedInquiries / totalInquiries) * 100 : 0;

    // === BLOG METRICS ===
    const totalBlogPosts = await db.blogPost.count({
      where: { status: 'PUBLISHED' }
    });
    const blogPosts = await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { views: true }
    });
    const totalBlogViews = blogPosts.reduce((sum, p) => sum + (p.views || 0), 0);
    const avgViewsPerPost = totalBlogPosts > 0 ? Math.round(totalBlogViews / totalBlogPosts) : 0;

    // === CONVERSION FUNNEL ===
    const assessmentCompleted = assessments.length;
    const assessmentToRSVP = await db.user.count({
      where: {
        AND: [
          { assessment: { isNot: null } },
          { rsvps: { some: {} } }
        ]
      }
    });
    const rsvpToDonation = await db.user.count({
      where: {
        AND: [
          { rsvps: { some: {} } },
          { donations: { some: {} } }
        ]
      }
    });
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
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
