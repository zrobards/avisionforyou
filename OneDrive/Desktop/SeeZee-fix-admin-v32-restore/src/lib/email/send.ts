import { Resend } from "resend";
import { rateLimitByEmail, RateLimits, RateLimitResult } from "@/lib/rate-limit";

// Lazy initialization to avoid build-time errors when RESEND_API_KEY is not set
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:9',message:'Checking RESEND_API_KEY',data:{hasApiKey:!!apiKey,apiKeyLength:apiKey?.length||0},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!apiKey) {
      console.error("[EMAIL SEND] ❌ RESEND_API_KEY environment variable is not set");
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    console.log("[EMAIL SEND] ✅ Resend API key found, initializing Resend client");
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:35',message:'sendEmail entry',data:{to:Array.isArray(options.to)?options.to[0]:options.to,hasSubject:!!options.subject,hasHtml:!!options.html,hasText:!!options.text,hasResendKey:!!process.env.RESEND_API_KEY,resendKeyLength:process.env.RESEND_API_KEY?.length||0},sessionId:'debug-session',runId:'run1',hypothesisId:'E',timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    // Default from address - use RESEND_FROM_EMAIL env var or fallback to verified domain
    const defaultFrom = process.env.RESEND_FROM_EMAIL || "noreply@see-zee.com";
    const from = options.from || `SeeZee Studio <${defaultFrom}>`;
    
    // Get Resend instance (lazy initialization)
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:44',message:'Before getResend call',data:{from},sessionId:'debug-session',runId:'run1',hypothesisId:'E',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const resend = getResend();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:47',message:'After getResend call',data:{hasResendInstance:!!resend},sessionId:'debug-session',runId:'run1',hypothesisId:'E',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:38',message:'Before resend.emails.send',data:{from:from,to:options.to,subject:options.subject},sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Send email
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:52',message:'About to call resend.emails.send',data:{from,to:options.to,subject:options.subject},sessionId:'debug-session',runId:'run1',hypothesisId:'E',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const response = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:63',message:'After resend.emails.send',data:{hasError:!!response.error,error:response.error?response.error.message:null,hasData:!!response.data,emailId:response.data?.id},sessionId:'debug-session',runId:'run1',hypothesisId:'E',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    
    if (response.error) {
      const errorMessage = response.error.message || "Unknown error";
      console.error("[EMAIL SEND] ❌ Resend API error:", {
        error: response.error,
        message: errorMessage,
        to: options.to,
        from: from,
        subject: options.subject,
        errorType: response.error.name,
        // Check if it's a domain verification issue
        isDomainError: errorMessage.toLowerCase().includes("domain") || 
                      errorMessage.toLowerCase().includes("verify") ||
                      errorMessage.toLowerCase().includes("unauthorized"),
      });
      
      // Provide helpful error message for domain verification issues
      if (errorMessage.toLowerCase().includes("domain") || 
          errorMessage.toLowerCase().includes("verify") ||
          errorMessage.toLowerCase().includes("unauthorized")) {
        return { 
          success: false, 
          error: `Email sending failed: Domain verification required. Please verify the domain in Resend dashboard or use a verified email address. Original error: ${errorMessage}` 
        };
      }
      
      return { success: false, error: errorMessage };
    }
    
    console.log("[EMAIL SEND] ✅ Email sent successfully:", {
      to: options.to,
      from: from,
      subject: options.subject,
      emailId: response.data?.id,
    });
    
    return { success: true };
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:72',message:'sendEmail catch block',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:null,errorType:error?.constructor?.name},sessionId:'debug-session',runId:'run1',hypothesisId:'E',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[EMAIL SEND] ❌ Exception sending email:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      to: options.to,
      from: options.from || process.env.RESEND_FROM_EMAIL || "noreply@see-zee.com",
      subject: options.subject,
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      resendFromEmail: process.env.RESEND_FROM_EMAIL || "not set",
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send email with rate limiting
 */
export async function sendEmailWithRateLimit(
  options: EmailOptions,
  action: string = "email"
): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
  const emailAddress = Array.isArray(options.to) ? options.to[0] : options.to;
  
  // Check rate limit
  const rateLimit = rateLimitByEmail(emailAddress, action, RateLimits.EMAIL_VERIFY);
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email/send.ts:70',message:'Rate limit check',data:{allowed:rateLimit.allowed,resetIn:rateLimit.resetIn,emailAddress:emailAddress},sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many emails sent. Please try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
      rateLimited: true,
    };
  }
  
  return sendEmail(options);
}

/**
 * Render email HTML with common layout
 */
export function renderEmailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SeeZee Studio</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: #dc2626;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: background 0.2s;
    }
    .button:hover {
      background: #b91c1c;
    }
    .footer {
      padding: 20px 30px;
      background: #f9fafb;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #dc2626;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .button {
        display: block;
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}" class="logo">
        SeeZee Studio
      </a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>
        <strong>SeeZee Studio</strong><br>
        Accessible web development for nonprofits & mental health organizations
      </p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/privacy">Privacy Policy</a> | 
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/terms">Terms of Service</a> | 
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/contact">Contact Us</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af;">
        &copy; ${new Date().getFullYear()} SeeZee Studio. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}





