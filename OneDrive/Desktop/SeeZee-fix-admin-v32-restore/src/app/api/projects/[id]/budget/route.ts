import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { budget } = await req.json();

    if (budget === undefined || budget === null) {
      return NextResponse.json(
        { error: "budget is required" },
        { status: 400 }
      );
    }

    const budgetNumber = Number(budget);
    if (isNaN(budgetNumber) || budgetNumber < 0) {
      return NextResponse.json(
        { error: "budget must be a valid positive number" },
        { status: 400 }
      );
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { budget: budgetNumber },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Failed to update project budget:", error);
    return NextResponse.json(
      { error: "Failed to update project budget" },
      { status: 500 }
    );
  }
}









