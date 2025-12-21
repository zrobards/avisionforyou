import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password, confirmDelete } = body;

    // Validate confirmation
    if (confirmDelete !== "DELETE") {
      return NextResponse.json(
        { error: "Please type DELETE to confirm account deletion" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If user has a password, verify it before deletion
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required to delete your account" },
          { status: 400 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Prevent CEO from deleting their own account without admin oversight
    if (user.role === "CEO") {
      return NextResponse.json(
        { error: "CEO accounts cannot be deleted. Please contact support for assistance." },
        { status: 403 }
      );
    }

    // Log the account deletion before deleting
    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: "account_deleted",
        entityType: "User",
        entityId: user.id,
        metadata: {
          email: user.email,
          name: user.name,
          role: user.role,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Delete user and all related data using a transaction
    await prisma.$transaction(async (tx) => {
      // Mark user's project requests as rejected and unlink
      await tx.projectRequest.updateMany({
        where: { userId: user.id },
        data: { 
          status: "REJECTED",
          userId: null, // Unlink from user
        },
      });

      // Mark user's leads as lost
      await tx.lead.updateMany({
        where: { email: user.email },
        data: { 
          status: "LOST",
        },
      });

      // Delete user sessions
      await tx.userSession.deleteMany({
        where: { userId: user.id },
      });

      // Delete user accounts (OAuth)
      await tx.account.deleteMany({
        where: { userId: user.id },
      });

      // Update projects where user is assigned (don't delete projects, just unassign)
      await tx.project.updateMany({
        where: { assigneeId: user.id },
        data: { assigneeId: null },
      });

      // Delete user's messages (by email since Message doesn't have userId)
      await tx.message.deleteMany({
        where: { email: user.email },
      });

      // Delete user's notifications
      await tx.notification.deleteMany({
        where: { userId: user.id },
      });

      // Delete staff invite codes created by user
      await tx.staffInviteCode.deleteMany({
        where: { createdById: user.id },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Your account has been permanently deleted.",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting your account. Please try again later." },
      { status: 500 }
    );
  }
}

