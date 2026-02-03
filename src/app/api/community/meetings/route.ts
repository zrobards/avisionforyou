import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "ALUMNI" && (session.user as any).role !== "BOARD" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const upcoming = searchParams.get("upcoming") === "true"
  const limit = parseInt(searchParams.get("limit") || "50")
  const userId = (session.user as any).id

  // Fetch Program Sessions (free sessions)
  const sessionWhere = upcoming 
    ? { startDate: { gte: new Date() } }
    : {}

  const sessions = await db.programSession.findMany({
    where: sessionWhere,
    orderBy: { startDate: upcoming ? "asc" : "desc" },
    take: limit,
    include: {
      program: {
        select: { name: true, slug: true }
      }
    }
  })

  // Fetch DUI Classes
  const classWhere = upcoming
    ? { active: true, date: { gte: new Date() } }
    : { active: true }

  const classes = await db.dUIClass.findMany({
    where: classWhere,
    orderBy: { date: upcoming ? "asc" : "desc" },
    take: limit,
    include: {
      _count: {
        select: {
          registrations: {
            where: {
              status: { not: "CANCELLED" }
            }
          }
        }
      }
    }
  })

  // Get user's RSVPs for sessions
  const userRsvps = await db.rSVP.findMany({
    where: { userId },
    select: { sessionId: true, status: true }
  })

  // Get user's DUI class registrations
  const userDuiRegistrations = await db.dUIRegistration.findMany({
    where: { 
      userId,
      status: { not: "CANCELLED" }
    },
    select: { classId: true, status: true }
  })

  const rsvpMap = new Map(userRsvps.map(r => [r.sessionId, r.status]))
  const duiRegMap = new Map(userDuiRegistrations.map(r => [r.classId, r.status]))

  // Format sessions with RSVP status
  const sessionsWithStatus = sessions.map(session => ({
    ...session,
    type: 'session' as const,
    userRsvpStatus: rsvpMap.get(session.id) || null
  }))

  // Format classes with registration status
  const classesWithStatus = classes.map(duiClass => ({
    id: duiClass.id,
    title: duiClass.title,
    description: duiClass.description || '',
    startDate: duiClass.date.toISOString(),
    endDate: new Date(new Date(duiClass.date).setHours(23, 59, 59)).toISOString(),
    location: duiClass.location,
    format: 'IN_PERSON' as const,
    link: null,
    program: {
      name: 'DUI Education Classes',
      slug: 'dui-classes'
    },
    type: 'class' as const,
    price: duiClass.price,
    capacity: duiClass.capacity,
    startTime: duiClass.startTime,
    endTime: duiClass.endTime,
    instructor: duiClass.instructor,
    spotsAvailable: duiClass.capacity - duiClass._count.registrations,
    userRsvpStatus: duiRegMap.get(duiClass.id) || null
  }))

  // Combine and sort by date
  const allItems = [...sessionsWithStatus, ...classesWithStatus]
  allItems.sort((a, b) => {
    const dateA = new Date(a.startDate).getTime()
    const dateB = new Date(b.startDate).getTime()
    return upcoming ? dateA - dateB : dateB - dateA
  })

  return NextResponse.json(allItems.slice(0, limit))
}
