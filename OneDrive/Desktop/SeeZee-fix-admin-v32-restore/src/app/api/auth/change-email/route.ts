import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { changeEmailSchema } from "@/lib/auth/validation";
import { generateToken } from "@/lib/encryption/crypto";
import { sendEmail } from "@/lib/email/send";
import { renderVerificationEmail } from "@/lib/email/templates/verification";
import { renderEmailChangedEmail } from "@/lib/email/templates/email-changed";
import { formatDateTime } from "@/lib/format/date";

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
    const validation = changeEmailSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { newEmail, password } = validation.data;
    
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
    
    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: "Cannot change email for OAuth-only accounts" },
        { status: 400 }
      );
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 }
      );
    }
    
    // Check if new email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
    });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 409 }
      );
    }
    
    // Generate verification token for new email
    const verificationToken = generateToken(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store old email for notification
    const oldEmail = user.email;
    
    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newEmail.toLowerCase(),
        emailVerified: null, // Require verification of new email
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });
    
    // Send verification email to new address
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;
    const verificationEmail = renderVerificationEmail({
      email: newEmail,
      verificationUrl,
    });
    
    await sendEmail({
      to: newEmail,
      subject: "Verify your new email address - SeeZee Studio",
      html: verificationEmail.html,
      text: verificationEmail.text,
    });
    
    // Send notification to old email
    const notificationEmail = renderEmailChangedEmail({
      name: user.name || "User",
      oldEmail,
      newEmail,
      timestamp: formatDateTime(new Date()),
    });
    
    await sendEmail({
      to: oldEmail,
      subject: "Email address changed - SeeZee Studio",
      html: notificationEmail.html,
      text: notificationEmail.text,
    });
    
    return NextResponse.json({
      success: true,
      message: "Email changed successfully. Please verify your new email address.",
    });
  } catch (error) {
    console.error("Change email error:", error);
    return NextResponse.json(
      { error: "Failed to change email" },
      { status: 500 }
    );
  }
}










