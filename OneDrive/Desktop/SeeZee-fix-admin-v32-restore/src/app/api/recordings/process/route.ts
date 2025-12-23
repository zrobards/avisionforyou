import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { processRecording } from '@/lib/transcription/processor';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordingId } = await req.json();

    if (!recordingId) {
      return NextResponse.json({ 
        error: 'Recording ID required' 
      }, { status: 400 });
    }

    // Process in background (don't await)
    processRecording(recordingId).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Processing started',
      recordingId
    });

  } catch (error) {
    console.error('Error triggering processing:', error);
    return NextResponse.json({ 
      error: 'Failed to start processing' 
    }, { status: 500 });
  }
}
