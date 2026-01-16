import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAuditAction, AuditAction, AuditEntity } from '@/lib/audit'

// GET single team member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teamMember = await db.teamMember.findUnique({
      where: { id: params.id }
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ teamMember })
  } catch (error) {
    console.error('Failed to fetch team member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team member' },
      { status: 500 }
    )
  }
}

// PATCH update team member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const teamMember = await db.teamMember.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(title && { title }),
        ...(role && { role }),
        ...(bio && { bio }),
        ...(credentials !== undefined && { credentials }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(linkedin !== undefined && { linkedin }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    })

    // Log audit trail
    await logAuditAction({
      action: AuditAction.UPDATE,
      entity: AuditEntity.TEAM_MEMBER,
      entityId: params.id,
      userId: user.id,
      details: {
        name: teamMember.name,
        title: teamMember.title,
        updatedFields: Object.keys(body)
      },
      req: request
    })

    return NextResponse.json({ teamMember })
  } catch (error) {
    console.error('Failed to update team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// DELETE team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get team member before deletion for audit log
    const teamMemberToDelete = await db.teamMember.findUnique({
      where: { id: params.id }
    })

    await db.teamMember.delete({
      where: { id: params.id }
    })

    // Log audit trail
    await logAuditAction({
      action: AuditAction.DELETE,
      entity: AuditEntity.TEAM_MEMBER,
      entityId: params.id,
      userId: user.id,
      details: {
        deletedName: teamMemberToDelete?.name,
        deletedTitle: teamMemberToDelete?.title
      },
      req: request
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete team member:', error)
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
}
