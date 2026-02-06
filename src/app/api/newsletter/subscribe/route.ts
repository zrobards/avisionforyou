import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, company } = await req.json()

    if (company) {
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      )
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json(
          { error: 'You are already subscribed to our newsletter' },
          { status: 400 }
        )
      } else {
        // Re-subscribe if previously unsubscribed
        await db.newsletterSubscriber.update({
          where: { email },
          data: { subscribed: true, subscribedAt: new Date() }
        })
      }
    } else {
      // Create new subscriber
      await db.newsletterSubscriber.create({
        data: {
          email,
          subscribed: true,
          subscribedAt: new Date()
        }
      })
    }

    // Send welcome email
    try {
      await resend.emails.send({
        from: 'A Vision For You <noreply@avisionforyou.org>',
        to: email,
        subject: 'Welcome to A Vision For You Newsletter',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #16a34a 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Community!</h1>
            </div>
            
            <div style="padding: 40px 30px; background-color: #f9fafb;">
              <h2 style="color: #1f2937; margin-top: 0;">Thank you for subscribing!</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                We're thrilled to have you join our community of hope and recovery. You'll now receive:
              </p>
              
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>Recovery resources and success stories</li>
                <li>Upcoming meetings and community events</li>
                <li>Program updates and new opportunities</li>
                <li>Inspirational content and support</li>
              </ul>
              
              <div style="background-color: white; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
                <p style="color: #1f2937; margin: 0; font-weight: bold;">Our Mission</p>
                <p style="color: #4b5563; margin: 10px 0 0;">
                  To empower the homeless, addicted, maladjusted, and mentally ill to lead productive lives 
                  through housing, education, self-help, treatment, or any other available resource.
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Have questions or need support? Call us at <a href="tel:+15027496344" style="color: #2563eb;">(502) 749-6344</a>
                or visit our center at 1675 Story Ave, Louisville, KY 40206.
              </p>
              
              <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://avisionforyourecovery.org'}/programs" 
                   style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #16a34a 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Explore Our Programs
                </a>
              </div>
            </div>
            
            <div style="padding: 20px; text-align: center; background-color: #1f2937; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 10px;">A Vision For You | 501(c)(3) Nonprofit</p>
              <p style="margin: 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://avisionforyourecovery.org'}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}" 
                   style="color: #9ca3af; text-decoration: underline;">
                  Unsubscribe
                </a>
              </p>
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      subscribed: true
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
