import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VERCEL_API_URL = "https://api.vercel.com";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID required" },
        { status: 400 }
      );
    }

    // Get project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        githubRepo: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get Vercel token
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    
    if (!vercelToken) {
      return NextResponse.json(
        { error: "Vercel integration not configured" },
        { status: 501 }
      );
    }

    // If no project-specific Vercel ID, return empty deployments
    if (!vercelProjectId) {
      return NextResponse.json({ 
        deployments: [],
        message: "Vercel project not linked"
      });
    }

    // Fetch deployments from Vercel API
    const response = await fetch(
      `${VERCEL_API_URL}/v6/deployments?projectId=${vercelProjectId}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || "Failed to fetch deployments" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform deployments
    const deployments = data.deployments.map((d: any) => ({
      id: d.uid,
      url: d.url,
      state: d.state,
      target: d.target, // production or preview
      createdAt: d.createdAt,
      buildingAt: d.buildingAt,
      ready: d.ready,
      alias: d.alias,
      meta: {
        branch: d.meta?.githubCommitRef,
        commit: d.meta?.githubCommitSha?.substring(0, 7),
        message: d.meta?.githubCommitMessage,
        author: d.meta?.githubCommitAuthorName,
      },
    }));

    return NextResponse.json({ deployments });
  } catch (error) {
    console.error("Vercel API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deployments" },
      { status: 500 }
    );
  }
}

// Link a project to Vercel (placeholder until schema supports it)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin roles can link projects
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const adminRoles = ["CEO", "CFO"];
    if (!adminRoles.includes(user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: false,
      message: "Vercel project linking requires database schema migration. Please run 'npx prisma migrate dev' first.",
    }, { status: 501 });
  } catch (error) {
    console.error("Link Vercel error:", error);
    return NextResponse.json(
      { error: "Failed to link project" },
      { status: 500 }
    );
  }
}
