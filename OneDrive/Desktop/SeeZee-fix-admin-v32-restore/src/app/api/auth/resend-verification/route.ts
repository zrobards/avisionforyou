import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/encryption/crypto";
import { sendEmailWithRateLimit } from "@/lib/email/send";
import { renderVerificationEmail } from "@/lib/email/templates/verification";
import { emailSchema } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:8',message:'Resend verification POST entry',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const body = await request.json();
    const { email } = body;
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:12',message:'Request body parsed',data:{email:email},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Validate email
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:16',message:'Email validation failed',data:{email:email,errors:validation.error},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:25',message:'User lookup result',data:{userFound:!!user,emailVerified:user?.emailVerified||null},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification link has been sent.",
      });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:37',message:'Email already verified',data:{emailVerified:user.emailVerified},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }
    
    // Generate new verification token
    const verificationToken = generateToken(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:54',message:'User token updated',data:{tokenGenerated:!!verificationToken},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Send verification email with rate limiting
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;
    const emailTemplate = renderVerificationEmail({
      email: user.email,
      verificationUrl,
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:63',message:'Before sendEmailWithRateLimit',data:{hasHtml:!!emailTemplate.html,hasText:!!emailTemplate.text,to:user.email,subject:'Verify your email address - SeeZee Studio'},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const emailResult = await sendEmailWithRateLimit(
      {
        to: user.email,
        subject: "Verify your email address - SeeZee Studio",
        html: emailTemplate.html,
        text: emailTemplate.text,
      },
      "email_verification"
    );
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:73',message:'After sendEmailWithRateLimit',data:{success:emailResult.success,error:emailResult.error,rateLimited:emailResult.rateLimited},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (!emailResult.success) {
      if (emailResult.rateLimited) {
        return NextResponse.json(
          { error: emailResult.error },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resend-verification/route.ts:91',message:'Resend verification error caught',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:null},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}









