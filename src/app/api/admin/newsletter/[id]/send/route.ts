import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

// POST - Send newsletter to all subscribers
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: params.id }
    })

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    // Get all subscribed users
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { subscribed: true }
    })

    // TODO: Implement actual email sending using Resend
    // For now, just update the newsletter as sent
    const now = new Date()
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: params.id },
      data: {
        sentAt: now,
        sentCount: subscribers.length,
        status: 'PUBLISHED',
        publishedAt: now // Always update publishedAt when sending
      }
    })

    console.log('Newsletter sent and published:', {
      id: updatedNewsletter.id,
      title: updatedNewsletter.title,
      status: updatedNewsletter.status,
      publishedAt: updatedNewsletter.publishedAt
    })

    return NextResponse.json({ 
      success: true, 
      sentCount: subscribers.length,
      newsletter: updatedNewsletter
    })
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}
