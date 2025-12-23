import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email/send";
import { renderPasswordChangedEmail } from "@/lib/email/templates/password-changed";
import { formatDateTime } from "@/lib/format/date";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    // Validate input
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Find the password reset token
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: `password-reset:${user.email}`,
        token: code,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: resetToken.identifier,
            token: resetToken.token,
          },
        },
      });

      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    // DO NOT auto-verify email - email verification is separate from password reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        // emailVerified is NOT set here - user must verify email separately
      },
    });

    // Delete the used reset token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: resetToken.identifier,
          token: resetToken.token,
        },
      },
    });

    // Delete all user sessions for security (forces re-login)
    await prisma.userSession.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Log the password reset
    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: "password_reset_completed",
        entityType: "User",
        entityId: user.id,
        metadata: {
          email: user.email,
          timestamp: new Date().toISOString(),
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
      subject: "Password Changed Successfully - SeeZee Studio",
      html: passwordChangedEmail.html,
      text: passwordChangedEmail.text,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}




