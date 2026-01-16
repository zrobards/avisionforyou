import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAuditAction, AuditAction, AuditEntity } from '@/lib/audit'
import { sendEmail } from '@/lib/email'

// GET single inquiry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || 
        ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const inquiry = await db.admissionInquiry.findUnique({
      where: { id: params.id }
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Failed to fetch inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    )
  }
}

// PATCH update inquiry
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || 
        ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! }
    })

    const body = await request.json()
    const { status, notes, emailReply } = body

    // Get inquiry before update for audit log
    const inquiryBefore = await db.admissionInquiry.findUnique({
      where: { id: params.id }
    })

    const inquiry = await db.admissionInquiry.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      }
    })

    // Send email reply if provided
    if (emailReply && inquiry.email) {
      try {
        await sendEmail({
          to: inquiry.email,
          subject: `Re: Admission Inquiry - ${inquiry.program}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Response from A Vision For You - Admissions</h2>
              <p>Dear ${inquiry.name},</p>
              <p>Thank you for your interest in our ${inquiry.program} program. Here is our response to your inquiry:</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                ${emailReply}
              </div>
              <p>We look forward to speaking with you soon.</p>
              <p>Best regards,<br>The A Vision For You Admissions Team</p>
            </div>
          `
        })

        // Log email send action
        await logAuditAction({
          action: AuditAction.SEND_EMAIL,
          entity: AuditEntity.ADMISSION_INQUIRY,
          entityId: params.id,
          userId: user!.id,
          details: {
            recipient: inquiry.email,
            program: inquiry.program
          },
          req: request
        })
      } catch (emailError) {
        console.error('Failed to send email reply:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Log audit trail
    await logAuditAction({
      action: status ? AuditAction.STATUS_CHANGE : AuditAction.UPDATE,
      entity: AuditEntity.ADMISSION_INQUIRY,
      entityId: params.id,
      userId: user!.id,
      details: {
        oldStatus: inquiryBefore?.status,
        newStatus: status,
        hasNotes: !!notes
      },
      req: request
    })

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Failed to update inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}

// DELETE inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session.user as any)?.role || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! }
    })

    // Get inquiry before deletion for audit log
    const inquiryToDelete = await db.admissionInquiry.findUnique({
      where: { id: params.id }
    })

    await db.admissionInquiry.delete({
      where: { id: params.id }
    })

    // Log audit trail
    await logAuditAction({
      action: AuditAction.DELETE,
      entity: AuditEntity.ADMISSION_INQUIRY,
      entityId: params.id,
      userId: user!.id,
      details: {
        deletedEmail: inquiryToDelete?.email,
        deletedProgram: inquiryToDelete?.program
      },
      req: request
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
}
