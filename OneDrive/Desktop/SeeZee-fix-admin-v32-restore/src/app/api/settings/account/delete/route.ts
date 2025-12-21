import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password, confirmation } = body;

    // Verify confirmation text
    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Please type DELETE to confirm" },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify password if user has one (not OAuth-only)
    if (user.password) {
      // User has a password, so they must provide it
      if (!password || password.trim() === "") {
        return NextResponse.json(
          { error: "Password is required to delete your account" },
          { status: 400 }
        );
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 400 }
        );
      }
    }
    // If user has no password (OAuth-only), no password verification needed

    // Delete user and related records using a transaction
    // Some relations don't have onDelete: Cascade, so we need to handle them manually
    await prisma.$transaction(async (tx) => {
      // Delete system logs (doesn't have cascade delete)
      await tx.systemLog.deleteMany({
        where: { userId: user.id },
      });

      // Delete chat messages authored by this user (doesn't have cascade delete)
      await tx.chatMessage.deleteMany({
        where: { authorId: user.id },
      });

      // Delete staff invite codes created by this user (doesn't have cascade delete)
      await tx.staffInviteCode.deleteMany({
        where: { createdById: user.id },
      });

      // Delete revenue splits created by this user (doesn't have cascade delete)
      await tx.revenueSplit.deleteMany({
        where: { createdById: user.id },
      });

      // Delete todos created by this user (createdBy doesn't have cascade)
      await tx.todo.deleteMany({
        where: { createdById: user.id },
      });
      
      // Nullify assignedTo references in remaining todos
      await tx.todo.updateMany({
        where: { assignedToId: user.id },
        data: { assignedToId: null },
      });

      // Nullify createdBy in client tasks (nullable field)
      await tx.clientTask.updateMany({
        where: { createdById: user.id },
        data: { createdById: null },
      });

      // Nullify userId in project requests (nullable field)
      await tx.projectRequest.updateMany({
        where: { userId: user.id },
        data: { userId: null },
      });

      // Nullify activity references (userId is nullable)
      await tx.activity.updateMany({
        where: { userId: user.id },
        data: { userId: null },
      });

      // Nullify signatures (userId is nullable)
      await tx.signature.updateMany({
        where: { userId: user.id },
        data: { userId: null },
      });

      // Nullify leads (userId is nullable)
      await tx.lead.updateMany({
        where: { userId: user.id },
        data: { userId: null },
      });

      // Now delete the user (cascade will handle the rest: accounts, sessions, notifications, etc.)
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    // TODO: Send goodbye email
    // TODO: Sign out user

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}




