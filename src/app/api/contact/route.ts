import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, department, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Save to database
    const inquiry = await db.contactInquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        department: department || 'general',
        subject,
        message,
        status: 'NEW'
      }
    })

    // Send email notification to staff
    const departmentEmails: Record<string, string> = {
      general: 'info@avisionforyourecovery.org',
      programs: 'programs@avisionforyourecovery.org',
      donate: 'development@avisionforyourecovery.org',
      volunteer: 'volunteer@avisionforyourecovery.org',
      press: 'media@avisionforyourecovery.org',
      careers: 'hr@avisionforyourecovery.org'
    }

    const recipientEmail = departmentEmails[department] || departmentEmails.general

    try {
      await sendEmail({
        to: recipientEmail,
        subject: `New Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Department:</strong> ${department}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Inquiry ID: ${inquiry.id}</small></p>
        `
      })

      // Send confirmation email to submitter
      await sendEmail({
        to: email,
        subject: 'Thank you for contacting A Vision For You Recovery',
        html: `
          <h2>Thank you for reaching out</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will respond within 24-48 hours. A member of our team will be in touch soon.</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>If you need immediate assistance, please call us at <strong>(502) 749-6344</strong>.</p>
          <p>Warm regards,<br>A Vision For You Recovery Team</p>
        `
      })
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
      // Don't fail the request if email fails - inquiry is saved
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We\'ll respond within 24 hours.',
      inquiryId: inquiry.id
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    )
  }
}
