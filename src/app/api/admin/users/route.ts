import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { rateLimitResponse, validationErrorResponse } from '@/lib/apiAuth'

const adminUserActionSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(['promote', 'demote'])
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is admin
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all users
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is admin
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const rateKey = `admin:users:${(session.user as any)?.id || 'unknown'}`
    const rate = checkRateLimit(rateKey, RATE_LIMITS.ADMIN_MUTATION.limit, RATE_LIMITS.ADMIN_MUTATION.windowSeconds)
    if (!rate.allowed) {
      return rateLimitResponse(rate.retryAfter || 60)
    }

    const parsed = adminUserActionSchema.safeParse(await request.json())
    if (!parsed.success) {
      const errors = parsed.error.issues.map(issue => issue.message)
      return validationErrorResponse(errors)
    }

    const { userId, action } = parsed.data

    // Prevent self-modification
    if (userId === (session.user as any)?.id) {
      return NextResponse.json(
        { error: action === 'promote' ? 'You are already an admin' : 'Cannot demote yourself' },
        { status: 400 }
      )
    }

    // Update user role
    const newRole = action === 'promote' ? 'ADMIN' : 'USER'
    const user = await db.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
