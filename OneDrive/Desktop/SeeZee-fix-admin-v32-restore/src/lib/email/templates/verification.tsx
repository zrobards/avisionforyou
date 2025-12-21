import { renderEmailLayout } from "../send";

export interface VerificationEmailProps {
  email: string;
  verificationUrl: string;
  expiresIn?: string;
}

export function renderVerificationEmail({
  email,
  verificationUrl,
  expiresIn = "24 hours",
}: VerificationEmailProps): { html: string; text: string } {
  const html = renderEmailLayout(`
    <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #111827;">
      Verify Your Email Address
    </h1>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Hi there!
    </p>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Thanks for signing up for SeeZee Studio! To complete your registration, please verify your email address by clicking the button below:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="button" style="background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-weight: 600;">
        Verify Your Email
      </a>
    </div>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Or copy and paste this link into your browser:
    </p>
    
    <p style="margin: 0 0 20px 0; padding: 12px; background: #f3f4f6; border-radius: 6px; font-size: 14px; word-break: break-all; color: #6b7280;">
      ${verificationUrl}
    </p>
    
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
      <strong>Note:</strong> This link will expire in ${expiresIn}. If you didn't create an account with SeeZee Studio, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="margin: 0; font-size: 14px; color: #6b7280;">
      Need help? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/support" style="color: #dc2626; text-decoration: none;">Contact our support team</a>
    </p>
  `);
  
  const text = `
Verify Your Email Address

Hi there!

Thanks for signing up for SeeZee Studio! To complete your registration, please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in ${expiresIn}. If you didn't create an account with SeeZee Studio, you can safely ignore this email.

Need help? Contact our support team at ${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/support

--
SeeZee Studio
Accessible web development for nonprofits & mental health organizations
  `.trim();
  
  return { html, text };
}




