import { NextRequest, NextResponse } from 'next/server';
import { requireBoardAccess } from '@/lib/board';
import { db } from '@/lib/db';
import { uploadFile } from '@/lib/storage';
import { logBoardDocumentAction } from '@/lib/audit';

// GET - List all board documents
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireBoardAccess();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (type) {
      where.type = type;
    }

    const documents = await db.boardDocument.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Get board documents error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

// POST - Upload a new board document
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireBoardAccess();
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const type = formData.get('type') as string;
    const tags = formData.get('tags') as string;
    const isConfidential = formData.get('isConfidential') === 'true';

    if (!file || !title || !type) {
      return NextResponse.json(
        { error: 'File, title, and type are required' },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob
    const uploadResult = await uploadFile(file, `board/${Date.now()}-${file.name}`);

    // Create document record
    const document = await db.boardDocument.create({
      data: {
        title,
        description,
        type: type as any,
        fileUrl: uploadResult.url,
        fileName: file.name,
        fileSize: uploadResult.size,
        mimeType: uploadResult.contentType,
        uploadedById: (user as any).id,
        isConfidential,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log audit action
    await logBoardDocumentAction('UPLOAD', document.id, (user as any).id, {
      title: document.title,
      type: document.type,
      fileSize: document.fileSize,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Upload board document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
