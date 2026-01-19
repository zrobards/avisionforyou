import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Update existing user
      await db.user.update({
        where: { email },
        data: {
          passwordHash,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      })

      return NextResponse.json({
        message: 'Admin user updated successfully',
        email
      })
    } else {
      // Create new admin user
      const user = await db.user.create({
        data: {
          email,
          name: 'Admin User',
          passwordHash,
          role: 'ADMIN',
          emailVerified: new Date(),
          profile: {
            create: {
              bio: 'Administrator',
              phone: '(502) 749-6344'
            }
          }
        }
      })

      return NextResponse.json({
        message: 'Admin user created successfully',
        email: user.email
      })
    }
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
