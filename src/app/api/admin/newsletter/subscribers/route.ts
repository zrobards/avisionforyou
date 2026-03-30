import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { getSession } from '@/lib/apiAuth'
import { logger } from '@/lib/logger'

// GET - List all newsletter subscribers
export async function GET(_req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    })

    return NextResponse.json({ subscribers })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching subscribers')
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

// POST - Add a new subscriber manually
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if already exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json({ error: 'Email is already subscribed' }, { status: 409 })
      }
      // Re-subscribe
      const updated = await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: { subscribed: true, unsubscribedAt: null },
      })
      return NextResponse.json({ subscriber: updated })
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email: normalizedEmail },
    })

    return NextResponse.json({ subscriber }, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Error adding subscriber')
    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 })
  }
}

// DELETE - Remove a subscriber
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 })
    }

    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { subscribed: false, unsubscribedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, 'Error removing subscriber')
    return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 })
  }
}
