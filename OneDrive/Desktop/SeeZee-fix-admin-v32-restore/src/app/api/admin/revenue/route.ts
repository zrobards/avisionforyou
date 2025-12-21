import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { ROLE, isStaffRole } from "@/lib/role";
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const months = parseInt(searchParams.get("months") || "6", 10);

    // Get revenue data for the last N months
    const now = new Date();
    const revenueData = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      // Get paid invoices for this month
      const paidInvoices = await db.invoice.findMany({
        where: {
          status: "PAID",
          paidAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          total: true,
        },
      });

      const monthlyRevenue = paidInvoices.reduce(
        (sum, inv) => sum + Number(inv.total || 0),
        0
      );

      revenueData.push({
        month: format(monthDate, "MMM yyyy"),
        revenue: monthlyRevenue,
        invoices: paidInvoices.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}

