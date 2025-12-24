// Node.js runtime only - for sending emails
import { Resend } from "resend";

interface SendInviteEmailParams {
  to: string;
  code: string;
  role: string;
  signinUrl: string;
  expiresAt: Date;
}

export async function sendInviteEmail({
  to,
  code,
  role,
  signinUrl,
  expiresAt,
}: SendInviteEmailParams) {
  // Initialize Resend client
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your SeeZee Worker Invite</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #06b6d4; font-size: 32px; margin: 0;">SeeZee</h1>
            <p style="color: #94a3b8; margin-top: 8px;">Web Agency Platform</p>
          </div>

          <!-- Main Card -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; backdrop-filter: blur(10px);">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">You've Been Invited!</h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              You've been invited to join SeeZee as a <strong style="color: #06b6d4;">${role}</strong>.
            </p>

            <!-- Code Display -->
            <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Your 6-Digit Code</p>
              <p style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                ${code}
              </p>
            </div>

            <!-- Instructions -->
            <div style="background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>How to join:</strong><br>
                1. Click the button below to sign in with Google<br>
                2. Choose "Worker" as your account type<br>
                3. Enter this 6-digit code when prompted<br>
                4. Complete the onboarding process
              </p>
            </div>

            <!-- Sign In Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${signinUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Sign In with Google
              </a>
            </div>

            <!-- Expiration Notice -->
            <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
              This code expires on <strong style="color: #cbd5e1;">${expiresAt.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</strong> and can be used once.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
            <p style="color: #475569; font-size: 11px; margin: 16px 0 0 0;">
              © ${new Date().getFullYear()} SeeZee. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Your SeeZee Worker Invite
    
    You've been invited to join SeeZee as a ${role}.
    
    Your 6-digit code: ${code}
    
    How to join:
    1. Visit ${signinUrl} and sign in with Google
    2. Choose "Worker" as your account type
    3. Enter this 6-digit code when prompted
    4. Complete the onboarding process
    
    This code expires on ${expiresAt.toDateString()} and can be used once.
    
    If you didn't expect this invitation, you can safely ignore this email.
  `;

  // Use RESEND_FROM_EMAIL or fallback to verified domain
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@see-zee.com";
  
  await resend.emails.send({
    from: `SeeZee Team <${fromEmail}>`,
    to,
    subject: "Your SeeZee Worker Invitation",
    text,
    html,
  });
}

interface WelcomeEmailParams {
  to: string;
  firstName: string;
  dashboardUrl: string;
}

export async function sendWelcomeEmail({
  to,
  firstName,
  dashboardUrl,
}: WelcomeEmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SeeZee Studio</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #ef4444; font-size: 32px; margin: 0;">SeeZee Studio</h1>
          </div>

          <!-- Main Card -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; backdrop-filter: blur(10px);">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Welcome to SeeZee Studio! 🎉</h2>
            
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Hi ${firstName},
            </p>
            
            <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
                We're excited to help you build your website! Your project inquiry has been received 
                and we're ready to get started.
              </p>
            </div>

            <h3 style="color: #ffffff; font-size: 18px; margin: 32px 0 16px 0;">Your Project Portal</h3>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Access your dashboard to track your project and complete your project brief:
            </p>
            
            <!-- Dashboard Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${dashboardUrl}" style="display: inline-block; background: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Dashboard →
              </a>
            </div>

            <h3 style="color: #ffffff; font-size: 18px; margin: 32px 0 16px 0;">Next Step: Complete Your Project Brief</h3>
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 24px;">
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                Once you log in, you'll see a prompt to complete your detailed project brief. 
                This helps us understand exactly what you need so we can create an accurate quote.
              </p>
              <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>⏱️ Takes about 10-15 minutes</li>
                <li>💰 You'll receive a custom quote within 24 hours</li>
                <li>📱 Track everything through your dashboard</li>
              </ul>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
                Questions? Reply to this email anytime. We're here to help!
              </p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0;">
                - Sean & Zach<br>
                <span style="color: #94a3b8;">SeeZee Studio</span><br>
                <a href="https://see-zee.com" style="color: #ef4444; text-decoration: none;">see-zee.com</a>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #475569; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} SeeZee Studio. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Use RESEND_FROM_EMAIL or fallback to verified domain
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@see-zee.com";
  
  const result = await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Welcome to SeeZee Studio! 🎉',
    html,
  });

  return result;
}
