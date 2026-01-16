import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/team - List all team members
export async function GET() {
  try {
    const members = await db.leadership.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(members, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

// POST /api/team - Create new team member (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    const { name, title, bio, role, imageUrl, email, phone } = await request.json()

    if (!name || !title || !bio) {
      return NextResponse.json(
        { error: 'Name, title, and bio are required' },
        { status: 400 }
      )
    }

    const member = await db.leadership.create({
      data: {
        name,
        title,
        bio,
        role,
        imageUrl,
        email,
        phone
      }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    )
  }
}
