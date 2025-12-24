import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all connected OAuth accounts for the user
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        type: true,
      },
    });

    // Transform to a more friendly format
    const connectedAccounts = accounts.map(account => ({
      provider: account.provider,
      connected: true,
      accountId: account.providerAccountId,
    }));

    return NextResponse.json({
      accounts: connectedAccounts,
    });
  } catch (error) {
    console.error("Fetch accounts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch connected accounts" },
      { status: 500 }
    );
  }
}










