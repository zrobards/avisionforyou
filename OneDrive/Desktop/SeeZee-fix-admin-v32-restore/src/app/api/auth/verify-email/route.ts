import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }
    
    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }
    
    // Check if token has expired
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email already verified",
          alreadyVerified: true,
        },
        { status: 200 }
      );
    }
    
    // Update user - mark as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
    
    // Send welcome email
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/client`;
    const welcomeEmail = renderWelcomeEmail({
      name: user.name || user.email,
      dashboardUrl,
    });
    
    await sendEmail({
      to: user.email,
      subject: "Welcome to SeeZee Studio!",
      html: welcomeEmail.html,
      text: welcomeEmail.text,
    });
    
    // After verification, redirect to login
    // Middleware will handle redirecting to appropriate onboarding step after login
    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Please log in to continue.",
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}





