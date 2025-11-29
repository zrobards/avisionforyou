import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

/**
 * GET /api/admin/leads
 * Get all leads for admin pipeline view
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const adminRoles = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH", "STAFF"];
    if (!adminRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const qid = searchParams.get("qid");

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (qid) {
      where.metadata = {
        path: ["qid"],
        equals: qid,
      };
    }

    // Fetch leads with organization data
    const leads = await prisma.lead.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      leads,
      total: leads.length,
    });
  } catch (error) {
    console.error("[GET /api/admin/leads]", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/leads
 * Create a new lead manually (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const adminRoles = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH", "STAFF"];
    if (!adminRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      company,
      message,
      source,
      status,
      serviceType,
      timeline,
      budget,
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        message: message || null,
        source: source || "manual",
        status: (status as LeadStatus) || LeadStatus.NEW,
        serviceType: serviceType || null,
        timeline: timeline || null,
        budget: budget || null,
      },
      include: {
        organization: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "LEAD_CREATED",
        title: "New lead created",
        description: `${name} (${email})`,
        userId: session.user.id!,
        metadata: {
          leadId: lead.id,
          source: "manual",
        },
      },
    }).catch(err => console.error("Failed to log activity:", err));

    return NextResponse.json(
      {
        success: true,
        lead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/leads]", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
















