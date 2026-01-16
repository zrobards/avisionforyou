import { NextResponse } from 'next/server';
import { requireBoardAccess } from '@/lib/board';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await requireBoardAccess();

    // Get board statistics
    const [documentsCount, meetingsCount, boardMembers] = await Promise.all([
      db.boardDocument.count(),
      db.boardMeeting.count({ where: { status: { not: 'cancelled' } } }),
      db.teamMember.findMany({
        where: {
          role: {
            in: ['BOARD_PRESIDENT', 'BOARD_VP', 'BOARD_TREASURER', 'BOARD_SECRETARY', 'BOARD_MEMBER'],
          },
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      documentsCount,
      meetingsCount,
      membersCount: boardMembers.length,
    });
  } catch (error) {
    console.error('Board stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch board stats' },
      { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
