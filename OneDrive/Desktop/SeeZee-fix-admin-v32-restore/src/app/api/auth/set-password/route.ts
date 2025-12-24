import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email/send";
import { renderPasswordChangedEmail } from "@/lib/email/templates/password-changed";
import { formatDateTime } from "@/lib/format/date";

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
    const { newPassword } = body;

    // Validate input
    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
      },
    });

    // Log the password set/change
    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: user.password ? "password_changed" : "password_set",
        entityType: "User",
        entityId: user.id,
        metadata: {
          email: user.email,
          timestamp: new Date().toISOString(),
          wasOAuthOnly: !user.password,
        },
      },
    });

    // Send confirmation email
    const passwordChangedEmail = renderPasswordChangedEmail({
      name: user.name || user.email.split("@")[0],
      timestamp: formatDateTime(new Date()),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      deviceInfo: request.headers.get("user-agent") || "unknown",
    });

    await sendEmail({
      to: user.email,
      subject: user.password ? "Password Changed Successfully - SeeZee Studio" : "Password Set Successfully - SeeZee Studio",
      html: passwordChangedEmail.html,
      text: passwordChangedEmail.text,
    }).catch(err => console.error("Failed to send password changed email:", err));

    return NextResponse.json({
      success: true,
      message: "Password set successfully.",
    });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}








