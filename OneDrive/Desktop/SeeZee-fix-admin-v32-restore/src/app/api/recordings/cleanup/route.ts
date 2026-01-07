import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/server/db';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is CEO
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'CEO') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all recordings
    const recordings = await db.recording.findMany({
      select: { id: true, filePath: true, title: true, status: true }
    });

    const orphaned: { id: string; title: string; filePath: string | null }[] = [];
    const valid: { id: string; title: string }[] = [];

    for (const recording of recordings) {
      // Try to find the file
      let filePath = recording.filePath;
      
      // Skip if no file path (e.g., manual transcripts)
      if (!filePath) {
        valid.push({
          id: recording.id,
          title: recording.title,
        });
        continue;
      }
      
      // Normalize the path
      if (filePath.startsWith('/uploads/')) {
        filePath = path.join(process.cwd(), 'public', filePath);
      } else if (filePath.startsWith('/')) {
        filePath = path.join(process.cwd(), 'public', filePath);
      } else if (filePath.startsWith('recordings/')) {
        filePath = path.join(process.cwd(), 'public', filePath);
      } else {
        filePath = path.join(process.cwd(), 'public', 'uploads', 'recordings', filePath);
      }

      if (!fs.existsSync(filePath)) {
        orphaned.push({
          id: recording.id,
          title: recording.title,
          filePath: recording.filePath
        });
      } else {
        valid.push({
          id: recording.id,
          title: recording.title
        });
      }
    }

    const { searchParams } = new URL(req.url);
    const deleteOrphans = searchParams.get('delete') === 'true';

    if (deleteOrphans && orphaned.length > 0) {
      // Delete orphaned recordings from DB
      await db.recording.deleteMany({
        where: {
          id: { in: orphaned.map(r => r.id) }
        }
      });

      return NextResponse.json({
        success: true,
        message: `Deleted ${orphaned.length} orphaned recording(s)`,
        deleted: orphaned,
        remaining: valid
      });
    }

    return NextResponse.json({
      success: true,
      total: recordings.length,
      orphaned: orphaned,
      valid: valid,
      message: orphaned.length > 0 
        ? `Found ${orphaned.length} orphaned recording(s). Add ?delete=true to remove them.`
        : 'All recordings have valid files.'
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
