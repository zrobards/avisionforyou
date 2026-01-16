import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch impact metrics from database
    const [meetings, rsvps, donations] = await Promise.all([
      db.meeting.count(),
      db.rSVP.count(),
      db.donation.aggregate({
        _sum: {
          amount: true
        }
      })
    ])

    // Calculate lives impacted (rough estimate based on RSVPs and unique donors)
    const uniqueDonors = await db.donation.groupBy({
      by: ['userId'],
      _count: true
    })

    const livesImpacted = rsvps.length + uniqueDonors.length

    return NextResponse.json({
      totalMeetings: meetings,
      totalRSVPs: rsvps,
      totalDonations: Math.round(donations._sum.amount || 0),
      livesImpacted: livesImpacted
    })
  } catch (error) {
    console.error('Error fetching impact metrics:', error)
    
    // Return fallback data if database query fails
    return NextResponse.json({
      totalMeetings: 0,
      totalRSVPs: 0,
      totalDonations: 0,
      livesImpacted: 0
    })
  }
}
