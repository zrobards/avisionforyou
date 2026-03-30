import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/meetings/ical?id=SESSION_ID
 *
 * Returns an .ics calendar file for a specific meeting/session.
 * Public endpoint — no auth required (meetings are public info).
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const session = await db.programSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const start = formatICalDate(new Date(session.startDate))
    const end = formatICalDate(new Date(session.endDate))
    const now = formatICalDate(new Date())
    const uid = `${session.id}@avisionforyourecovery.org`

    const location = session.location || session.link || ""
    const description = (session.description || "")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//A Vision For You//AVFY//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcal(session.title)}`,
      `DESCRIPTION:${description}`,
      location ? `LOCATION:${escapeIcal(location)}` : "",
      session.link ? `URL:${session.link}` : "",
      "ORGANIZER;CN=A Vision For You:mailto:info@avisionforyourecovery.org",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n")

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slugify(session.title)}.ics"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to generate calendar file" }, { status: 500 })
  }
}

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function escapeIcal(text: string): string {
  return text.replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n")
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
}
