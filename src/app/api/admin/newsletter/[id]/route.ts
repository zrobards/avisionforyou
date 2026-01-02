import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// GET - Fetch single newsletter
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: params.id },
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
    console.error('Error fetching newsletter:', error)
    return NextResponse.json({ error: 'Failed to fetch newsletter' }, { status: 500 })
  }
}

// PATCH - Update newsletter
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, excerpt, imageUrl, status } = body

    const updateData: any = {
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
        where: { id: params.id },
        select: { publishedAt: true }
      })
      if (!existing?.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const newsletter = await prisma.newsletter.update({
      where: { id: params.id },
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
    console.error('Error updating newsletter:', error)
    return NextResponse.json({ error: 'Failed to update newsletter' }, { status: 500 })
  }
}

// DELETE - Delete newsletter
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.newsletter.delete({
      where: { id: params.id }
    })

    // Revalidate pages to remove deleted newsletter instantly
    revalidatePath('/newsletter')
    revalidatePath('/admin/newsletter')
    revalidatePath('/api/public/newsletter')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting newsletter:', error)
    return NextResponse.json({ error: 'Failed to delete newsletter' }, { status: 500 })
  }
}
