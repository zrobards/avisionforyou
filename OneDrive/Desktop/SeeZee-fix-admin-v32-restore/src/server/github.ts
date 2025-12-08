/**
 * GitHub API Integration
 * Fetches recent commits from project repositories
 */

import { prisma } from "@/lib/prisma";

interface GitHubCommit {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
}

/**
 * Normalize GitHub repo URL to owner/repo format
 * Handles:
 * - https://github.com/owner/repo -> owner/repo
 * - https://github.com/owner/repo.git -> owner/repo
 * - owner/repo -> owner/repo (already correct)
 */
function normalizeRepoUrl(repo: string): string {
  if (!repo) return repo;
  
  // Remove .git suffix if present
  repo = repo.replace(/\.git$/, '');
  
  // If it's a full URL, extract owner/repo
  const urlMatch = repo.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/);
  if (urlMatch) {
    return `${urlMatch[1]}/${urlMatch[2]}`;
  }
  
  // If it's already in owner/repo format, return as is
  if (repo.includes('/') && !repo.includes('://')) {
    return repo;
  }
  
  return repo;
}

/**
 * Get GitHub repo for a project
 * Uses project.githubRepo if set, otherwise falls back to env var
 * Returns normalized owner/repo format
 */
export async function projectRepo(projectId: string): Promise<string | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { githubRepo: true },
  });

  const repo = project?.githubRepo || process.env.GITHUB_REPO_FALLBACK || null;
  
  if (!repo) {
    return null;
  }
  
  return normalizeRepoUrl(repo);
}

/**
 * Fetch recent commits from GitHub API
 */
export async function getRecentCommits(
  repo: string,
  count = 10
): Promise<GitHubCommit[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not set, skipping commit fetch");
    return [];
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=${count}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      let errorMessage = `GitHub API error: ${res.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // If parsing fails, use the text as is
        if (errorText && errorText !== 'Unknown error') {
          errorMessage = errorText;
        }
      }
      
      console.warn(`GitHub API error for repo ${repo}: ${res.status} - ${errorMessage}`);
      
      // Handle specific error cases
      if (res.status === 404) {
        throw new Error(`Repository "${repo}" not found or not accessible. Please check the repository URL.`);
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error(`GitHub authentication failed. Please check the GITHUB_TOKEN configuration.`);
      }
      if (res.status === 400) {
        throw new Error(`Invalid repository format: "${repo}". Please ensure the repository URL is in the format "owner/repo" or a full GitHub URL.`);
      }
      
      // For other errors, throw with the error message
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    // Re-throw errors so they can be handled by the caller
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch GitHub commits: Unknown error");
  }
}
