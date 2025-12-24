import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    // Check if user has other auth methods (password or other OAuth)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Ensure user has at least one other auth method
    const hasPassword = !!user.password;
    const otherAccounts = user.accounts.filter(
      (acc) => acc.provider !== provider
    );

    if (!hasPassword && otherAccounts.length === 0) {
      return NextResponse.json(
        { error: "Cannot disconnect last authentication method. Please set a password first." },
        { status: 400 }
      );
    }

    // Delete the OAuth account
    await prisma.account.deleteMany({
      where: {
        userId: user.id,
        provider: provider,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting OAuth account:", error);
    return NextResponse.json(
      { error: "Failed to disconnect account" },
      { status: 500 }
    );
  }
}











