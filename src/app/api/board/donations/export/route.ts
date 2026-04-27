import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/apiAuth";
import { getVisibleDonationsForDashboard } from "@/lib/donations";

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

    // Rate limit: 10 exports per hour per user
    const rateLimit = checkRateLimit(`board-donations-export:${user.id}`, 10, 3600);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfter || 60);
    }

    const donations = await db.donation.findMany({
      orderBy: { createdAt: "desc" },
    });

    const visibleDonations = await getVisibleDonationsForDashboard(donations)

    // Create CSV content
    const headers = ["Date", "Name", "Email", "Amount", "Frequency", "Status"];
    const rows = visibleDonations.map((d) => [
      d.createdAt.toLocaleDateString(),
      d.name || "Anonymous",
      d.email || "",
      `$${Number(d.amount).toFixed(2)}`,
      d.frequency,
      d.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="donations-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error exporting donations");
    return NextResponse.json(
      { error: "Failed to export donations" },
      { status: 500 }
    );
  }
}
