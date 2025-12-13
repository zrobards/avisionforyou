/**
 * GET /api/client/projects/[id]/summary
 * Analyzes recent Git commits and suggests change requests using AI
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRecentCommits, projectRepo } from "@/server/github";
import { summarizeCommitsLLM } from "@/server/ai";
import { getClientProjectOrThrow } from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    try {
      await getClientProjectOrThrow(
        { userId: session.user.id, email: session.user.email },
        projectId,
        { select: { id: true } }
      );
    } catch (error) {
      if (error instanceof ClientAccessError) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }
      throw error;
    }

    // Get GitHub repo from project
    const repo = await projectRepo(projectId);
    if (!repo) {
      console.log(`[Project Summary] No GitHub repo configured for project ${projectId}`);
      return NextResponse.json(
        { summary: "No GitHub repository configured for this project." },
        { status: 200 }
      );
    }

    console.log(`[Project Summary] Fetching commits from GitHub repo: ${repo}`);
    
    // Fetch recent commits
    const commits = await getRecentCommits(repo, 10);
    if (commits.length === 0) {
      return NextResponse.json(
        { 
          summary: "No recent commits found. This could mean the repository is empty, private, or the GitHub token doesn't have access.",
          suggestions: [],
          repo,
          commitCount: 0,
        },
        { status: 200 }
      );
    }

    // Generate AI suggestions
    let suggestions: { title: string; details: string }[] = [];
    try {
      suggestions = await summarizeCommitsLLM(commits);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      // Continue without suggestions if AI fails
      suggestions = [];
    }

    return NextResponse.json({
      summary: `Analyzed ${commits.length} recent commits from ${repo}`,
      suggestions,
      repo,
      commitCount: commits.length,
    });
  } catch (error) {
    console.error("Error generating project summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
