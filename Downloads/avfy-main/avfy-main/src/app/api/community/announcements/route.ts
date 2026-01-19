import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "ALUMNI" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")

  const announcements = await db.communityAnnouncement.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      author: {
        select: { name: true, email: true }
      }
    }
  })

  return NextResponse.json(announcements)
}
