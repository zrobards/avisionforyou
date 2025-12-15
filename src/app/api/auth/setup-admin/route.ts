import { db } from '@/lib/db'
import bcryptjs from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/setup-admin
 * 
 * Sets up an admin user with email/password for development and deployment testing
 * Required for temporary admin access before OAuth is fully configured
 * 
 * Body: { email: string, password: string }
 * 
 * Usage:
 * curl -X POST http://localhost:3000/api/auth/setup-admin \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"admin@test.com","password":"testpass123"}'
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Hash the password
    const salt = await bcryptjs.genSalt(10)
    const passwordHash = await bcryptjs.hash(password, salt)

    // Create or update user with admin role
    const user = await db.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: 'ADMIN'
      },
      create: {
        email,
        name: 'Admin User',
        passwordHash,
        role: 'ADMIN'
      }
    })

    return NextResponse.json(
      { 
        message: 'Admin user created/updated successfully',
        email: user.email,
        role: user.role
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json(
      { error: 'Failed to set up admin user' },
      { status: 500 }
    )
  }
}
