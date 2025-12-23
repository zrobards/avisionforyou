import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailWithRateLimit } from "@/lib/email/send";
import { renderPasswordResetEmail } from "@/lib/email/templates/password-reset";
import crypto from "crypto";

const RESET_CODE_EXPIRY_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    // Check if email service is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset code.",
      });
    }

    // Check if user has a password (OAuth-only users can't reset password)
    if (!user.password) {
      // Still return success but don't send email
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset code.",
      });
    }

    // Generate 6-digit code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000);

    // Delete any existing password reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { 
        identifier: `password-reset:${user.email}`,
      },
    });

    // Store reset code in VerificationToken table (separate from email verification)
    await prisma.verificationToken.create({
      data: {
        identifier: `password-reset:${user.email}`,
        token: resetCode,
        expires: expiresAt,
      },
    });

    // Send email with rate limiting
    const emailResult = await sendEmailWithRateLimit(
      {
        to: user.email,
        subject: "Reset Your Password - SeeZee Studio",
        ...renderPasswordResetEmail({
          name: user.name || user.email.split("@")[0],
          resetCode,
          expiresIn: RESET_CODE_EXPIRY_MINUTES,
        }),
      },
      "password-reset"
    );

    if (!emailResult.success) {
      if (emailResult.rateLimited) {
        return NextResponse.json(
          { error: emailResult.error },
          { status: 429 }
        );
      }
      
      console.error("Failed to send password reset email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later." },
        { status: 500 }
      );
    }

    // Log the reset request (non-blocking, don't fail if logging fails)
    try {
      await prisma.systemLog.create({
        data: {
          userId: user.id,
          action: "password_reset_requested",
          entityType: "User",
          entityId: user.id,
          metadata: {
            email: user.email,
            expiresAt: expiresAt.toISOString(),
          },
        },
      });
    } catch (logError) {
      // Log to console but don't fail the request
      console.error("Failed to log password reset request:", logError);
    }

    return NextResponse.json({
      success: true,
      message: "Password reset code sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("RESEND_API_KEY")) {
        return NextResponse.json(
          { error: "Email service is not configured. Please contact support." },
          { status: 503 }
        );
      }
      if (error.message.includes("prisma") || error.message.includes("database")) {
        return NextResponse.json(
          { error: "Database error. Please try again later." },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}




