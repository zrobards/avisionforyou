import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ProspectStatus } from '@prisma/client';

/**
 * POST /api/prospects/bulk-action
 * Handle bulk operations (archive, delete, status change, draft)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only CEO, CFO, or OUTREACH roles can access
    const allowedRoles = ['CEO', 'CFO', 'OUTREACH'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { prospectIds, action, payload } = body;

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json(
        { error: 'prospectIds array is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    let affected = 0;

    // Perform bulk action
    switch (action) {
      case 'archive': {
        const result = await prisma.$transaction(async (tx) => {
          // Update prospects
          const updateResult = await tx.prospect.updateMany({
            where: {
              id: { in: prospectIds },
              archived: false,
            },
            data: {
              archived: true,
            },
          });

          // Create activities
          for (const prospectId of prospectIds) {
            await tx.prospectActivity.create({
              data: {
                prospectId,
                type: 'ARCHIVED',
                description: 'Prospect archived via bulk action',
              },
            });
          }

          return updateResult.count;
        });

        affected = result;
        break;
      }

      case 'unarchive': {
        const result = await prisma.prospect.updateMany({
          where: {
            id: { in: prospectIds },
            archived: true,
          },
          data: {
            archived: false,
          },
        });

        affected = result.count;
        break;
      }

      case 'delete': {
        // Only allow deleting non-converted prospects
        const result = await prisma.$transaction(async (tx) => {
          // Delete activities and emails first (cascade should handle this, but be explicit)
          await tx.prospectActivity.deleteMany({
            where: { prospectId: { in: prospectIds } },
          });

          await tx.sentEmail.deleteMany({
            where: { prospectId: { in: prospectIds } },
          });

          // Delete prospects
          const deleteResult = await tx.prospect.deleteMany({
            where: {
              id: { in: prospectIds },
              convertedAt: null, // Only delete unconverted prospects
            },
          });

          return deleteResult.count;
        });

        affected = result;
        break;
      }

      case 'status': {
        if (!payload?.status) {
          return NextResponse.json(
            { error: 'payload.status is required for status action' },
            { status: 400 }
          );
        }

        const result = await prisma.$transaction(async (tx) => {
          // Get current statuses
          const prospects = await tx.prospect.findMany({
            where: { id: { in: prospectIds } },
            select: { id: true, status: true },
          });

          // Update prospects
          const updateResult = await tx.prospect.updateMany({
            where: {
              id: { in: prospectIds },
            },
            data: {
              status: payload.status as ProspectStatus,
            },
          });

          // Create activities
          for (const prospect of prospects) {
            if (prospect.status !== payload.status) {
              await tx.prospectActivity.create({
                data: {
                  prospectId: prospect.id,
                  type: 'STATUS_CHANGED',
                  description: `Status changed from ${prospect.status} to ${payload.status}`,
                  metadata: {
                    oldStatus: prospect.status,
                    newStatus: payload.status,
                  },
                },
              });
            }
          }

          return updateResult.count;
        });

        affected = result;
        break;
      }

      case 'tag': {
        if (!payload?.tag) {
          return NextResponse.json(
            { error: 'payload.tag is required for tag action' },
            { status: 400 }
          );
        }

        const { tag, operation = 'add' } = payload;

        const result = await prisma.$transaction(async (tx) => {
          const prospects = await tx.prospect.findMany({
            where: { id: { in: prospectIds } },
            select: { id: true, tags: true },
          });

          let count = 0;

          for (const prospect of prospects) {
            const currentTags = prospect.tags || [];
            let newTags: string[];

            if (operation === 'add') {
              newTags = currentTags.includes(tag) ? currentTags : [...currentTags, tag];
            } else if (operation === 'remove') {
              newTags = currentTags.filter((t) => t !== tag);
            } else {
              continue;
            }

            if (newTags.length !== currentTags.length) {
              await tx.prospect.update({
                where: { id: prospect.id },
                data: { tags: newTags },
              });
              count++;
            }
          }

          return count;
        });

        affected = result;
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      affected,
    });
  } catch (error: any) {
    console.error('Error in bulk-action route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}


