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

    const donations = await db.donation.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Create CSV content
    const headers = ["Date", "Name", "Email", "Amount", "Frequency", "Status"];
    const rows = donations.map((d) => [
      d.createdAt.toLocaleDateString(),
      d.name || "Anonymous",
      d.email || "",
      `$${d.amount.toFixed(2)}`,
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
    console.error("Error exporting donations:", error);
    return NextResponse.json(
      { error: "Failed to export donations" },
      { status: 500 }
    );
  }
}
