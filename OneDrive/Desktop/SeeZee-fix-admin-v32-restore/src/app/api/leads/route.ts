import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

/**
 * POST /api/leads
 * Create a new lead manually (admin/prospect creation)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role or can create leads
    const allowedRoles = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH", "STAFF"];
    if (!allowedRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      company,
      websiteUrl,
      category,
      city,
      state,
      source = "MANUAL",
      internalNotes,
      hasWebsite,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // If email provided, validate format
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        company: company || name,
        websiteUrl: websiteUrl || null,
        hasWebsite: hasWebsite || !!websiteUrl,
        category: category || null,
        address: city && state ? `${city}, ${state}` : null,
        city: city || null,
        state: state || null,
        source: source || "MANUAL",
        status: LeadStatus.NEW,
        internalNotes: internalNotes || null,
      },
      include: {
        organization: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        lead,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/leads]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}

