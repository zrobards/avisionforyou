import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from '@/lib/logger'

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ALUMNI" && session.user.role !== "BOARD" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    
    const polls = await db.communityPoll.findMany({
      where: { 
        active: true,
        OR: [
          { closesAt: null }, // No expiration date
          { closesAt: { gt: now } } // Or hasn't expired yet
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { votes: true } },
        votes: {
          where: { userId: session.user.id },
          select: { vote: true },
        },
      },
    });

    // Get all vote counts in a single groupBy query instead of per-poll
    const pollIds = polls.map(p => p.id);
    const voteCounts = await db.communityPollVote.groupBy({
      by: ['pollId', 'vote'],
      where: { pollId: { in: pollIds } },
      _count: true,
    });

    // Build lookup map
    const voteMap = new Map<string, { yes: number; no: number }>();
    for (const vc of voteCounts) {
      const entry = voteMap.get(vc.pollId) || { yes: 0, no: 0 };
      if (vc.vote) entry.yes = vc._count;
      else entry.no = vc._count;
      voteMap.set(vc.pollId, entry);
    }

    const pollsWithStats = polls.map((poll) => {
      const counts = voteMap.get(poll.id) || { yes: 0, no: 0 };
      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        active: poll.active,
        closesAt: poll.closesAt,
        createdAt: poll.createdAt,
        _count: poll._count,
        yesVotes: counts.yes,
        noVotes: counts.no,
        userVote: poll.votes[0]?.vote ?? null,
      };
    });

    return NextResponse.json(pollsWithStats);
  } catch (error) {
    logger.error({ err: error }, "Error fetching polls");
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}
