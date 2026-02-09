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

    // Get all completed donations
    const donations = await db.donation.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });

    // Calculate analytics
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const totalAllTime = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalThisYear = donations
      .filter((d) => d.createdAt >= startOfYear)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalThisMonth = donations
      .filter((d) => d.createdAt >= startOfMonth)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalThisWeek = donations
      .filter((d) => d.createdAt >= startOfWeek)
      .reduce((sum, d) => sum + d.amount, 0);

    // Donation count by frequency
    const donationCountByFrequency = donations.reduce(
      (acc, d) => {
        acc[d.frequency] = (acc[d.frequency] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Average donation amount
    const avgAmount = donations.length > 0 ? totalAllTime / donations.length : 0;

    // Top donors (anonymized if no name)
    const donorMap = new Map<string, { name: string; total: number }>();
    donations.forEach((d) => {
      const key = d.email || d.userId || "anonymous";
      const existing = donorMap.get(key);
      const name = d.name || "Anonymous Donor";

      if (existing) {
        existing.total += d.amount;
      } else {
        donorMap.set(key, { name, total: d.amount });
      }
    });

    const topDonors = Array.from(donorMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Monthly trend for last 12 months
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthDonations = donations.filter(
        (d) => d.createdAt >= month && d.createdAt < nextMonth
      );

      const total = monthDonations.reduce((sum, d) => sum + d.amount, 0);

      monthlyTrend.push({
        month: month.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        total,
        count: monthDonations.length,
      });
    }

    return NextResponse.json({
      totalAllTime,
      totalThisYear,
      totalThisMonth,
      totalThisWeek,
      donationCountByFrequency,
      avgAmount,
      topDonors,
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
