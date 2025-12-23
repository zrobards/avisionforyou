import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: passwordHash,
        name,
        role: "CLIENT", // Default role for new registrations
        emailVerified: null, // Do NOT auto-verify - user must verify email
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    const { sendEmail } = await import("@/lib/email/send");
    const { renderVerificationEmail } = await import("@/lib/email/templates/verification");
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;
    const emailTemplate = renderVerificationEmail({
      email: user.email,
      verificationUrl,
    });
    
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address - SeeZee Studio",
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the signup if email fails - user can request resend
    }

    // Log the registration
    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: "user_registered",
        entityType: "User",
        entityId: user.id,
        metadata: {
          email: user.email,
          method: "credentials",
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}








