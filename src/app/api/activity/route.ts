import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user || (user.role !== "BOARD" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const activities = await db.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Activity GET error:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
