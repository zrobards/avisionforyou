import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

// GET - Fetch single newsletter
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    return NextResponse.json(newsletter)
  } catch (error) {
    logger.error({ err: error }, 'Error fetching newsletter')
    return NextResponse.json({ error: 'Failed to fetch newsletter' }, { status: 500 })
  }
}

// PATCH - Update newsletter
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, excerpt, imageUrl, status } = body

    const updateData: Record<string, unknown> = {
      title,
      content,
      excerpt,
      imageUrl,
      status,
      updatedAt: new Date()
    }

    // Update slug if title changed
    if (title) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    // Set publishedAt if publishing
    if (status === 'PUBLISHED') {
      const existing = await prisma.newsletter.findUnique({
        where: { id },
        select: { publishedAt: true }
      })
      if (!existing?.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const newsletter = await prisma.newsletter.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Revalidate pages to show updated newsletter instantly
    revalidatePath('/newsletter')
    revalidatePath('/admin/newsletter')
    revalidatePath('/api/public/newsletter')

    return NextResponse.json(newsletter)
  } catch (error) {
    logger.error({ err: error }, 'Error updating newsletter')
    return NextResponse.json({ error: 'Failed to update newsletter' }, { status: 500 })
  }
}

// DELETE - Delete newsletter
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.newsletter.delete({
      where: { id }
    })

    // Revalidate pages to remove deleted newsletter instantly
    revalidatePath('/newsletter')
    revalidatePath('/admin/newsletter')
    revalidatePath('/api/public/newsletter')

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, 'Error deleting newsletter')
    return NextResponse.json({ error: 'Failed to delete newsletter' }, { status: 500 })
  }
}
