import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/auth/validation";
import { sendEmail } from "@/lib/email/send";
import { renderPasswordChangedEmail } from "@/lib/email/templates/password-changed";
import { formatDateTime } from "@/lib/format/date";
import { getIPFromHeaders, getDeviceDescription } from "@/lib/device/parser";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { currentPassword, newPassword } = validation.data;
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if user has a password (OAuth-only users don't)
    if (!user.password) {
      return NextResponse.json(
        { error: "Cannot change password for OAuth-only accounts. Please set a password first." },
        { status: 400 }
      );
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
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
    
    // Get device info for email
    const userAgent = request.headers.get("user-agent") || "";
    const deviceInfo = getDeviceDescription(userAgent);
    const ip = getIPFromHeaders(request.headers);
    
    // Send notification email
    const passwordChangedEmail = renderPasswordChangedEmail({
      name: user.name || user.email,
      timestamp: formatDateTime(new Date()),
      ipAddress: ip,
      deviceInfo,
    });
    
    await sendEmail({
      to: user.email,
      subject: "Password changed - SeeZee Studio",
      html: passwordChangedEmail.html,
      text: passwordChangedEmail.text,
    });
    
    // TODO: Revoke all other sessions for security
    // This would require implementing session management
    
    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}










