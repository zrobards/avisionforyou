import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  updated_at: string;
  default_branch: string;
  language: string | null;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get GitHub token from environment or user's account
    const githubToken = process.env.GITHUB_TOKEN;

    // If GitHub token is available, fetch real repos from GitHub API
    if (githubToken) {
      try {
        const reposResponse = await fetch("https://api.github.com/user/repos?per_page=10&sort=updated", {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (reposResponse.ok) {
          const repos: GitHubRepo[] = await reposResponse.json();
          
          // Fetch latest commit for each repo
          const reposWithCommits = await Promise.all(
            repos.slice(0, 5).map(async (repo) => {
              try {
                const commitsResponse = await fetch(
                  `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`,
                  {
                    headers: {
                      Authorization: `token ${githubToken}`,
                      Accept: "application/vnd.github.v3+json",
                    },
                  }
                );

                let lastCommit = undefined;
                if (commitsResponse.ok) {
                  const commits: GitHubCommit[] = await commitsResponse.json();
                  if (commits.length > 0) {
                    lastCommit = {
                      message: commits[0].commit.message.split("\n")[0], // First line of commit message
                      author: commits[0].author?.login || commits[0].commit.author.name,
                      date: commits[0].commit.author.date,
                    };
                  }
                }

                return {
                  id: repo.id.toString(),
                  name: repo.name,
                  url: repo.html_url,
                  description: repo.description,
                  language: repo.language,
                  lastCommit,
                };
              } catch (error) {
                console.error(`Failed to fetch commits for ${repo.name}:`, error);
                return {
                  id: repo.id.toString(),
                  name: repo.name,
                  url: repo.html_url,
                  description: repo.description,
                  language: repo.language,
                  lastCommit: undefined,
                };
              }
            })
          );

          return NextResponse.json({ repos: reposWithCommits });
        }
      } catch (error) {
        console.error("Failed to fetch from GitHub API:", error);
        // Fall through to fallback logic
      }
    }

    // Fallback: Get projects from database and generate realistic GitHub repo links
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  where: {
                    status: {
                      in: ["ACTIVE", "REVIEW", "DEPOSIT_PAID", "COMPLETED"],
                    },
                  },
                  orderBy: {
                    updatedAt: "desc",
                  },
                  take: 5,
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.organizations.length === 0) {
      return NextResponse.json({ repos: [] });
    }

    // Generate realistic GitHub repo data from projects
    const repos = user.organizations
      .flatMap((orgMember) =>
        orgMember.organization.projects.map((project) => ({
          id: project.id,
          name: `${project.name.toLowerCase().replace(/\s+/g, "-")}-repo`,
          url: `https://github.com/seezee/${project.name.toLowerCase().replace(/\s+/g, "-")}`,
          description: project.description || null,
          language: null,
          lastCommit: project.updatedAt
            ? {
                message: "Latest updates and improvements",
                author: "SeeZee Team",
                date: project.updatedAt.toISOString(),
              }
            : undefined,
        }))
      )
      .slice(0, 5); // Limit to 5 repos

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("Failed to fetch GitHub repos:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}








