import { NextRequest, NextResponse } from 'next/server';
import { requireBoardAccess } from '@/lib/board';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/storage';
import { logBoardDocumentAction } from '@/lib/audit';

// GET - Get a specific board document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireBoardAccess();

    const document = await db.boardDocument.findUnique({
      where: { id: params.id },
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

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Log view action
    await logBoardDocumentAction('VIEW', document.id, (user as any).id);

    return NextResponse.json(document);
  } catch (error) {
    console.error('Get board document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch document' },
      { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

// PATCH - Update a board document
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireBoardAccess();
    const body = await request.json();

    const { title, description, type, tags, isConfidential } = body;

    const document = await db.boardDocument.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(tags && { tags }),
        ...(isConfidential !== undefined && { isConfidential }),
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

    // Log update action
    await logBoardDocumentAction('UPDATE', document.id, (user as any).id, {
      changes: body,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Update board document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update document' },
      { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

// DELETE - Delete a board document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireBoardAccess();

    const document = await db.boardDocument.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete file from storage
    await deleteFile(document.fileUrl);

    // Delete document record
    await db.boardDocument.delete({
      where: { id: params.id },
    });

    // Log delete action
    await logBoardDocumentAction('DELETE', document.id, (user as any).id, {
      title: document.title,
      type: document.type,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete board document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
