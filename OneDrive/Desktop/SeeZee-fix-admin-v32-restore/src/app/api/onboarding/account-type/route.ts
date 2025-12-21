import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accountType, role } = body;
    
    // Accept either accountType or role field
    const selectedRole = accountType || role;

    // Only allow CLIENT selection here (STAFF upgrade happens via verify-code)
    if (selectedRole !== "CLIENT") {
      return NextResponse.json(
        { error: "Only CLIENT role can be set directly. Use verify-code endpoint for STAFF roles." },
        { status: 400 }
      );
    }

    // Update user to CLIENT
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        role: "CLIENT",
      },
    });

    return NextResponse.json({
      success: true,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Error setting role:", error);
    return NextResponse.json(
      { error: "Failed to set role" },
      { status: 500 }
    );
  }
}
