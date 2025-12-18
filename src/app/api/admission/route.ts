import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendAdmissionConfirmation, sendAdmissionNotificationToAdmin } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, program, message } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingInquiry = await db.admissionInquiry.findUnique({
      where: { email },
    }).catch(() => null);

    if (existingInquiry) {
      return NextResponse.json(
        { error: 'An inquiry from this email already exists' },
        { status: 400 }
      );
    }

    // Create new admission inquiry
    const inquiry = await db.admissionInquiry.create({
      data: {
        name,
        email,
        phone,
        program: program || 'Not specified',
        message: message || '',
        status: 'pending',
      },
    });

    // Send confirmation email to applicant
    await sendAdmissionConfirmation(name, email, program || 'Not specified');
    
    // Send notification email to admin
    await sendAdmissionNotificationToAdmin(name, email, phone, program || 'Not specified', message || '');

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry submitted successfully',
        inquiryId: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admission inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Basic auth check - in production, use proper JWT validation
    if (!authHeader?.includes('Bearer')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const inquiries = await db.admissionInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
