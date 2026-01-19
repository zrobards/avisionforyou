import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const duiClass = await db.dUIClass.findUnique({
      where: { id: params.classId },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!duiClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(duiClass);
  } catch (error) {
    console.error("Error fetching DUI class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}
