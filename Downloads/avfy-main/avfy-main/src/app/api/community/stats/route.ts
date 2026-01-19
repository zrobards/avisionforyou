import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "ALUMNI" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id

  const [attended, upcoming] = await Promise.all([
    // Count RSVPs where status is CONFIRMED and the meeting has passed
    db.rSVP.count({
      where: {
        userId,
        status: "CONFIRMED",
        session: {
          endDate: { lt: new Date() }
        }
      }
    }),
    // Count future RSVPs with CONFIRMED status
    db.rSVP.count({
      where: {
        userId,
        session: {
          startDate: { gte: new Date() }
        },
        status: "CONFIRMED"
      }
    })
  ])

  return NextResponse.json({ attended, upcoming })
}
