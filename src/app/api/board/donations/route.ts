import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "BOARD" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Use DB-level aggregation instead of client-side loops
    const [
      totalAllTimeAgg,
      totalThisYearAgg,
      totalThisMonthAgg,
      totalThisWeekAgg,
      donationCountByFrequency,
      recentDonations,
    ] = await Promise.all([
      db.donation.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
        _count: true,
      }),
      db.donation.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      db.donation.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      db.donation.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: startOfWeek } },
        _sum: { amount: true },
      }),
      db.donation.groupBy({
        by: ["frequency"],
        where: { status: "COMPLETED" },
        _count: true,
      }),
      db.donation.findMany({
        where: { status: "COMPLETED" },
        select: {
          id: true,
          amount: true,
          frequency: true,
          createdAt: true,
          name: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const totalAllTime = Number(totalAllTimeAgg._sum.amount ?? 0);
    const totalCount = totalAllTimeAgg._count;
    const avgAmount = totalCount > 0 ? totalAllTime / totalCount : 0;

    // Monthly trend via DB grouping (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const monthlyDonations = await db.donation.findMany({
      where: { status: "COMPLETED", createdAt: { gte: twelveMonthsAgo } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by month in a single pass
    const monthlyMap = new Map<string, { total: number; count: number }>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      monthlyMap.set(key, { total: 0, count: 0 });
    }

    for (const d of monthlyDonations) {
      const key = d.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.total += Number(d.amount);
        entry.count += 1;
      }
    }

    const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      total: data.total,
      count: data.count,
    }));

    return NextResponse.json({
      totalAllTime,
      totalThisYear: Number(totalThisYearAgg._sum.amount ?? 0),
      totalThisMonth: Number(totalThisMonthAgg._sum.amount ?? 0),
      totalThisWeek: Number(totalThisWeekAgg._sum.amount ?? 0),
      donationCountByFrequency: Object.fromEntries(
        donationCountByFrequency.map((g) => [g.frequency, g._count])
      ),
      avgAmount,
      recentDonations,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Error fetching donation analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation analytics" },
      { status: 500 }
    );
  }
}
