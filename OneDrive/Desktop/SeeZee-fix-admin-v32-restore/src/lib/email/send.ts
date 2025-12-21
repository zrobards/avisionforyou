import { Resend } from "resend";
import { rateLimitByEmail, RateLimits, RateLimitResult } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  try {
    // Default from address
    const from = options.from || "SeeZee Studio <noreply@see-zee.com>";
    
    // Send email
    const response = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });
    
    if (response.error) {
      console.error("Email send error:", response.error);
      return { success: false, error: response.error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
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




