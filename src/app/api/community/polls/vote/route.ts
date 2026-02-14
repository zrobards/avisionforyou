import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ALUMNI" && session.user.role !== "BOARD" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pollId, vote } = await request.json();

    if (!pollId || typeof vote !== "boolean") {
      return NextResponse.json(
        { error: "Missing pollId or vote" },
        { status: 400 }
      );
    }

    // Check if poll exists and is active
    const poll = await db.communityPoll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (!poll.active) {
      return NextResponse.json({ error: "Poll is closed" }, { status: 400 });
    }

    if (poll.closesAt && new Date(poll.closesAt) < new Date()) {
      return NextResponse.json({ error: "Poll has closed" }, { status: 400 });
    }

    // Create vote — use try/catch for unique constraint (P2002) to handle race conditions
    try {
      const newVote = await db.communityPollVote.create({
        data: {
          pollId,
          userId: session.user.id,
          vote,
        },
      });
      return NextResponse.json({ success: true, vote: newVote });
    } catch (createError: any) {
      if (createError?.code === 'P2002') {
        return NextResponse.json(
          { error: "You have already voted on this poll" },
          { status: 400 }
        );
      }
      throw createError;
    }
  } catch (error) {
    logger.error({ err: error }, "Error voting");
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
