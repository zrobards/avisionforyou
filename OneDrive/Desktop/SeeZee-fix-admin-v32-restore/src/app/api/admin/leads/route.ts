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

    // Notify all admins about new lead
    const { createNewLeadNotification } = await import("@/lib/notifications");
    await createNewLeadNotification(
      lead.id,
      lead.name,
      lead.email,
      lead.company,
      lead.source || "manual"
    ).catch(err => console.error("Failed to create lead notification:", err));

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

/**
 * DELETE /api/admin/leads
 * Delete a lead by ID (Admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const adminRoles = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH", "STAFF", "ADMIN"];
    if (!adminRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Prevent deletion if lead has been converted to a project
    if (lead.project) {
      return NextResponse.json(
        { error: "Cannot delete lead that has been converted to a project" },
        { status: 400 }
      );
    }

    // Use transaction to clean up related records
    await prisma.$transaction(async (tx) => {
      // Archive any ProjectRequests associated with this lead's email
      if (lead.email) {
        // Find user by email
        const user = await tx.user.findUnique({
          where: { email: lead.email },
          select: { id: true },
        });

        if (user) {
          // Archive active project requests for this user
          await tx.projectRequest.updateMany({
            where: {
              userId: user.id,
              status: {
                in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'],
              },
            },
            data: {
              status: 'ARCHIVED',
            },
          });
        }
      }

      // Delete the lead
      await tx.lead.delete({
        where: { id },
      });
    });

    // Log activity
    await prisma.systemLog.create({
      data: {
        action: "ADMIN_LEAD_DELETED",
        entityType: "Lead",
        entityId: id,
        userId: session.user.id!,
        metadata: {
          leadName: lead.name,
          leadEmail: lead.email,
          deletedBy: session.user.email,
        },
      },
    }).catch(err => console.error("Failed to log activity:", err));

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/leads]", error);
    
    let errorMessage = "Failed to delete lead";
    let statusCode = 500;
    
    if (error.code === "P2003") {
      errorMessage = "Cannot delete lead due to related records. Please contact support.";
    } else if (error.code === "P2025") {
      errorMessage = "Lead not found or already deleted.";
      statusCode = 404;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || "UNKNOWN_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}
















