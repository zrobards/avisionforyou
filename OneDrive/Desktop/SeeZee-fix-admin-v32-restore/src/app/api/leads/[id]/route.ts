import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

/**
 * GET /api/leads/[id]
 * Get a single lead by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        organization: true,
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Allow access if user is authenticated and owns the lead, or if it's for receipt viewing
    // For receipt viewing, we'll allow access if the email matches
    if (session?.user) {
      // Authenticated users can access their own leads
      if (lead.email === session.user.email || ['CEO', 'CFO', 'ADMIN', 'STAFF'].includes(session.user.role || '')) {
        return NextResponse.json({ lead });
      }
    }

    // For public receipt access, allow if email matches (will be checked via query param)
    const email = req.nextUrl.searchParams.get('email');
    if (email && lead.email === email) {
      return NextResponse.json({ lead });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("[GET /api/leads/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/leads/[id]
 * Update a lead (CEO/Admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only CEO and admins can update leads
    const allowedRoles = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"];
    if (!allowedRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.company !== undefined) updateData.company = body.company;
    if (body.message !== undefined) updateData.message = body.message;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.serviceType !== undefined) updateData.serviceType = body.serviceType;
    if (body.timeline !== undefined) updateData.timeline = body.timeline;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes;
    
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Set convertedAt when status changes to CONVERTED
      if (body.status === LeadStatus.CONVERTED && !existingLead.convertedAt) {
        updateData.convertedAt = new Date();
      }
    }

    // Update the lead
    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        organization: true,
        project: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "LEAD_UPDATED",
        title: "Lead updated",
        description: `${lead.name} (${lead.email})`,
        userId: session.user.id!,
        metadata: {
          leadId: lead.id,
          changes: body,
          oldStatus: existingLead.status,
          newStatus: lead.status,
        },
      },
    }).catch(err => console.error("Failed to log activity:", err));

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("[PUT /api/leads/:id]", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 * Delete a lead (CEO only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only CEO can delete leads
    if (session.user.role !== "CEO") {
      return NextResponse.json({ error: "Forbidden - CEO only" }, { status: 403 });
    }

    const { id } = await params;

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
      // This allows users to submit new requests after lead deletion
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
    await prisma.activity.create({
      data: {
        type: "LEAD_DELETED",
        title: "Lead deleted",
        description: `${lead.name} (${lead.email})`,
        userId: session.user.id!,
        metadata: {
          leadId: lead.id,
          leadName: lead.name,
        },
      },
    }).catch(err => console.error("Failed to log activity:", err));

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/leads/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}




