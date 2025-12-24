import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/auth/validation";
import { rateLimitByIP, RateLimits, createRateLimitResponse } from "@/lib/rate-limit";
import { getIPFromHeaders } from "@/lib/device/parser";

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = getIPFromHeaders(request.headers);
    
    // Check rate limit
    const rateLimit = rateLimitByIP(ip, "signup", RateLimits.SIGNUP);
    const rateLimitResponse = createRateLimitResponse(rateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = signupSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { email, password, username, tosAccepted, recaptchaToken } = validation.data;
    
    // Verify reCAPTCHA if provided
    const isDev = process.env.NODE_ENV === "development";
    if (recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const recaptchaResponse = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
          { method: "POST" }
        );
        const recaptchaData = await recaptchaResponse.json();
        
        // In development, skip reCAPTCHA if there's a browser-error (domain not configured)
        const hasBrowserError = recaptchaData['error-codes']?.includes('browser-error');
        if (isDev && hasBrowserError) {
          console.warn("⚠️ reCAPTCHA domain not configured - allowing signup in development");
        } else if (!recaptchaData.success || recaptchaData.score < 0.5) {
          return NextResponse.json(
            { error: "reCAPTCHA verification failed" },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        // Continue anyway - don't block signup if reCAPTCHA service is down
      }
    } else {
      if (isDev && !process.env.RECAPTCHA_SECRET_KEY) {
        console.log("⚠️ reCAPTCHA disabled in development (RECAPTCHA_SECRET_KEY not configured)");
      }
    }
    
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    
    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });
      
      if (existingUsername) {
        return NextResponse.json(
          { error: "This username is already taken" },
          { status: 409 }
        );
      }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user with email auto-verified
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: passwordHash,
        username: username?.toLowerCase(),
        emailVerified: new Date(), // Auto-verify email on signup
        role: "CLIENT", // Default role
      },
    });
    
    // Record TOS acceptance
    await prisma.tosAcceptance.create({
      data: {
        userId: user.id,
        version: "1.0",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}




