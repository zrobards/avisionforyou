import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { logger } from '@/lib/logger'

const createPollSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  closesAt: z.string().datetime().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const polls = await db.communityPoll.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { votes: true } } },
    });

    // Get all vote counts in a single groupBy query
    const pollIds = polls.map(p => p.id);
    const voteCounts = await db.communityPollVote.groupBy({
      by: ['pollId', 'vote'],
      where: { pollId: { in: pollIds } },
      _count: true,
    });

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
        ...poll,
        yesVotes: counts.yes,
        noVotes: counts.no,
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPollSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, closesAt } = parsed.data;

    const poll = await db.communityPoll.create({
      data: {
        title,
        description: description || null,
        closesAt: closesAt ? new Date(closesAt) : null,
        createdById: session.user.id,
        active: true,
      },
    });

    return NextResponse.json(poll);
  } catch (error) {
    logger.error({ err: error }, "Error creating poll");
    return NextResponse.json(
      { error: "Failed to create poll. Check server logs." },
      { status: 500 }
    );
  }
}
