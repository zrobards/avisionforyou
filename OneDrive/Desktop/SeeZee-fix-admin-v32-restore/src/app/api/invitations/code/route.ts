export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendInviteEmail } from "@/lib/mailer";
import { UserRole } from "@prisma/client";

const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com", "seezee.enterprises@gmail.com", "sean.mcculloch23@gmail.com"];

function generateSixDigit(): string {
  // Generate a random 6-digit number (000000–999999) with leading zeros
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Only CEO can create invitations
    if (!session?.user || !CEO_EMAILS.includes(session.user.email || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, role, expiresDays = 7 } = await request.json();

    // Validate inputs
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = [
      "CEO",
      "CFO",
      "FRONTEND",
      "BACKEND",
      "OUTREACH",
    ];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.role !== "CLIENT") {
      return NextResponse.json(
        { error: "User already exists as staff" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.staffInviteCode.findFirst({
      where: {
        email,
        redeemedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Pending invitation already exists" },
        { status: 400 }
      );
    }

    // Generate 6-digit code and hash it
    const code = generateSixDigit();
    const codeHash = await bcrypt.hash(code, 10);

    // Calculate expiration
    const expiresAt = new Date(
      Date.now() + expiresDays * 24 * 60 * 60 * 1000
    );

    // Create invitation code
    const invite = await prisma.staffInviteCode.create({
      data: {
        email,
        role,
        codeHash,
        expiresAt,
        createdById: session.user.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
      },
    });

    // Send email with the 6-digit code
    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signinUrl = `${baseUrl}/login`;
    
    await sendInviteEmail({
      to: email,
      code,
      role,
      signinUrl,
      expiresAt,
    });

    // Log the event
    await prisma.systemLog.create({
      data: {
        userId: session.user.id,
        action: "invite_create",
        entityType: "StaffInviteCode",
        entityId: invite.id,
        metadata: { email, role, expiresAt },
      },
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Invitation creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    // Only CEO can view invitations
    if (!session?.user || !CEO_EMAILS.includes(session.user.email || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const invitations = await prisma.staffInviteCode.findMany({
      where: {
        redeemedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Fetch invitations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
