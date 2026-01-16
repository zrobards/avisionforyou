import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAuditAction, AuditAction, AuditEntity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// GET all team members
export async function GET(request: NextRequest) {
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
        { error: 'Admin or staff access required' },
        { status: 403 }
      )
    }

    const teamMembers = await db.teamMember.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ data: teamMembers })
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

// POST create new team member
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

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      title,
      role,
      bio,
      credentials,
      email,
      phone,
      linkedin,
      imageUrl,
      order,
      isActive
    } = body

    // Validate required fields
    if (!name || !title || !bio) {
      return NextResponse.json(
        { error: 'Name, title, and bio are required' },
        { status: 400 }
      )
    }

    const teamMember = await db.teamMember.create({
      data: {
        name,
        title,
        role: role || 'STAFF',
        bio,
        credentials,
        email,
        phone,
        linkedin,
        imageUrl,
        order: order !== undefined ? order : 999,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    // Log audit trail
    await logAuditAction({
      action: AuditAction.CREATE,
      entity: AuditEntity.TEAM_MEMBER,
      entityId: teamMember.id,
      userId: user.id,
      details: {
        name: teamMember.name,
        title: teamMember.title,
        role: teamMember.role
      },
      req: request
    })

    return NextResponse.json({ teamMember })
  } catch (error) {
    console.error('Failed to create team member:', error)
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    )
  }
}
