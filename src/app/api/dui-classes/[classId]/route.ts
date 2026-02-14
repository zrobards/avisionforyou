import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from '@/lib/logger'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const duiClass = await db.dUIClass.findUnique({
      where: { id: classId },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!duiClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(duiClass);
  } catch (error) {
    logger.error({ err: error }, "Error fetching DUI class");
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}
