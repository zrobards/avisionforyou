import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ALUMNI" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const polls = await db.communityPoll.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { votes: true } },
        votes: {
          where: { userId: session.user.id },
          select: { vote: true },
        },
      },
    });

    // Calculate yes/no counts and user's vote
    const pollsWithStats = await Promise.all(
      polls.map(async (poll) => {
        const yesVotes = await db.communityPollVote.count({
          where: { pollId: poll.id, vote: true },
        });
        const noVotes = await db.communityPollVote.count({
          where: { pollId: poll.id, vote: false },
        });

        return {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          active: poll.active,
          closesAt: poll.closesAt,
          createdAt: poll.createdAt,
          _count: poll._count,
          yesVotes,
          noVotes,
          userVote: poll.votes[0]?.vote ?? null,
        };
      })
    );

    return NextResponse.json(pollsWithStats);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}
