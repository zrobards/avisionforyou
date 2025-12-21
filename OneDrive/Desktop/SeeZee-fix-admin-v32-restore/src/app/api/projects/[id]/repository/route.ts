import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientProjectOrThrow } from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]/repository
 * Fetch GitHub repository information for a project
 */
export async function GET(
  req: NextRequest,
  { params }: PageProps
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to the project
    try {
      await getClientProjectOrThrow(
        { userId: session.user.id, email: session.user.email },
        id,
        { select: { id: true, githubRepo: true } }
      );
    } catch (error) {
      if (error instanceof ClientAccessError) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      throw error;
    }

    // Get project with GitHub repo URL
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        githubRepo: true,
        name: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.githubRepo) {
      return NextResponse.json({
        repository: null,
        message: "No GitHub repository connected to this project",
      });
    }

    // Parse GitHub repo URL to extract owner and repo name
    // Expected format: https://github.com/owner/repo or owner/repo
    let owner: string | null = null;
    let repo: string | null = null;

    try {
      const repoUrl = project.githubRepo.trim();
      
      // Handle full URL
      if (repoUrl.startsWith("http")) {
        const url = new URL(repoUrl);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          owner = pathParts[0];
          repo = pathParts[1];
        }
      } else {
        // Handle owner/repo format
        const parts = repoUrl.split("/");
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        }
      }
    } catch (error) {
      console.error("Failed to parse GitHub repo URL:", error);
      return NextResponse.json({
        repository: {
          url: project.githubRepo,
          error: "Invalid repository URL format",
        },
      });
    }

    if (!owner || !repo) {
      return NextResponse.json({
        repository: {
          url: project.githubRepo,
          error: "Could not parse repository information",
        },
      });
    }

    // Fetch repository info from GitHub API
    try {
      const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;

      // Fetch repo info and latest commit in parallel
      const [repoResponse, commitsResponse] = await Promise.all([
        fetch(githubApiUrl, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }),
        fetch(commitsUrl, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }),
      ]);

      let repoData: any = null;
      let lastCommit: any = null;

      if (repoResponse.ok) {
        repoData = await repoResponse.json();
      }

      if (commitsResponse.ok) {
        const commits = await commitsResponse.json();
        if (Array.isArray(commits) && commits.length > 0) {
          lastCommit = commits[0];
        }
      }

      return NextResponse.json({
        repository: {
          url: project.githubRepo,
          fullUrl: repoData?.html_url || `https://github.com/${owner}/${repo}`,
          owner,
          repo,
          description: repoData?.description || null,
          language: repoData?.language || null,
          stars: repoData?.stargazers_count || 0,
          forks: repoData?.forks_count || 0,
          lastCommit: lastCommit
            ? {
                sha: lastCommit.sha?.substring(0, 7) || null,
                message: lastCommit.commit?.message || null,
                author: lastCommit.commit?.author?.name || null,
                date: lastCommit.commit?.author?.date || null,
                url: lastCommit.html_url || null,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Failed to fetch GitHub repository info:", error);
      // Return basic info even if API call fails
      return NextResponse.json({
        repository: {
          url: project.githubRepo,
          fullUrl: `https://github.com/${owner}/${repo}`,
          owner,
          repo,
          error: "Failed to fetch repository details from GitHub",
        },
      });
    }
  } catch (error) {
    console.error("[GET /api/projects/[id]/repository]", error);
    return NextResponse.json(
      { error: "Failed to fetch repository information" },
      { status: 500 }
    );
  }
}









